import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

interface Room {
  pin: string;
  peers: Map<string, WebSocket>;
  createdAt: number;
}

interface RateLimitEntry {
  attempts: number;
  lockedUntil: number | null;
}

const rooms = new Map<string, Room>();
const ROOM_CAPACITY = 4;
const ROOM_EXPIRATION_MS = 4 * 60 * 60 * 1000; // 4 hours
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

// Rate limiting by IP/connection
const rateLimitMap = new Map<string, RateLimitEntry>();

// Single family room lock - once 2 users connect, this PIN becomes the only allowed room
let lockedPin: string | null = null;
let lockedRoomCreatedAt: number | null = null;

// Check and expire old rooms periodically
function checkRoomExpiration() {
  const now = Date.now();
  
  // Check if locked room has expired
  if (lockedPin && lockedRoomCreatedAt) {
    if (now - lockedRoomCreatedAt >= ROOM_EXPIRATION_MS) {
      const room = rooms.get(lockedPin);
      if (room) {
        // Notify all peers and close connections
        room.peers.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ 
              type: "session-expired",
              message: "Session expired after 4 hours. Please start a new session."
            }));
            ws.close();
          }
        });
        rooms.delete(lockedPin);
        console.log(`Room expired after 4 hours: ${lockedPin}`);
      }
      lockedPin = null;
      lockedRoomCreatedAt = null;
    }
  }
  
  // Clean up old rate limit entries
  rateLimitMap.forEach((entry, key) => {
    if (entry.lockedUntil && now > entry.lockedUntil) {
      rateLimitMap.delete(key);
    }
  });
}

// Run expiration check every minute
setInterval(checkRoomExpiration, 60 * 1000);

function checkRateLimit(connectionId: string): { allowed: boolean; error?: string; remainingTime?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(connectionId);
  
  if (entry) {
    // Check if currently locked out
    if (entry.lockedUntil && now < entry.lockedUntil) {
      const remainingSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
      return { 
        allowed: false, 
        error: `Too many failed attempts. Please wait ${remainingSeconds} seconds.`,
        remainingTime: remainingSeconds
      };
    }
    
    // Reset if lockout has expired
    if (entry.lockedUntil && now >= entry.lockedUntil) {
      rateLimitMap.delete(connectionId);
    }
  }
  
  return { allowed: true };
}

function recordFailedAttempt(connectionId: string): void {
  const entry = rateLimitMap.get(connectionId) || { attempts: 0, lockedUntil: null };
  entry.attempts++;
  
  if (entry.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + RATE_LIMIT_LOCKOUT_MS;
    console.log(`Rate limit lockout for connection: ${connectionId}`);
  }
  
  rateLimitMap.set(connectionId, entry);
}

function clearRateLimit(connectionId: string): void {
  rateLimitMap.delete(connectionId);
}

function getOrCreateRoom(pin: string): Room {
  if (!rooms.has(pin)) {
    rooms.set(pin, { pin, peers: new Map(), createdAt: Date.now() });
  }
  return rooms.get(pin)!;
}

function canJoinRoom(pin: string): { allowed: boolean; error?: string } {
  // If no room is locked yet, any PIN can create/join a room
  if (lockedPin === null) {
    return { allowed: true };
  }
  
  // If a room is locked, only the locked PIN is allowed
  if (pin !== lockedPin) {
    return { 
      allowed: false, 
      error: "A family session is already active. Please use the correct PIN to join." 
    };
  }
  
  // Check if the locked room is at capacity
  const room = rooms.get(lockedPin);
  if (room && room.peers.size >= ROOM_CAPACITY) {
    return { 
      allowed: false, 
      error: "Room is full. Maximum 4 players allowed." 
    };
  }
  
  return { allowed: true };
}

function lockRoomIfNeeded(pin: string) {
  const room = rooms.get(pin);
  // Lock the room once 2 or more users are connected
  if (room && room.peers.size >= 2 && lockedPin === null) {
    lockedPin = pin;
    lockedRoomCreatedAt = room.createdAt;
    console.log(`Room locked to PIN: ${pin}`);
  }
}

function unlockRoomIfEmpty(pin: string) {
  // If the locked room is being deleted, unlock the system
  if (lockedPin === pin && !rooms.has(pin)) {
    lockedPin = null;
    lockedRoomCreatedAt = null;
    console.log("Room unlocked - family session ended");
  }
}

function removeFromRoom(pin: string, peerId: string) {
  const room = rooms.get(pin);
  if (room) {
    room.peers.delete(peerId);
    if (room.peers.size === 0) {
      rooms.delete(pin);
      unlockRoomIfEmpty(pin);
    } else {
      room.peers.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "peer-left", peerId }));
        }
      });
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    let currentPin: string | null = null;
    let currentPeerId: string | null = null;
    
    // Get client IP for rate limiting (use X-Forwarded-For if behind proxy, otherwise use socket address)
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
      || req.socket.remoteAddress 
      || 'unknown';

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "join": {
            const { pin, peerId } = message;
            
            if (!pin || !/^\d{6}$/.test(pin)) {
              ws.send(JSON.stringify({
                type: "joined",
                success: false,
                error: "Invalid PIN. Please use 6 digits.",
              }));
              return;
            }

            // Check rate limiting using client IP
            const rateLimitCheck = checkRateLimit(clientIp);
            if (!rateLimitCheck.allowed) {
              ws.send(JSON.stringify({
                type: "joined",
                success: false,
                error: rateLimitCheck.error,
              }));
              return;
            }

            // Check if this PIN can join (single room restriction)
            const joinCheck = canJoinRoom(pin);
            if (!joinCheck.allowed) {
              // Record failed attempt for rate limiting (wrong PIN when room is locked)
              recordFailedAttempt(clientIp);
              ws.send(JSON.stringify({
                type: "joined",
                success: false,
                error: joinCheck.error,
              }));
              return;
            }

            // Clear rate limit on successful join
            clearRateLimit(clientIp);

            currentPin = pin;
            currentPeerId = peerId;

            const room = getOrCreateRoom(pin);
            
            room.peers.forEach((peerWs, existingPeerId) => {
              if (peerWs.readyState === WebSocket.OPEN) {
                peerWs.send(JSON.stringify({
                  type: "peer-joined",
                  peerId,
                }));
              }
            });

            room.peers.set(peerId, ws);
            
            // Lock the room once 2 users are connected
            lockRoomIfNeeded(pin);

            ws.send(JSON.stringify({
              type: "joined",
              success: true,
              roomSize: room.peers.size,
            }));
            break;
          }

          case "offer":
          case "answer":
          case "ice-candidate": {
            if (!currentPin) return;
            const room = rooms.get(currentPin);
            if (!room) return;

            const targetWs = room.peers.get(message.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                ...message,
                from: currentPeerId,
              }));
            }
            break;
          }
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });

    ws.on("close", () => {
      if (currentPin && currentPeerId) {
        removeFromRoom(currentPin, currentPeerId);
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
      if (currentPin && currentPeerId) {
        removeFromRoom(currentPin, currentPeerId);
      }
    });
  });

  return httpServer;
}

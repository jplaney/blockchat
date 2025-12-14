import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

interface Room {
  pin: string;
  peers: Map<string, WebSocket>;
}

const rooms = new Map<string, Room>();
const ROOM_CAPACITY = 4;

// Single family room lock - once 2 users connect, this PIN becomes the only allowed room
let lockedPin: string | null = null;

function getOrCreateRoom(pin: string): Room {
  if (!rooms.has(pin)) {
    rooms.set(pin, { pin, peers: new Map() });
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
    console.log(`Room locked to PIN: ${pin}`);
  }
}

function unlockRoomIfEmpty(pin: string) {
  // If the locked room is being deleted, unlock the system
  if (lockedPin === pin && !rooms.has(pin)) {
    lockedPin = null;
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

  wss.on("connection", (ws) => {
    let currentPin: string | null = null;
    let currentPeerId: string | null = null;

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "join": {
            const { pin, peerId } = message;
            
            if (!pin || !/^\d{4}$/.test(pin)) {
              ws.send(JSON.stringify({
                type: "joined",
                success: false,
                error: "Invalid PIN. Please use 4 digits.",
              }));
              return;
            }

            // Check if this PIN can join (single room restriction)
            const joinCheck = canJoinRoom(pin);
            if (!joinCheck.allowed) {
              ws.send(JSON.stringify({
                type: "joined",
                success: false,
                error: joinCheck.error,
              }));
              return;
            }

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

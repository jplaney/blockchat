import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

interface Room {
  pin: string;
  peers: Map<string, WebSocket>;
}

const rooms = new Map<string, Room>();

function getOrCreateRoom(pin: string): Room {
  if (!rooms.has(pin)) {
    rooms.set(pin, { pin, peers: new Map() });
  }
  return rooms.get(pin)!;
}

function removeFromRoom(pin: string, peerId: string) {
  const room = rooms.get(pin);
  if (room) {
    room.peers.delete(peerId);
    if (room.peers.size === 0) {
      rooms.delete(pin);
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

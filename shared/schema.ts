import { z } from "zod";

// PIN validation schema
export const pinSchema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/, "PIN must be 4 digits"),
});

export type PinInput = z.infer<typeof pinSchema>;

// WebSocket message types
export type SignalingMessage =
  | { type: "join"; pin: string; peerId: string }
  | { type: "joined"; success: boolean; error?: string; roomSize: number }
  | { type: "peer-joined"; peerId: string }
  | { type: "peer-left"; peerId: string }
  | { type: "offer"; offer: RTCSessionDescriptionInit; from: string }
  | { type: "answer"; answer: RTCSessionDescriptionInit; from: string }
  | { type: "ice-candidate"; candidate: RTCIceCandidateInit; from: string };

// Connection states for UI
export type ConnectionStatus = 
  | "disconnected" 
  | "connecting" 
  | "waiting" 
  | "connected" 
  | "reconnecting";

// Voice chat state
export interface VoiceChatState {
  status: ConnectionStatus;
  isMuted: boolean;
  volume: number;
  audioLevel: number;
  peerConnected: boolean;
  error?: string;
}

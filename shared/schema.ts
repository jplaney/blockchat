import { z } from "zod";

// PIN validation schema
export const pinSchema = z.object({
  pin: z.string().length(6).regex(/^\d{6}$/, "PIN must be 6 digits"),
});

export type PinInput = z.infer<typeof pinSchema>;

// Avatar options for players
export const AVATAR_OPTIONS = [
  { id: 'steve', name: 'Steve', color: '#4a90d9' },
  { id: 'alex', name: 'Alex', color: '#e67e22' },
  { id: 'zombie', name: 'Zombie', color: '#27ae60' },
  { id: 'creeper', name: 'Creeper', color: '#2ecc71' },
  { id: 'enderman', name: 'Enderman', color: '#9b59b6' },
  { id: 'skeleton', name: 'Skeleton', color: '#95a5a6' },
] as const;

export type AvatarId = typeof AVATAR_OPTIONS[number]['id'];

// Peer info shared between users
export interface PeerInfo {
  peerId: string;
  nickname: string;
  avatar: AvatarId;
}

// WebSocket message types
export type SignalingMessage =
  | { type: "join"; pin: string; peerId: string; nickname: string; avatar: AvatarId }
  | { type: "joined"; success: boolean; error?: string; roomSize: number; existingPeers?: PeerInfo[] }
  | { type: "peer-joined"; peerId: string; nickname: string; avatar: AvatarId }
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

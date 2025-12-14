import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Users } from "lucide-react";
import type { ConnectionStatus, SignalingMessage } from "@shared/schema";
import minecraftCharacters from "@assets/generated_images/minecraft_characters_chatting_together.png";
import minecraftMic from "@assets/generated_images/pixel_art_microphone_icon.png";
import minecraftGrass from "@assets/generated_images/minecraft_grass_block_pattern.png";

function PinEntry({ onSubmit, error, initialPin }: { onSubmit: (pin: string) => void; error?: string; initialPin?: string }) {
  const [pin, setPin] = useState(() => {
    if (initialPin && /^\d{4}$/.test(initialPin)) {
      return initialPin.split("");
    }
    return ["", "", "", ""];
  });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autoJoinedRef = useRef(false);

  useEffect(() => {
    if (initialPin && /^\d{4}$/.test(initialPin) && !autoJoinedRef.current) {
      autoJoinedRef.current = true;
      onSubmit(initialPin);
    }
  }, [initialPin, onSubmit]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && pin.every(d => d)) {
      onSubmit(pin.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const newPin = [...pin];
    for (let i = 0; i < pastedData.length; i++) {
      newPin[i] = pastedData[i];
    }
    setPin(newPin);
    if (pastedData.length === 4) {
      inputRefs.current[3]?.focus();
    }
  };

  const isComplete = pin.every(d => d);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${minecraftGrass})`,
        backgroundSize: '120px 120px',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/80 to-sky-600/80 dark:from-sky-900/90 dark:to-slate-900/95" />
      <Card className="w-full max-w-md relative z-10 border-4 border-amber-800 dark:border-amber-900 bg-amber-50/95 dark:bg-stone-800/95">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <img 
              src={minecraftCharacters} 
              alt="Minecraft characters chatting" 
              className="w-full max-w-xs mx-auto rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />
            <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100" style={{ fontFamily: "'Press Start 2P', monospace, system-ui" }}>
              Family Voice Chat
            </h1>
            <p className="text-amber-700 dark:text-amber-300 text-sm">Enter your 4-digit PIN to join</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Up to 4 players can join!</p>
          </div>

          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                data-testid={`input-pin-${index}`}
                className="w-14 h-16 text-center text-2xl font-bold border-4 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100 border-stone-400 dark:border-stone-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition-all"
                style={{ 
                  fontFamily: "'Press Start 2P', monospace, system-ui",
                  borderRadius: '0px'
                }}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-red-600 dark:text-red-400 text-sm font-medium" data-testid="text-error">
              {error}
            </p>
          )}

          <Button
            onClick={() => onSubmit(pin.join(""))}
            disabled={!isComplete}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 border-4 border-green-800 text-white font-bold"
            data-testid="button-join"
            style={{ borderRadius: '0px' }}
          >
            <Phone className="w-5 h-5 mr-2" />
            Join Game
          </Button>

          <p className="text-center text-xs text-amber-600 dark:text-amber-400">
            Press <kbd className="px-1.5 py-0.5 bg-stone-300 dark:bg-stone-600 text-stone-700 dark:text-stone-200 font-mono border-2 border-stone-400 dark:border-stone-500" style={{ borderRadius: '0px' }}>Enter</kbd> to join
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AudioLevelMeter({ level }: { level: number }) {
  const bars = 7;
  return (
    <div className="flex items-end justify-center gap-1 h-12" data-testid="audio-level-meter">
      {Array.from({ length: bars }).map((_, i) => {
        const threshold = (i + 1) / bars;
        const isActive = level >= threshold;
        const height = 20 + (i * 8);
        return (
          <div
            key={i}
            className={`w-4 transition-all duration-75 ${
              isActive ? "bg-green-500" : "bg-stone-400 dark:bg-stone-600"
            }`}
            style={{ height: `${height}%`, borderRadius: '0px' }}
          />
        );
      })}
    </div>
  );
}

function StatusIndicator({ status, connectedPeers }: { status: ConnectionStatus; connectedPeers: number }) {
  const getStatusConfig = () => {
    if (status === "disconnected") {
      return { text: "Not Connected", color: "text-stone-500", pulse: false };
    }
    if (status === "connecting") {
      return { text: "Connecting...", color: "text-amber-600 dark:text-amber-400", pulse: true };
    }
    if (status === "reconnecting") {
      return { text: "Reconnecting...", color: "text-amber-600 dark:text-amber-400", pulse: true };
    }
    if (status === "waiting" || (status === "connected" && connectedPeers === 0)) {
      return { text: "Waiting for players...", color: "text-amber-600 dark:text-amber-400", pulse: true };
    }
    if (connectedPeers === 1) {
      return { text: "1 player connected", color: "text-green-600 dark:text-green-400", pulse: false };
    }
    return { text: `${connectedPeers} players connected`, color: "text-green-600 dark:text-green-400", pulse: false };
  };

  const { text, color, pulse } = getStatusConfig();

  return (
    <div className="flex items-center justify-center gap-3" data-testid="status-indicator">
      <div className="relative flex h-3 w-3">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full opacity-75 ${
            connectedPeers > 0 ? "bg-green-400" : "bg-amber-400"
          }`} style={{ borderRadius: '0px' }}></span>
        )}
        <span className={`relative inline-flex h-3 w-3 ${
          status === "disconnected" ? "bg-stone-400" :
          connectedPeers > 0 ? "bg-green-500" : "bg-amber-500"
        }`} style={{ borderRadius: '0px' }}></span>
      </div>
      <span className={`text-base font-medium ${color}`} data-testid="text-status">
        {text}
      </span>
    </div>
  );
}

function ParticipantIndicator({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300" data-testid="participant-count">
      <Users className="w-4 h-4" />
      <span className="text-sm font-medium">{count}/4 players in room</span>
    </div>
  );
}

function VoiceChatInterface({
  status,
  isMuted,
  volume,
  audioLevel,
  connectedPeers,
  totalInRoom,
  onMuteToggle,
  onVolumeChange,
  onDisconnect,
}: {
  status: ConnectionStatus;
  isMuted: boolean;
  volume: number;
  audioLevel: number;
  connectedPeers: number;
  totalInRoom: number;
  onMuteToggle: () => void;
  onVolumeChange: (value: number) => void;
  onDisconnect: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        onMuteToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onMuteToggle]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${minecraftGrass})`,
        backgroundSize: '120px 120px',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/80 to-sky-600/80 dark:from-sky-900/90 dark:to-slate-900/95" />
      <Card className="w-full max-w-md relative z-10 border-4 border-amber-800 dark:border-amber-900 bg-amber-50/95 dark:bg-stone-800/95">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className={`w-24 h-24 mx-auto flex items-center justify-center transition-all ${
              connectedPeers > 0 ? "bg-green-500/20" : "bg-stone-300 dark:bg-stone-700"
            }`} style={{ borderRadius: '0px' }}>
              <img 
                src={minecraftMic} 
                alt="Microphone" 
                className={`w-16 h-16 ${isMuted ? 'opacity-50 grayscale' : ''}`}
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100" style={{ fontFamily: "'Press Start 2P', monospace, system-ui" }}>
              Voice Chat
            </h1>
            <StatusIndicator status={status} connectedPeers={connectedPeers} />
            <ParticipantIndicator count={totalInRoom} />
          </div>

          <div className="py-4">
            <AudioLevelMeter level={isMuted ? 0 : audioLevel} />
          </div>

          <Button
            onClick={onMuteToggle}
            className={`w-full h-16 text-lg gap-3 border-4 font-bold ${
              isMuted 
                ? "bg-red-600 hover:bg-red-700 border-red-800 text-white" 
                : "bg-green-600 hover:bg-green-700 border-green-800 text-white"
            }`}
            data-testid="button-mute"
            style={{ borderRadius: '0px' }}
          >
            {isMuted ? (
              <>
                <MicOff className="w-6 h-6" />
                <span>Unmute</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                <span>Mute</span>
              </>
            )}
          </Button>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <VolumeX className="w-5 h-5 text-amber-700 dark:text-amber-300 flex-shrink-0" />
              <Slider
                value={[volume]}
                onValueChange={(v) => onVolumeChange(v[0])}
                max={100}
                step={1}
                className="flex-1"
                data-testid="slider-volume"
              />
              <Volume2 className="w-5 h-5 text-amber-700 dark:text-amber-300 flex-shrink-0" />
            </div>
            <p className="text-center text-sm text-amber-700 dark:text-amber-300 font-medium">
              Volume: {volume}%
            </p>
          </div>

          <div className="pt-4 border-t-4 border-amber-300 dark:border-stone-600">
            <Button
              onClick={onDisconnect}
              className="w-full gap-2 bg-stone-500 hover:bg-stone-600 border-4 border-stone-700 text-white font-bold"
              data-testid="button-disconnect"
              style={{ borderRadius: '0px' }}
            >
              <PhoneOff className="w-5 h-5" />
              <span>Leave Game</span>
            </Button>
          </div>

          <p className="text-center text-xs text-amber-600 dark:text-amber-400">
            Press <kbd className="px-1.5 py-0.5 bg-stone-300 dark:bg-stone-600 text-stone-700 dark:text-stone-200 font-mono border-2 border-stone-400 dark:border-stone-500" style={{ borderRadius: '0px' }}>Space</kbd> to toggle mute
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface PeerConnection {
  pc: RTCPeerConnection;
  audioElement: HTMLAudioElement;
}

export default function VoiceChat() {
  const [isJoined, setIsJoined] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectedPeers, setConnectedPeers] = useState(0);
  const [totalInRoom, setTotalInRoom] = useState(1);

  const urlPin = new URLSearchParams(window.location.search).get("pin") || undefined;

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContainerRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const peerIdRef = useRef<string>("");
  const reconnectTimeoutRef = useRef<number>(0);
  const isJoinedRef = useRef(false);
  const shouldReconnectRef = useRef(true);
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = volume;
    peerConnectionsRef.current.forEach(({ audioElement }) => {
      audioElement.volume = volume / 100;
    });
  }, [volume]);

  const updateConnectionCount = useCallback(() => {
    let connected = 0;
    peerConnectionsRef.current.forEach(({ pc }) => {
      if (pc.connectionState === "connected") {
        connected++;
      }
    });
    setConnectedPeers(connected);
    setTotalInRoom(peerConnectionsRef.current.size + 1);
    
    if (connected > 0) {
      setStatus("connected");
    } else if (peerConnectionsRef.current.size > 0) {
      setStatus("connecting");
    } else {
      setStatus("waiting");
    }
  }, []);

  const cleanupWebRTC = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    peerConnectionsRef.current.forEach(({ pc, audioElement }) => {
      pc.close();
      audioElement.remove();
    });
    peerConnectionsRef.current.clear();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setConnectedPeers(0);
    setTotalInRoom(1);
  }, []);

  const setupAudioAnalyzer = useCallback((stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(Math.min(average / 128, 1));
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();
  }, []);

  const createPeerConnection = useCallback((remotePeerId: string): RTCPeerConnection => {
    if (peerConnectionsRef.current.has(remotePeerId)) {
      const existing = peerConnectionsRef.current.get(remotePeerId)!;
      existing.pc.close();
      existing.audioElement.remove();
      peerConnectionsRef.current.delete(remotePeerId);
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    const audioElement = document.createElement("audio");
    audioElement.autoplay = true;
    audioElement.setAttribute("playsinline", "true");
    audioElement.volume = volumeRef.current / 100;
    audioContainerRef.current?.appendChild(audioElement);

    peerConnectionsRef.current.set(remotePeerId, { pc, audioElement });

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate.toJSON(),
          to: remotePeerId,
        }));
      }
    };

    pc.ontrack = (event) => {
      audioElement.srcObject = event.streams[0];
    };

    pc.onconnectionstatechange = () => {
      updateConnectionCount();
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    updateConnectionCount();
    return pc;
  }, [updateConnectionCount]);

  const removePeer = useCallback((peerId: string) => {
    const peerData = peerConnectionsRef.current.get(peerId);
    if (peerData) {
      peerData.pc.close();
      peerData.audioElement.remove();
      peerConnectionsRef.current.delete(peerId);
      updateConnectionCount();
    }
  }, [updateConnectionCount]);

  const handleJoin = useCallback(async (enteredPin: string) => {
    setError(undefined);
    setStatus("connecting");
    setPin(enteredPin);
    shouldReconnectRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localStreamRef.current = stream;
      setupAudioAnalyzer(stream);

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      peerIdRef.current = crypto.randomUUID();

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: "join",
          pin: enteredPin,
          peerId: peerIdRef.current,
        }));
      };

      ws.onmessage = async (event) => {
        const message: SignalingMessage = JSON.parse(event.data);

        switch (message.type) {
          case "joined":
            if (message.success) {
              isJoinedRef.current = true;
              setIsJoined(true);
              setTotalInRoom(message.roomSize);
              setStatus(message.roomSize > 1 ? "connected" : "waiting");
            } else {
              setError(message.error || "Failed to join");
              setStatus("disconnected");
              cleanupWebRTC();
            }
            break;

          case "peer-joined": {
            const pc = createPeerConnection(message.peerId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({
              type: "offer",
              offer: offer,
              to: message.peerId,
            }));
            break;
          }

          case "offer": {
            const pc = createPeerConnection(message.from);
            await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({
              type: "answer",
              answer: answer,
              to: message.from,
            }));
            break;
          }

          case "answer": {
            const peerData = peerConnectionsRef.current.get(message.from);
            if (peerData) {
              await peerData.pc.setRemoteDescription(new RTCSessionDescription(message.answer));
            }
            break;
          }

          case "ice-candidate": {
            const peerData = peerConnectionsRef.current.get(message.from);
            if (peerData) {
              await peerData.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
            break;
          }

          case "peer-left":
            removePeer(message.peerId);
            break;
        }
      };

      ws.onclose = () => {
        if (isJoinedRef.current && shouldReconnectRef.current) {
          setStatus("reconnecting");
          reconnectTimeoutRef.current = window.setTimeout(() => {
            handleJoin(enteredPin);
          }, 3000);
        }
      };

      ws.onerror = () => {
        setError("Connection error. Please try again.");
        setStatus("disconnected");
      };

    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access and try again.");
      } else {
        setError("Failed to start voice chat. Please check your microphone.");
      }
      setStatus("disconnected");
      cleanupWebRTC();
    }
  }, [cleanupWebRTC, createPeerConnection, removePeer, setupAudioAnalyzer]);

  const handleDisconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    cleanupWebRTC();
    isJoinedRef.current = false;
    shouldReconnectRef.current = false;
    setIsJoined(false);
    setStatus("disconnected");
    setConnectedPeers(0);
    setTotalInRoom(1);
    setAudioLevel(0);
    setPin("");
  }, [cleanupWebRTC]);

  const handleMuteToggle = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((value: number) => {
    setVolume(value);
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      cleanupWebRTC();
    };
  }, [cleanupWebRTC]);

  return (
    <>
      <div ref={audioContainerRef} style={{ display: "none" }} />
      {!isJoined ? (
        <PinEntry onSubmit={handleJoin} error={error} initialPin={urlPin} />
      ) : (
        <VoiceChatInterface
          status={status}
          isMuted={isMuted}
          volume={volume}
          audioLevel={audioLevel}
          connectedPeers={connectedPeers}
          totalInRoom={totalInRoom}
          onMuteToggle={handleMuteToggle}
          onVolumeChange={handleVolumeChange}
          onDisconnect={handleDisconnect}
        />
      )}
    </>
  );
}

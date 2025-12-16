import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Users, Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh, Share2, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import type { ConnectionStatus, SignalingMessage, AvatarId, PeerInfo } from "@shared/schema";
import { AVATAR_OPTIONS } from "@shared/schema";
import minecraftCharacters from "@assets/generated_images/minecraft_characters_chatting_together.png";
import minecraftMic from "@assets/generated_images/pixel_art_microphone_icon.png";
import minecraftGrass from "@assets/generated_images/minecraft_grass_block_pattern.png";
import avatarSteve from "@assets/generated_images/pixelated_steve_head_portrait.png";
import avatarAlex from "@assets/generated_images/pixelated_alex_head_portrait.png";
import avatarZombie from "@assets/generated_images/pixelated_zombie_head_portrait.png";
import avatarCreeper from "@assets/generated_images/pixelated_creeper_head_portrait.png";
import avatarEnderman from "@assets/generated_images/pixelated_enderman_head_portrait.png";
import avatarSkeleton from "@assets/generated_images/pixelated_skeleton_head_portrait.png";

// Map avatar IDs to their images
const AVATAR_IMAGES: Record<AvatarId, string> = {
  steve: avatarSteve,
  alex: avatarAlex,
  zombie: avatarZombie,
  creeper: avatarCreeper,
  enderman: avatarEnderman,
  skeleton: avatarSkeleton,
};

function PinEntry({ onSubmit, error, initialPin, isLoading }: { 
  onSubmit: (pin: string, nickname: string, avatar: AvatarId) => void; 
  error?: string; 
  initialPin?: string;
  isLoading?: boolean;
}) {
  const [pin, setPin] = useState(() => {
    if (initialPin && /^\d{6}$/.test(initialPin)) {
      return initialPin.split("");
    }
    return ["", "", "", "", "", ""];
  });
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>("steve");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autoJoinedRef = useRef(false);

  useEffect(() => {
    if (initialPin && /^\d{6}$/.test(initialPin) && !autoJoinedRef.current && nickname.trim()) {
      autoJoinedRef.current = true;
      onSubmit(initialPin, nickname.trim() || "Player", selectedAvatar);
    }
  }, [initialPin, onSubmit, nickname, selectedAvatar]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && pin.every(d => d) && nickname.trim()) {
      onSubmit(pin.join(""), nickname.trim(), selectedAvatar);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newPin = [...pin];
    for (let i = 0; i < pastedData.length; i++) {
      newPin[i] = pastedData[i];
    }
    setPin(newPin);
    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const isComplete = pin.every(d => d) && nickname.trim().length > 0;

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
        <CardContent className="p-6 space-y-5">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100" style={{ fontFamily: "'Press Start 2P', monospace, system-ui" }}>
              Nelle's Chat-O-Matic
            </h1>
            <p className="text-xs text-amber-600 dark:text-amber-400">Up to 4 people can join!</p>
          </div>

          <div className="space-y-2">
            <Label className="text-amber-700 dark:text-amber-300 text-sm font-medium">Your Name</Label>
            <Input
              type="text"
              placeholder="Enter your name..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 12))}
              maxLength={12}
              data-testid="input-nickname"
              className="h-12 text-lg bg-stone-100 dark:bg-stone-700 border-4 border-stone-400 dark:border-stone-500 text-stone-800 dark:text-stone-100"
              style={{ borderRadius: '0px' }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-amber-700 dark:text-amber-300 text-sm font-medium">Choose Your Character</Label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  data-testid={`button-avatar-${avatar.id}`}
                  className={`w-full aspect-square flex items-center justify-center border-4 transition-all overflow-hidden ${
                    selectedAvatar === avatar.id 
                      ? "border-green-500 bg-green-100 dark:bg-green-900/50" 
                      : "border-stone-400 dark:border-stone-500 bg-stone-100 dark:bg-stone-700"
                  }`}
                  style={{ borderRadius: '0px' }}
                  title={avatar.name}
                >
                  <img 
                    src={AVATAR_IMAGES[avatar.id]} 
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-amber-600 dark:text-amber-400">
              {AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.name}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-amber-700 dark:text-amber-300 text-sm font-medium">Room PIN</Label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
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
                  className="w-10 h-12 text-center text-lg font-bold border-4 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100 border-stone-400 dark:border-stone-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition-all"
                  style={{ 
                    fontFamily: "'Press Start 2P', monospace, system-ui",
                    borderRadius: '0px'
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-center text-red-600 dark:text-red-400 text-sm font-medium" data-testid="text-error">
              {error}
            </p>
          )}

          <Button
            onClick={() => onSubmit(pin.join(""), nickname.trim(), selectedAvatar)}
            disabled={!isComplete || isLoading}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 border-4 border-green-800 text-white font-bold"
            data-testid="button-join"
            style={{ borderRadius: '0px' }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent animate-spin" style={{ borderRadius: '0px' }} />
                Checking Mic...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5 mr-2" />
                Join Chat
              </>
            )}
          </Button>
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
      return { text: "1 person connected", color: "text-green-600 dark:text-green-400", pulse: false };
    }
    return { text: `${connectedPeers} people connected`, color: "text-green-600 dark:text-green-400", pulse: false };
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

interface ConnectedPeer extends PeerInfo {
  quality: 'good' | 'medium' | 'poor' | 'unknown';
}

function ConnectionQualityIcon({ quality }: { quality: 'good' | 'medium' | 'poor' | 'unknown' }) {
  switch (quality) {
    case 'good':
      return <SignalHigh className="w-4 h-4 text-green-500" />;
    case 'medium':
      return <SignalMedium className="w-4 h-4 text-amber-500" />;
    case 'poor':
      return <SignalLow className="w-4 h-4 text-red-500" />;
    default:
      return <Signal className="w-4 h-4 text-stone-400" />;
  }
}

function PeerCard({ peer, isSpeaking }: { peer: ConnectedPeer; isSpeaking?: boolean }) {
  return (
    <div 
      className={`flex items-center gap-3 p-2 bg-stone-100 dark:bg-stone-700 border-2 transition-all ${
        isSpeaking 
          ? "border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" 
          : "border-stone-300 dark:border-stone-600"
      }`}
      style={{ borderRadius: '0px' }}
      data-testid={`peer-card-${peer.peerId}`}
    >
      <div className={`relative ${isSpeaking ? "animate-pulse" : ""}`}>
        <img 
          src={AVATAR_IMAGES[peer.avatar]} 
          alt={peer.avatar}
          className="w-8 h-8 flex-shrink-0 object-cover"
          style={{ imageRendering: 'pixelated', borderRadius: '0px' }}
        />
        {isSpeaking && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-white" style={{ borderRadius: '0px' }} />
        )}
      </div>
      <span className="flex-1 text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
        {peer.nickname}
      </span>
      <ConnectionQualityIcon quality={peer.quality} />
    </div>
  );
}

function ShareDialog({ pin }: { pin: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shareUrl = `${window.location.origin}${window.location.pathname}?pin=${pin}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with your family to join the chat.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Couldn't copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="icon" 
          variant="ghost" 
          className="text-amber-700 dark:text-amber-300"
          data-testid="button-share"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-amber-50 dark:bg-stone-800 border-4 border-amber-800 dark:border-amber-900" style={{ borderRadius: '0px' }}>
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100 text-center" style={{ fontFamily: "'Press Start 2P', monospace, system-ui" }}>
            Invite Friends
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white border-4 border-stone-300" style={{ borderRadius: '0px' }}>
              <QRCodeSVG 
                value={shareUrl} 
                size={160}
                level="M"
                data-testid="qr-code"
              />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-amber-700 dark:text-amber-300">Room PIN</p>
            <p className="text-2xl font-bold font-mono tracking-widest text-amber-900 dark:text-amber-100" data-testid="text-share-pin">
              {pin}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-amber-700 dark:text-amber-300 text-sm">Share Link</Label>
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1 bg-stone-100 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 text-sm"
                style={{ borderRadius: '0px' }}
                data-testid="input-share-link"
              />
              <Button 
                onClick={handleCopy}
                className="bg-green-600 hover:bg-green-700 border-2 border-green-800 text-white"
                style={{ borderRadius: '0px' }}
                data-testid="button-copy-link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <p className="text-center text-xs text-amber-600 dark:text-amber-400">
            Scan the QR code or share the link to invite family members!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SoundCheckDialog({ 
  audioLevel, 
  pushToTalk,
  onPlayTone, 
  onConfirm, 
  onCancel 
}: { 
  audioLevel: number;
  pushToTalk: boolean;
  onPlayTone: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
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
          <div className="text-center space-y-2">
            <h1 className="text-lg font-bold text-amber-900 dark:text-amber-100" style={{ fontFamily: "'Press Start 2P', monospace, system-ui" }}>
              Sound Check
            </h1>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Let's make sure your audio is working!
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-amber-700 dark:text-amber-300 text-sm font-medium flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Microphone Test
              </Label>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Speak into your microphone - you should see the bars move
              </p>
              <AudioLevelMeter level={audioLevel} />
            </div>

            <div className="space-y-2">
              <Label className="text-amber-700 dark:text-amber-300 text-sm font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Speaker Test
              </Label>
              <Button
                onClick={onPlayTone}
                className="w-full bg-stone-500 hover:bg-stone-600 border-4 border-stone-700 text-white font-bold"
                style={{ borderRadius: '0px' }}
                data-testid="button-test-sound"
              >
                Play Test Sound
              </Button>
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                You should hear a short tone
              </p>
            </div>

            <div className="p-3 bg-stone-100 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600" style={{ borderRadius: '0px' }}>
              <p className="text-sm font-medium text-stone-800 dark:text-stone-100 mb-1">
                Voice Mode: {pushToTalk ? "Push to Talk" : "Toggle Mute"}
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {pushToTalk 
                  ? "Hold the Spacebar to talk, release to mute"
                  : "Press Spacebar to toggle your microphone on/off"
                }
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              className="flex-1 bg-stone-400 hover:bg-stone-500 border-4 border-stone-600 text-white font-bold"
              style={{ borderRadius: '0px' }}
              data-testid="button-cancel-sound-check"
            >
              Back
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 border-4 border-green-800 text-white font-bold"
              style={{ borderRadius: '0px' }}
              data-testid="button-confirm-join"
            >
              <Phone className="w-5 h-5 mr-2" />
              Join Chat
            </Button>
          </div>
        </CardContent>
      </Card>
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
  currentPin,
  peers,
  pushToTalk,
  speakingPeers,
  onMuteToggle,
  onVolumeChange,
  onDisconnect,
  onPushToTalkChange,
}: {
  status: ConnectionStatus;
  isMuted: boolean;
  volume: number;
  audioLevel: number;
  connectedPeers: number;
  totalInRoom: number;
  currentPin: string;
  peers: ConnectedPeer[];
  pushToTalk: boolean;
  speakingPeers: Set<string>;
  onMuteToggle: () => void;
  onVolumeChange: (value: number) => void;
  onDisconnect: () => void;
  onPushToTalkChange: (enabled: boolean) => void;
}) {
  // Keyboard handling is done in the parent VoiceChat component
  // using refs for stable state access
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
            <h1 className="text-lg font-bold text-amber-900 dark:text-amber-100" style={{ fontFamily: "'Press Start 2P', monospace, system-ui" }}>
              Nelle's Chat-O-Matic
            </h1>
            <StatusIndicator status={status} connectedPeers={connectedPeers} />
            <div className="pt-2 flex items-center justify-center gap-2" data-testid="pin-display">
              <span className="text-xs text-amber-600 dark:text-amber-400">Room PIN:</span>
              <span className="font-mono font-bold text-amber-900 dark:text-amber-100 tracking-wider">{currentPin}</span>
              <ShareDialog pin={currentPin} />
            </div>
          </div>

          {peers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-amber-700 dark:text-amber-300 text-xs font-medium">Connected ({peers.length})</Label>
              <div className="space-y-1">
                {peers.map(peer => (
                  <PeerCard key={peer.peerId} peer={peer} isSpeaking={speakingPeers.has(peer.peerId)} />
                ))}
              </div>
            </div>
          )}

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
              <span>Leave Chat</span>
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 bg-stone-100 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-600" style={{ borderRadius: '0px' }}>
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="ptt-switch" className="text-sm font-medium text-stone-800 dark:text-stone-100">
                Push to Talk
              </Label>
              <span className="text-xs text-stone-600 dark:text-stone-400">
                {pushToTalk ? "Hold Space to talk" : "Space toggles mute"}
              </span>
            </div>
            <Switch
              id="ptt-switch"
              checked={pushToTalk}
              onCheckedChange={onPushToTalkChange}
              data-testid="switch-push-to-talk"
            />
          </div>

          <p className="text-center text-xs text-amber-600 dark:text-amber-400">
            Press <kbd className="px-1.5 py-0.5 bg-stone-300 dark:bg-stone-600 text-stone-700 dark:text-stone-200 font-mono border-2 border-stone-400 dark:border-stone-500" style={{ borderRadius: '0px' }}>Space</kbd> {pushToTalk ? "and hold to talk" : "to toggle mute"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface PeerConnectionData {
  pc: RTCPeerConnection;
  audioElement: HTMLAudioElement;
  nickname: string;
  avatar: AvatarId;
}

export default function VoiceChat() {
  const [isJoined, setIsJoined] = useState(false);
  const [pin, setPin] = useState("");
  const [userNickname, setUserNickname] = useState("");
  const [userAvatar, setUserAvatar] = useState<AvatarId>("steve");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [isMuted, setIsMuted] = useState(false);
  const [pushToTalk, setPushToTalk] = useState(false);
  const [volume, setVolume] = useState(80);
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectedPeers, setConnectedPeers] = useState(0);
  const [totalInRoom, setTotalInRoom] = useState(1);
  const [peers, setPeers] = useState<ConnectedPeer[]>([]);
  const [speakingPeers, setSpeakingPeers] = useState<Set<string>>(new Set());
  const [showSoundCheck, setShowSoundCheck] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<{ pin: string; nickname: string; avatar: AvatarId } | null>(null);
  const [testAudioLevel, setTestAudioLevel] = useState(0);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const testStreamRef = useRef<MediaStream | null>(null);
  const testAudioContextRef = useRef<AudioContext | null>(null);
  const testAnalyserRef = useRef<AnalyserNode | null>(null);
  const testAnimationRef = useRef<number>(0);
  const peerAnalysersRef = useRef<Map<string, { ctx: AudioContext; analyser: AnalyserNode; source: MediaStreamAudioSourceNode }>>(new Map());

  const urlPin = new URLSearchParams(window.location.search).get("pin") || undefined;

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnectionData>>(new Map());
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
  const qualityIntervalRef = useRef<number>(0);

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

  const updatePeersDisplay = useCallback(async () => {
    const updatedPeers: ConnectedPeer[] = [];
    const entries = Array.from(peerConnectionsRef.current.entries());
    for (const [peerId, peerData] of entries) {
      let quality: 'good' | 'medium' | 'poor' | 'unknown' = 'unknown';
      
      try {
        const stats = await peerData.pc.getStats();
        stats.forEach((report: RTCStats) => {
          if (report.type === 'candidate-pair') {
            const pairReport = report as RTCIceCandidatePairStats;
            if (pairReport.state === 'succeeded') {
              const rtt = pairReport.currentRoundTripTime;
              if (rtt !== undefined) {
                if (rtt < 0.1) quality = 'good';
                else if (rtt < 0.3) quality = 'medium';
                else quality = 'poor';
              }
            }
          }
        });
      } catch {
        quality = peerData.pc.connectionState === 'connected' ? 'good' : 'unknown';
      }
      
      updatedPeers.push({
        peerId,
        nickname: peerData.nickname,
        avatar: peerData.avatar,
        quality,
      });
    }
    setPeers(updatedPeers);
  }, []);

  const playChime = useCallback((type: 'join' | 'leave') => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    
    if (type === 'join') {
      // Ascending chime for join
      oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } else {
      // Descending chime for leave
      oscillator.frequency.setValueAtTime(784, ctx.currentTime); // G5
      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(523, ctx.currentTime + 0.2); // C5
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    }
    
    setTimeout(() => ctx.close(), 500);
  }, []);

  const cleanupWebRTC = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (qualityIntervalRef.current) {
      clearInterval(qualityIntervalRef.current);
    }
    peerConnectionsRef.current.forEach(({ pc, audioElement }) => {
      pc.close();
      audioElement.remove();
    });
    peerConnectionsRef.current.clear();
    peerAnalysersRef.current.forEach(({ ctx }) => ctx.close());
    peerAnalysersRef.current.clear();
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
    setPeers([]);
    setSpeakingPeers(new Set());
  }, []);

  const startSoundCheck = useCallback(async () => {
    setIsRequestingMic(true);
    setError(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      testStreamRef.current = stream;
      
      testAudioContextRef.current = new AudioContext();
      testAnalyserRef.current = testAudioContextRef.current.createAnalyser();
      testAnalyserRef.current.fftSize = 256;
      
      const source = testAudioContextRef.current.createMediaStreamSource(stream);
      source.connect(testAnalyserRef.current);
      
      const dataArray = new Uint8Array(testAnalyserRef.current.frequencyBinCount);
      
      const updateTestLevel = () => {
        if (!testAnalyserRef.current) return;
        testAnalyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setTestAudioLevel(Math.min(average / 128, 1));
        testAnimationRef.current = requestAnimationFrame(updateTestLevel);
      };
      updateTestLevel();
      
      setShowSoundCheck(true);
    } catch (err) {
      setError("Could not access microphone. Please allow microphone access.");
    } finally {
      setIsRequestingMic(false);
    }
  }, []);

  const cleanupSoundCheck = useCallback(() => {
    if (testAnimationRef.current) {
      cancelAnimationFrame(testAnimationRef.current);
    }
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach(track => track.stop());
      testStreamRef.current = null;
    }
    if (testAudioContextRef.current) {
      testAudioContextRef.current.close();
      testAudioContextRef.current = null;
    }
    testAnalyserRef.current = null;
    setTestAudioLevel(0);
  }, []);

  const playTestTone = useCallback(() => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
    
    setTimeout(() => ctx.close(), 600);
  }, []);

  const setupPeerAudioAnalyser = useCallback((peerId: string, stream: MediaStream) => {
    try {
      // Clean up any existing analyser for this peer
      const existing = peerAnalysersRef.current.get(peerId);
      if (existing) {
        existing.ctx.close();
        peerAnalysersRef.current.delete(peerId);
      }
      
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      
      // Use the stream directly to get unaffected audio levels
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      // Don't connect to destination - the audio element handles playback
      
      peerAnalysersRef.current.set(peerId, { ctx, analyser, source });
    } catch {
      // Some browsers may not support this
    }
  }, []);

  useEffect(() => {
    if (!isJoined || peerAnalysersRef.current.size === 0) return;
    
    const dataArrays = new Map<string, Uint8Array>();
    peerAnalysersRef.current.forEach((data, peerId) => {
      dataArrays.set(peerId, new Uint8Array(data.analyser.frequencyBinCount));
    });
    
    let frameId: number;
    const checkSpeaking = () => {
      const speaking = new Set<string>();
      
      peerAnalysersRef.current.forEach((data, peerId) => {
        const dataArray = dataArrays.get(peerId);
        if (!dataArray) return;
        
        data.analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        
        if (average > 15) {
          speaking.add(peerId);
        }
      });
      
      setSpeakingPeers(speaking);
      frameId = requestAnimationFrame(checkSpeaking);
    };
    
    checkSpeaking();
    
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isJoined, peers.length]);

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

  const createPeerConnection = useCallback((remotePeerId: string, nickname: string, avatar: AvatarId): RTCPeerConnection => {
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

    peerConnectionsRef.current.set(remotePeerId, { pc, audioElement, nickname, avatar });

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
      // Set up audio analyser for speaking detection using the stream directly
      // This ensures volume control doesn't affect speaking detection
      if (event.streams[0]) {
        setupPeerAudioAnalyser(remotePeerId, event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      updateConnectionCount();
      updatePeersDisplay();
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    updateConnectionCount();
    updatePeersDisplay();
    return pc;
  }, [updateConnectionCount, updatePeersDisplay, setupPeerAudioAnalyser]);

  const removePeer = useCallback((peerId: string) => {
    const peerData = peerConnectionsRef.current.get(peerId);
    if (peerData) {
      peerData.pc.close();
      peerData.audioElement.remove();
      peerConnectionsRef.current.delete(peerId);
      // Clean up audio analyser
      const analyserData = peerAnalysersRef.current.get(peerId);
      if (analyserData) {
        analyserData.ctx.close();
        peerAnalysersRef.current.delete(peerId);
      }
      updateConnectionCount();
      updatePeersDisplay();
    }
  }, [updateConnectionCount, updatePeersDisplay]);

  const handlePinSubmit = useCallback((enteredPin: string, nickname: string, avatar: AvatarId) => {
    setPendingJoin({ pin: enteredPin, nickname, avatar });
    setPin(enteredPin);
    setUserNickname(nickname);
    setUserAvatar(avatar);
    startSoundCheck();
  }, [startSoundCheck]);

  const handleConfirmJoin = useCallback(async () => {
    if (!pendingJoin) return;
    
    cleanupSoundCheck();
    setShowSoundCheck(false);
    setError(undefined);
    setStatus("connecting");
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

      // Start push-to-talk muted
      if (pushToTalk) {
        stream.getAudioTracks().forEach(track => { track.enabled = false; });
        setIsMuted(true);
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      peerIdRef.current = crypto.randomUUID();

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: "join",
          pin: pendingJoin.pin,
          peerId: peerIdRef.current,
          nickname: pendingJoin.nickname,
          avatar: pendingJoin.avatar,
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
              
              // Create connections for existing peers
              if (message.existingPeers) {
                for (const peer of message.existingPeers) {
                  createPeerConnection(peer.peerId, peer.nickname, peer.avatar);
                }
              }
              
              // Start connection quality monitoring
              qualityIntervalRef.current = window.setInterval(() => {
                updatePeersDisplay();
              }, 3000);
            } else {
              setError(message.error || "Failed to join");
              setStatus("disconnected");
              cleanupWebRTC();
            }
            break;

          case "peer-joined": {
            playChime('join');
            const pc = createPeerConnection(message.peerId, message.nickname, message.avatar);
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
            // For offers, we don't have the peer info yet, use placeholder
            const existingPeer = peerConnectionsRef.current.get(message.from);
            const peerNickname = existingPeer?.nickname || 'Player';
            const peerAvatar = existingPeer?.avatar || 'steve';
            const pc = createPeerConnection(message.from, peerNickname, peerAvatar);
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
            playChime('leave');
            removePeer(message.peerId);
            break;
        }
      };

      ws.onclose = () => {
        if (isJoinedRef.current && shouldReconnectRef.current) {
          setStatus("reconnecting");
          reconnectTimeoutRef.current = window.setTimeout(() => {
            handleConfirmJoin();
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
  }, [cleanupWebRTC, createPeerConnection, playChime, pushToTalk, removePeer, setupAudioAnalyzer, updatePeersDisplay]);

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

  // Use refs to track current state for stable event handlers
  const pushToTalkRef = useRef(pushToTalk);
  const isMutedRef = useRef(isMuted);
  useEffect(() => { pushToTalkRef.current = pushToTalk; }, [pushToTalk]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Stable mute toggle that reads directly from audio track state
  const handleMuteToggle = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const newEnabled = !audioTrack.enabled;
        audioTrack.enabled = newEnabled;
        setIsMuted(!newEnabled);
      }
    }
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    setVolume(value);
  }, []);

  const handlePushToTalkChange = useCallback((enabled: boolean) => {
    setPushToTalk(enabled);
    if (enabled && localStreamRef.current) {
      // When enabling PTT, mute by default
      localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = false; });
      setIsMuted(true);
    }
  }, []);

  // Unified keyboard handler using refs for current state
  useEffect(() => {
    if (!isJoined) return;

    // Check if target is an interactive element that should handle its own keyboard events
    const isInteractiveTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return target.isContentEditable || ["INPUT", "BUTTON", "TEXTAREA", "SELECT"].includes(tag);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || !localStreamRef.current || isInteractiveTarget(e.target)) return;
      
      if (pushToTalkRef.current) {
        // PTT mode: unmute on press
        e.preventDefault();
        localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = true; });
        if (isMutedRef.current) {
          setIsMuted(false);
        }
      } else if (e.target === document.body) {
        // Toggle mode: only respond when focus is on body
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          const newEnabled = !audioTrack.enabled;
          audioTrack.enabled = newEnabled;
          setIsMuted(!newEnabled);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" || !pushToTalkRef.current || !localStreamRef.current || isInteractiveTarget(e.target)) return;
      
      if (e.target === document.body) {
        e.preventDefault();
      }
      // PTT mode: mute on release
      localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = false; });
      if (!isMutedRef.current) {
        setIsMuted(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isJoined]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (qualityIntervalRef.current) {
        clearInterval(qualityIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      cleanupWebRTC();
    };
  }, [cleanupWebRTC]);

  const handleCancelSoundCheck = useCallback(() => {
    cleanupSoundCheck();
    setShowSoundCheck(false);
    setPendingJoin(null);
  }, [cleanupSoundCheck]);

  return (
    <>
      <div ref={audioContainerRef} style={{ display: "none" }} />
      {showSoundCheck && (
        <SoundCheckDialog
          audioLevel={testAudioLevel}
          pushToTalk={pushToTalk}
          onPlayTone={playTestTone}
          onConfirm={handleConfirmJoin}
          onCancel={handleCancelSoundCheck}
        />
      )}
      {!isJoined && !showSoundCheck ? (
        <PinEntry onSubmit={handlePinSubmit} error={error} initialPin={urlPin} isLoading={isRequestingMic} />
      ) : isJoined ? (
        <VoiceChatInterface
          status={status}
          isMuted={isMuted}
          volume={volume}
          audioLevel={audioLevel}
          connectedPeers={connectedPeers}
          totalInRoom={totalInRoom}
          currentPin={pin}
          peers={peers}
          pushToTalk={pushToTalk}
          speakingPeers={speakingPeers}
          onMuteToggle={handleMuteToggle}
          onVolumeChange={handleVolumeChange}
          onDisconnect={handleDisconnect}
          onPushToTalkChange={handlePushToTalkChange}
        />
      ) : null}
    </>
  );
}

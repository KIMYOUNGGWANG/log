"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Loader2 } from "lucide-react";

interface VoiceCallClientProps {
  scenarioTitle: string;
  npcRole: string;
  systemPrompt: string;
  scenarioId: string;
  isFreeTrialMode?: boolean;
  onCallEnd: (durationSeconds: number) => void;
}

type CallState = "idle" | "connecting" | "connected" | "ended" | "error";

export default function VoiceCallClient({
  scenarioTitle,
  npcRole,
  systemPrompt,
  scenarioId,
  isFreeTrialMode = false,
  onCallEnd,
}: VoiceCallClientProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startCall = useCallback(async () => {
    setCallState("connecting");
    setErrorMessage(null);

    try {
      // 1. Fetch ephemeral token from backend
      const res = await fetch("/api/realtime-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freeTrial: isFreeTrialMode }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.code === "VOICE_PLAN_REQUIRED") {
          setErrorMessage("Voice Pro 플랜이 필요합니다.");
        } else if (err.code === "MINUTES_EXHAUSTED") {
          setErrorMessage("이번 달 음성 통화 시간을 모두 사용했습니다.");
        } else {
          setErrorMessage("세션 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
        setCallState("error");
        return;
      }

      const { client_secret } = await res.json();
      const ephemeralKey = client_secret.value;

      // 2. Set up WebRTC Peer Connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Audio element for AI output
      const audio = new Audio();
      audio.autoplay = true;
      audioElementRef.current = audio;
      pc.ontrack = (event) => {
        audio.srcObject = event.streams[0];
        // Detect AI speaking via audio track activity
        setIsAISpeaking(true);
        event.streams[0].getTracks()[0].onended = () => setIsAISpeaking(false);
      };

      // 3. Capture microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 4. Data channel for session configuration
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      dc.onopen = () => {
        // Send session configuration with system prompt
        const sessionConfig = {
          type: "session.update",
          session: {
            instructions: systemPrompt ||
              `당신은 ${npcRole}입니다. 현재 상황: ${scenarioTitle}. 한국어로 자연스럽게 대화하세요. 대사는 1~3문장 이내로 간결하게 유지하세요.`,
            input_audio_transcription: { model: "whisper-1" },
            turn_detection: { type: "server_vad" },
          },
        };
        dc.send(JSON.stringify(sessionConfig));
      };

      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === "response.audio.delta") {
            setIsAISpeaking(true);
          } else if (event.type === "response.audio.done") {
            setIsAISpeaking(false);
          }
        } catch {
          // ignore parse errors
        }
      };

      // 5. SDP Offer/Answer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview",
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
        }
      );

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      setCallState("connected");
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDurationSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.error("[VoiceCallClient] Error:", err);
      setErrorMessage("마이크 접근 권한이 필요하거나 연결에 실패했습니다.");
      setCallState("error");
    }
  }, [isFreeTrialMode, systemPrompt, npcRole, scenarioTitle]);

  const endCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

    peerConnectionRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioElementRef.current) audioElementRef.current.srcObject = null;

    setCallState("ended");
    onCallEnd(elapsed);
  }, [onCallEnd]);

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted((m) => !m);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      peerConnectionRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-8">
      {/* NPC Avatar & Status */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings when AI is speaking */}
        {isAISpeaking && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-violet-500/20 animate-ping" />
            <div className="absolute w-44 h-44 rounded-full bg-violet-500/10 animate-ping [animation-delay:150ms]" />
          </>
        )}
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <span className="text-5xl">🎭</span>
        </div>
      </div>

      {/* NPC Info */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">{npcRole}</h2>
        <p className="text-violet-300 text-sm mt-1">{scenarioTitle}</p>
      </div>

      {/* State Display */}
      {callState === "idle" && (
        <div className="text-center space-y-4">
          <p className="text-gray-400">
            {isFreeTrialMode
              ? "🎁 3분 무료 체험 — 마이크를 켜고 NPC와 대화해 보세요!"
              : "마이크를 허용하고 NPC와 실제로 대화해 보세요."}
          </p>
          <Button
            onClick={startCall}
            size="lg"
            className="bg-violet-600 hover:bg-violet-500 text-white px-10 py-6 text-lg rounded-full shadow-lg shadow-violet-500/30 transition-all duration-200 hover:scale-105"
          >
            통화 시작
          </Button>
        </div>
      )}

      {callState === "connecting" && (
        <div className="flex items-center gap-3 text-violet-300">
          <Loader2 className="animate-spin" size={20} />
          <span>연결 중...</span>
        </div>
      )}

      {callState === "connected" && (
        <div className="flex flex-col items-center gap-6">
          {/* Timer */}
          <div className="text-3xl font-mono text-white tabular-nums">
            {formatDuration(durationSeconds)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleMute}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isMuted
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title={isMuted ? "음소거 해제" : "음소거"}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button
              onClick={endCall}
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105"
              title="통화 종료"
            >
              <PhoneOff size={28} />
            </button>
          </div>

          <p className="text-gray-500 text-sm">
            {isMuted ? "🔇 음소거 중" : "🎙️ 마이크 활성화됨 — 자연스럽게 말해 보세요"}
          </p>
        </div>
      )}

      {callState === "ended" && (
        <div className="text-center space-y-2">
          <p className="text-green-400 font-semibold text-lg">✅ 통화가 종료되었습니다.</p>
          <p className="text-gray-400 text-sm">
            총 연습 시간: <span className="text-white font-mono">{formatDuration(durationSeconds)}</span>
          </p>
        </div>
      )}

      {callState === "error" && (
        <div className="text-center space-y-4">
          <p className="text-red-400">{errorMessage}</p>
          <Button
            onClick={() => setCallState("idle")}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            다시 시도
          </Button>
        </div>
      )}
    </div>
  );
}

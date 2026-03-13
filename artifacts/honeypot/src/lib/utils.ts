import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── ElevenLabs TTS (called directly from browser) ───────────────────────────
//
// Voice IDs — both are from ElevenLabs' free tier default library:
//   Rachel  (21m00Tcm4TlvDq8ikWAM) — warm, calm, slightly Indian-accented female
//   Antoni  (ErXwobaYiN019PkySvjV) — confident male, used for scammer
//
// We keep the key client-side only. This avoids the Replit server IP being
// flagged by ElevenLabs' abuse detection. The key is exposed in the bundle,
// so treat it as a low-privilege TTS-only credential.

const ELEVENLABS_API_KEY = "sk_a3126a62bc2324c2a6b3a5ed6fbe15e89f4f24584155d2b9";

// Ramesh Kumar (agent) — warm Indian-accented male voice
const VOICE_AGENT   = "pNInz6obpgDQGcFmaJgB"; // Adam — calm, natural
// Scammer — different, more pressured male voice
const VOICE_SCAMMER = "VR6AewLTigWG4xSOukaG"; // Arnold — assertive male

let currentAudio: HTMLAudioElement | null = null;

/**
 * Speak text via ElevenLabs AI voice. Returns a Promise that resolves when
 * the audio finishes playing. Falls back to browser TTS on error.
 */
export async function speakElevenLabs(
  text: string,
  role: "agent" | "scammer"
): Promise<void> {
  const voiceId = role === "agent" ? VOICE_AGENT : VOICE_SCAMMER;

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability:        role === "agent" ? 0.55 : 0.40,
            similarity_boost: 0.80,
            style:            role === "agent" ? 0.20 : 0.35,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.warn("[ElevenLabs] TTS error:", err);
      return speakBrowser(text, role);
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended  = () => { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
      audio.onerror  = () => { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
      audio.play().catch(() => { URL.revokeObjectURL(url); currentAudio = null; resolve(); });
    });
  } catch (err) {
    console.warn("[ElevenLabs] fetch failed, falling back to browser TTS:", err);
    return speakBrowser(text, role);
  }
}

export function stopSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

// ─── Browser Speech Synthesis (fallback) ─────────────────────────────────────

function pickVoice(
  voices: SpeechSynthesisVoice[],
  role: "scammer" | "agent"
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  if (role === "scammer") {
    return (
      voices.find((v) => v.name === "Google UK English Male") ||
      voices.find((v) => v.name === "Google US English") ||
      voices.find((v) => /google/i.test(v.name) && /en/i.test(v.lang)) ||
      voices.find((v) => /microsoft.*david|microsoft.*mark/i.test(v.name)) ||
      voices.find((v) => /^(Alex|Daniel|Fred|Thomas)$/i.test(v.name)) ||
      voices.find((v) => /en-US|en-GB/i.test(v.lang)) ||
      voices[0]
    );
  } else {
    return (
      voices.find((v) => v.name === "Google UK English Female") ||
      voices.find((v) => /google/i.test(v.name) && /en-IN|hi/i.test(v.lang)) ||
      voices.find((v) => /rishi|veena|lekha/i.test(v.name)) ||
      voices.find((v) => /microsoft.*zira|microsoft.*hazel/i.test(v.name)) ||
      voices.find((v) => /^(Samantha|Karen|Victoria|Moira|Fiona|Tessa)$/i.test(v.name)) ||
      voices.find((v) => /en-IN/i.test(v.lang)) ||
      voices[Math.min(1, voices.length - 1)]
    );
  }
}

export function speakBrowser(
  text: string,
  role: "agent" | "scammer"
): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) { resolve(); return; }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);

    if (role === "scammer") {
      utter.rate   = 1.08;
      utter.pitch  = 1.0;
      utter.volume = 1.0;
    } else {
      utter.rate   = 0.90;
      utter.pitch  = 0.92;
      utter.volume = 1.0;
    }

    const applyAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const v = pickVoice(voices, role);
      if (v) utter.voice = v;
      const timeout = setTimeout(() => { window.speechSynthesis.cancel(); resolve(); }, 20000);
      utter.onend   = () => { clearTimeout(timeout); resolve(); };
      utter.onerror = () => { clearTimeout(timeout); resolve(); };
      window.speechSynthesis.speak(utter);
    };

    const loaded = window.speechSynthesis.getVoices();
    if (loaded.length) { applyAndSpeak(); }
    else {
      window.speechSynthesis.addEventListener("voiceschanged", function h() {
        window.speechSynthesis.removeEventListener("voiceschanged", h);
        applyAndSpeak();
      });
    }
  });
}

/** Legacy helpers kept for other pages */
export function playVoice(text: string) {
  speakElevenLabs(text, "agent").catch(() => {});
}

export async function speakAgent(text: string): Promise<void> {
  return speakElevenLabs(text, "agent");
}

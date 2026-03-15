import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── AI TTS via backend (OpenAI gpt-audio, onyx/echo voices) ─────────────────
//
// The backend /api/honeypot/tts endpoint calls OpenAI gpt-audio through
// the Replit AI integration and returns MP3 audio. This sounds genuinely
// human — no robotic artefacts from browser TTS.
//
//   role="agent"   → "onyx"  voice (warm, calm, slightly Indian cadence)
//   role="scammer" → "echo"  voice (assertive, pressured male)

let currentAudio: HTMLAudioElement | null = null;

/**
 * Speak text via OpenAI gpt-audio (served through our backend).
 * Returns a Promise that resolves when audio finishes playing.
 * Falls back to browser TTS if the backend call fails.
 */
export async function speakElevenLabs(
  text: string,
  role: "agent" | "scammer"
): Promise<void> {
  return speakAI(text, role);
}

export async function speakAI(
  text: string,
  role: "agent" | "scammer"
): Promise<void> {
  try {
    const res = await fetch("/api/honeypot/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, role }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn("[TTS] Backend error:", err);
      return speakBrowser(text, role);
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      if (currentAudio) { currentAudio.pause(); currentAudio = null; }
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended  = () => { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
      audio.onerror  = () => { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
      audio.play().catch(() => { URL.revokeObjectURL(url); currentAudio = null; resolve(); });
    });
  } catch (err) {
    console.warn("[TTS] Fetch failed, falling back to browser TTS:", err);
    return speakBrowser(text, role);
  }
}

export function stopSpeech() {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

// ─── Browser Speech Synthesis (fallback only) ────────────────────────────────

function pickVoice(
  voices: SpeechSynthesisVoice[],
  role: "scammer" | "agent"
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  if (role === "scammer") {
    return (
      voices.find((v) => v.name === "Google UK English Male") ||
      voices.find((v) => /google/i.test(v.name) && /en/i.test(v.lang)) ||
      voices.find((v) => /en-US|en-GB/i.test(v.lang)) ||
      voices[0]
    );
  }
  return (
    voices.find((v) => v.name === "Google UK English Female") ||
    voices.find((v) => /google/i.test(v.name) && /en-IN|hi/i.test(v.lang)) ||
    voices[Math.min(1, voices.length - 1)]
  );
}

export function speakBrowser(text: string, role: "agent" | "scammer"): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate   = role === "scammer" ? 1.08 : 0.90;
    utter.pitch  = role === "scammer" ? 1.0  : 0.92;
    utter.volume = 1.0;
    const applyAndSpeak = () => {
      const v = pickVoice(window.speechSynthesis.getVoices(), role);
      if (v) utter.voice = v;
      const t = setTimeout(() => { window.speechSynthesis.cancel(); resolve(); }, 20000);
      utter.onend   = () => { clearTimeout(t); resolve(); };
      utter.onerror = () => { clearTimeout(t); resolve(); };
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
  speakAI(text, "agent").catch(() => {});
}

export async function speakAgent(text: string): Promise<void> {
  return speakAI(text, "agent");
}

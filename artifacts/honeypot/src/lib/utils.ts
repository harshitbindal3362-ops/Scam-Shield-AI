import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Browser Speech Synthesis ────────────────────────────────────────────────

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
      voices.find((v) => /microsoft.*david|microsoft.*mark|microsoft.*guy/i.test(v.name)) ||
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

/** Speak text with browser's built-in TTS. Returns Promise that resolves on end. */
export function speakBrowser(
  text: string,
  role: "agent" | "scammer"
): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) { resolve(); return; }

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);

    if (role === "scammer") {
      utter.rate   = 1.05;
      utter.pitch  = 1.0;
      utter.volume = 1.0;
    } else {
      utter.rate   = 0.93;
      utter.pitch  = 0.95;
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
    if (loaded.length) {
      applyAndSpeak();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", function h() {
        window.speechSynthesis.removeEventListener("voiceschanged", h);
        applyAndSpeak();
      });
    }
  });
}

export function stopSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** Legacy helper used by session detail page */
export function playVoice(text: string) {
  speakBrowser(text, "agent").catch(() => {});
}

/** Legacy export kept for compatibility */
export async function speakAgent(text: string): Promise<void> {
  return speakBrowser(text, "agent");
}

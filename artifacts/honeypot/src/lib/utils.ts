import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// OmniDimension integration
declare global {
  interface Window {
    OmniDim?: { speak: (text: string) => void };
  }
}

export function playVoice(text: string) {
  if (window.OmniDim && typeof window.OmniDim.speak === "function") {
    window.OmniDim.speak(text);
  } else {
    speakBrowser(text, "agent");
  }
}

// ─── Voice selection ─────────────────────────────────────────────────────────

/** Pick the best available voice for a role.
 *  Preference order: Google Neural > Google > named high-quality > any. */
function pickVoice(
  voices: SpeechSynthesisVoice[],
  role: "scammer" | "agent"
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  if (role === "scammer") {
    // Want: confident, clear male — Google US English Male is best
    return (
      voices.find((v) => v.name === "Google UK English Male") ||
      voices.find((v) => v.name === "Google US English") ||
      voices.find((v) => /google/i.test(v.name) && /en/i.test(v.lang)) ||
      voices.find((v) => /microsoft.*david|microsoft.*mark|microsoft.*guy/i.test(v.name)) ||
      voices.find((v) => /^(Alex|Daniel|Fred|Thomas)$/i.test(v.name)) ||
      voices.find((v) => /en-US|en-GB/i.test(v.lang) && !/(Zira|Hazel|Susan)/i.test(v.name)) ||
      voices[0]
    );
  } else {
    // Want: warm, slightly different timbre from scammer
    return (
      voices.find((v) => v.name === "Google UK English Female") ||
      voices.find((v) => v.name === "Google हिन्दी") ||
      voices.find((v) => /google/i.test(v.name) && /en-IN|hi/i.test(v.lang)) ||
      voices.find((v) => /rishi|veena|lekha/i.test(v.name)) ||
      voices.find((v) => /microsoft.*zira|microsoft.*hazel/i.test(v.name)) ||
      voices.find((v) => /^(Samantha|Karen|Victoria|Moira|Fiona|Tessa)$/i.test(v.name)) ||
      voices.find((v) => /en-IN/i.test(v.lang)) ||
      voices[Math.min(1, voices.length - 1)]
    );
  }
}

// ─── Core speak function ─────────────────────────────────────────────────────

/** Speak text and return a Promise that resolves when done.
 *  role changes voice character and delivery style. */
export function speakBrowser(
  text: string,
  role: "agent" | "scammer"
): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) { resolve(); return; }

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);

    // Natural delivery settings — keep close to 1.0 for human feel
    if (role === "scammer") {
      utter.rate  = 1.05;   // confident, controlled, slightly brisk
      utter.pitch = 1.0;    // neutral — don't sound like a cartoon
      utter.volume = 1.0;
    } else {
      utter.rate  = 0.93;   // slightly slower, hesitant
      utter.pitch = 0.95;   // slightly warmer / lower
      utter.volume = 1.0;
    }

    const applyVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const v = pickVoice(voices, role);
      if (v) utter.voice = v;
    };

    const loaded = window.speechSynthesis.getVoices();
    if (loaded.length) {
      applyVoice();
      doSpeak();
    } else {
      // Chrome loads voices async on first call
      window.speechSynthesis.addEventListener("voiceschanged", function handler() {
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        applyVoice();
        doSpeak();
      });
    }

    function doSpeak() {
      const timeout = setTimeout(() => {
        window.speechSynthesis.cancel();
        resolve();
      }, 20000);

      utter.onend  = () => { clearTimeout(timeout); resolve(); };
      utter.onerror = () => { clearTimeout(timeout); resolve(); };
      window.speechSynthesis.speak(utter);
    }
  });
}

export function stopSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

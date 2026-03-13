import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// OmniDimension integration
declare global {
  interface Window {
    OmniDim?: {
      speak: (text: string) => void;
    };
  }
}

// Play a single message via OmniDim (agent voice for session detail)
export function playVoice(text: string) {
  if (window.OmniDim && typeof window.OmniDim.speak === "function") {
    window.OmniDim.speak(text);
  } else {
    speakBrowser(text, "agent");
  }
}

// ─── Browser Speech Synthesis ────────────────────────────────────────────────

/** Speak text using the browser's built-in TTS.
 *  role: "agent"   → slower, calm, slightly confused (Ramesh Kumar)
 *  role: "scammer" → faster, slightly higher pitch, urgent
 *  Returns a Promise that resolves when speech finishes (or after timeout).
 */
export function speakBrowser(
  text: string,
  role: "agent" | "scammer",
  onEnd?: () => void
): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      onEnd?.();
      resolve();
      return;
    }

    // Cancel anything currently speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (role === "scammer") {
      utterance.rate = 1.15;      // slightly fast — creates urgency
      utterance.pitch = 1.1;      // slightly higher
      utterance.volume = 1;
    } else {
      utterance.rate = 0.88;      // slower — confused, elderly
      utterance.pitch = 0.9;      // slightly lower, warmer
      utterance.volume = 1;
    }

    // Try to assign distinct voices when available
    const assignVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (role === "scammer") {
          // Prefer a male US/UK voice for the scammer
          const male =
            voices.find((v) =>
              /male|david|mark|alex|daniel|james/i.test(v.name)
            ) ||
            voices.find((v) => /en-US|en-GB/i.test(v.lang)) ||
            voices[0];
          utterance.voice = male;
        } else {
          // Prefer a different voice for agent (female or different accent)
          const female =
            voices.find((v) =>
              /female|samantha|karen|victoria|moira|fiona|rishi|veena/i.test(
                v.name
              )
            ) ||
            voices.find(
              (v) => /en-IN|hi-IN/i.test(v.lang)
            ) ||
            voices[Math.min(1, voices.length - 1)];
          utterance.voice = female;
        }
      }
    };

    // Voices may not be loaded yet on first call
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      assignVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        assignVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }

    utterance.onend = () => {
      onEnd?.();
      resolve();
    };
    utterance.onerror = () => {
      onEnd?.();
      resolve();
    };

    // Fallback timeout: max 15 seconds per utterance
    const timeout = setTimeout(() => {
      window.speechSynthesis.cancel();
      onEnd?.();
      resolve();
    }, 15000);

    utterance.onend = () => {
      clearTimeout(timeout);
      onEnd?.();
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

/** Stop any ongoing speech */
export function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

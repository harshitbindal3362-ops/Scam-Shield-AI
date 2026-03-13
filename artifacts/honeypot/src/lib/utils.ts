import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// OmniDimension mock integration
declare global {
  interface Window {
    OmniDim?: {
      speak: (text: string) => void;
    };
  }
}

export function playVoice(text: string) {
  if (window.OmniDim && typeof window.OmniDim.speak === "function") {
    window.OmniDim.speak(text);
  } else {
    console.log("[OmniDimension Mock Speak]:", text);
  }
}

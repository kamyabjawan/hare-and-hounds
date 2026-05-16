"use client";

import { useCallback, useRef } from "react";
import { useSettingsStore } from "@/stores/settings-store";

type SoundName = "move" | "win" | "error" | "tick";

const tones: Record<SoundName, { frequency: number; duration: number; type: OscillatorType }> = {
  move: { frequency: 440, duration: 0.08, type: "sine" },
  win: { frequency: 660, duration: 0.16, type: "triangle" },
  error: { frequency: 140, duration: 0.12, type: "square" },
  tick: { frequency: 880, duration: 0.04, type: "sine" }
};

export function useSound() {
  const enabled = useSettingsStore((state) => state.soundEnabled);
  const contextRef = useRef<AudioContext | null>(null);

  return useCallback(
    (name: SoundName) => {
      if (!enabled || typeof window === "undefined") {
        return;
      }

      const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;

      if (!AudioContextConstructor) {
        return;
      }

      const context = contextRef.current ?? new AudioContextConstructor();
      contextRef.current = context;

      const tone = tones[name];
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = tone.type;
      oscillator.frequency.value = tone.frequency;
      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + tone.duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + tone.duration);
    },
    [enabled]
  );
}

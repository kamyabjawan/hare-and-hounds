"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "dark" | "system";

type SettingsState = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  themeMode: ThemeMode;
  turnAlerts: boolean;
  setSoundEnabled: (value: boolean) => void;
  setHapticsEnabled: (value: boolean) => void;
  setThemeMode: (value: ThemeMode) => void;
  setTurnAlerts: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticsEnabled: true,
      themeMode: "dark",
      turnAlerts: true,
      setSoundEnabled: (value) => set({ soundEnabled: value }),
      setHapticsEnabled: (value) => set({ hapticsEnabled: value }),
      setThemeMode: (value) => set({ themeMode: value }),
      setTurnAlerts: (value) => set({ turnAlerts: value })
    }),
    {
      name: "hare-hounds-settings"
    }
  )
);

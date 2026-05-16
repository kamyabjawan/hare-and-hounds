"use client";

import { Bell, Moon, Radio, Volume2 } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { Panel } from "@/components/ui/panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useSettingsStore } from "@/stores/settings-store";

export default function SettingsPage() {
  const settings = useSettingsStore();

  return (
    <PageTransition>
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-black text-white">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">Tune the Telegram Mini App experience.</p>
        </div>

        <Panel className="space-y-4">
          <ToggleRow
            icon={<Volume2 className="h-5 w-5" />}
            title="Sound effects"
            value={settings.soundEnabled}
            onChange={settings.setSoundEnabled}
          />
          <ToggleRow
            icon={<Radio className="h-5 w-5" />}
            title="Haptics"
            value={settings.hapticsEnabled}
            onChange={settings.setHapticsEnabled}
          />
          <ToggleRow
            icon={<Bell className="h-5 w-5" />}
            title="Turn alerts"
            value={settings.turnAlerts}
            onChange={settings.setTurnAlerts}
          />
        </Panel>

        <Panel className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Moon className="h-5 w-5 text-mint" />
            Theme
          </div>
          <SegmentedControl
            value={settings.themeMode}
            onChange={settings.setThemeMode}
            options={[
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" }
            ]}
          />
        </Panel>
      </section>
    </PageTransition>
  );
}

function ToggleRow({
  icon,
  title,
  value,
  onChange
}: {
  icon: React.ReactNode;
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg bg-white/5 p-3">
      <span className="flex items-center gap-3 text-sm font-semibold text-white">
        <span className="text-mint">{icon}</span>
        {title}
      </span>
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-white/20 bg-white/10 accent-mint"
      />
    </label>
  );
}

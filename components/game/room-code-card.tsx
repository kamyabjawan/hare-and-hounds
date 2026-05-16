"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export function RoomCodeCard({ code }: { code: string }) {
  async function copyCode() {
    await navigator.clipboard.writeText(code);
  }

  return (
    <Panel className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-slate-400">Room code</p>
        <p className="font-mono text-2xl font-black text-white">{code}</p>
      </div>
      <Button variant="secondary" size="icon" onClick={() => void copyCode()}>
        <Copy className="h-5 w-5" />
        Copy code
      </Button>
    </Panel>
  );
}

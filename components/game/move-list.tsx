"use client";

import type { MoveRow } from "@/types/database";
import { Panel } from "@/components/ui/panel";

export function MoveList({ moves }: { moves: MoveRow[] }) {
  return (
    <Panel>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">Move Log</h2>
        <span className="text-xs text-slate-400">{moves.length} moves</span>
      </div>
      <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
        {moves.length === 0 ? (
          <p className="text-sm text-slate-400">No moves yet.</p>
        ) : (
          moves.map((move) => (
            <div key={move.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
              <span className="font-mono text-slate-400">#{move.move_number}</span>
              <span className="font-semibold capitalize text-white">{move.role}</span>
              <span className="text-slate-300">
                {move.piece} {move.from_node} -&gt; {move.to_node}
              </span>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

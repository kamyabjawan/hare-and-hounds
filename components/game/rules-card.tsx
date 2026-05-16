import { Panel } from "@/components/ui/panel";

export function RulesCard() {
  return (
    <Panel className="space-y-2">
      <h2 className="text-sm font-bold text-white">Rules</h2>
      <div className="grid gap-2 text-sm text-slate-300">
        <p>Hounds move one connected point forward or sideways. They cannot move backward.</p>
        <p>The hare moves one connected point in any direction.</p>
        <p>The hare wins by passing the hounds. The hounds win by trapping the hare.</p>
      </div>
    </Panel>
  );
}

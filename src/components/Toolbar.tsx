import {
  Circle,
  CircleDot,
  Cone,
  Eraser,
  Goal,
  MousePointer2,
  PersonStanding,
  Route,
  Spline,
  SquareDashed,
  Triangle,
  Type,
  Waves,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";
import { SCAFFOLDS } from "../data/scaffolding";
import type { Team, Tier, Tool } from "../types";

const GROUPS: { label: string; tools: { id: Tool; label: string; icon: ComponentType<{ size?: number }> }[] }[] = [
  { label: "Move", tools: [{ id: "select", label: "Select", icon: MousePointer2 }] },
  {
    label: "Players",
    tools: [
      { id: "home", label: "Home", icon: Circle },
      { id: "away", label: "Away", icon: Circle },
      { id: "gk-home", label: "Our GK", icon: CircleDot },
      { id: "gk-away", label: "Opp GK", icon: CircleDot },
      { id: "ball", label: "Ball", icon: CircleDot },
    ],
  },
  {
    label: "Kit",
    tools: [
      { id: "cone", label: "Cone", icon: Cone },
      { id: "mannequin", label: "Dummy", icon: PersonStanding },
      { id: "goal", label: "Goal", icon: Goal },
      { id: "pole", label: "Pole", icon: Triangle },
    ],
  },
  {
    label: "Draw",
    tools: [
      { id: "pass", label: "Pass", icon: Spline },
      { id: "run", label: "Run", icon: Route },
      { id: "dribble", label: "Dribble", icon: Waves },
      { id: "press", label: "Press", icon: SquareDashed },
      { id: "marker", label: "Note", icon: Type },
      { id: "erase", label: "Erase", icon: Eraser },
    ],
  },
];

export function Toolbar({
  tool,
  tier,
  drawTeam,
  disabled,
  onTool,
  onDrawTeam,
  onFormation,
  onSuggest,
  onClearStrokes,
  onClearEquipment,
}: {
  tool: Tool;
  tier: Tier;
  drawTeam: Team;
  disabled?: boolean;
  onTool: (tool: Tool) => void;
  onDrawTeam: (team: Team) => void;
  onFormation: (name: string) => void;
  onSuggest: () => void;
  onClearStrokes: () => void;
  onClearEquipment: () => void;
}) {
  const formations = SCAFFOLDS[tier].formations;
  return (
    <aside className="toolbar" aria-label="Pitch tools">
      <div className="team-toggle" role="group" aria-label="Drawing team">
        <button type="button" aria-pressed={drawTeam === "home"} onClick={() => onDrawTeam("home")}>
          Home
        </button>
        <button type="button" aria-pressed={drawTeam === "away"} onClick={() => onDrawTeam("away")}>
          Opp
        </button>
      </div>
      {GROUPS.map((group) => (
        <div key={group.label} className="tool-group">
          <p>{group.label}</p>
          {group.tools.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`tool ${item.id}`}
                aria-pressed={tool === item.id}
                disabled={disabled}
                onClick={() => onTool(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
      <div className="tool-group">
        <p>Shape · {drawTeam === "home" ? "home" : "opp"}</p>
        {formations.map((name) => (
          <button key={name} type="button" className="tool shape" disabled={disabled} onClick={() => onFormation(name)}>
            <span>{name}</span>
          </button>
        ))}
      </div>
      <button type="button" className="suggest" disabled={disabled} onClick={onSuggest}>
        <Sparkles size={15} />
        Suggest press
      </button>
      <div className="tool-links">
        <button type="button" onClick={onClearStrokes} disabled={disabled}>
          Clear arrows
        </button>
        <button type="button" onClick={onClearEquipment} disabled={disabled}>
          Clear kit
        </button>
      </div>
    </aside>
  );
}

import type { Competency } from "../types";

interface RadarChartProps {
  name: string;
  age: string;
  club: string;
  position: string;
  competencies: Competency[];
  scores: Record<string, number>;
  previous?: Record<string, number> | null;
  max?: number;
}

function polar(index: number, count: number, value: number, max: number, cx: number, cy: number, radius: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  const span = (Math.max(0, Math.min(max, value)) / max) * radius;
  return { x: cx + Math.cos(angle) * span, y: cy + Math.sin(angle) * span, angle };
}

function ring(cx: number, cy: number, radius: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const point = polar(index, count, 1, 1, cx, cy, radius);
    return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }).join(" ") + " Z";
}

export function RadarChart({ name, age, club, position, competencies, scores, previous, max = 10 }: RadarChartProps) {
  const count = competencies.length;
  const cx = 360;
  const cy = 390;
  const radius = 168;
  if (count < 3) {
    return <p className="hint">Add at least three competencies to draw the chart.</p>;
  }
  const current = competencies.map((item, index) => polar(index, count, scores[item.id] ?? 0, max, cx, cy, radius));
  const prior = previous
    ? competencies.map((item, index) => polar(index, count, previous[item.id] ?? 0, max, cx, cy, radius))
    : null;
  const path = current.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ") + " Z";
  const priorPath = prior
    ? prior.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ") + " Z"
    : "";
  const meta = [age ? `Age : ${age}` : "", club, position].filter(Boolean).join("  ||  ");

  return (
    <svg className="radar" viewBox="0 0 720 760" role="img" aria-label={`${name} competency chart`}>
      <rect width="720" height="760" rx="18" fill="#2c2c2c" />
      <text x="360" y="58" textAnchor="middle" fill="#1d4ed8" stroke="#0a1c44" strokeWidth="3" paintOrder="stroke" fontFamily="Barlow Condensed, sans-serif" fontSize="54" fontWeight="700">
        {name.toUpperCase()}
      </text>
      <text x="360" y="96" textAnchor="middle" fill="#2f6fe0" fontFamily="Barlow Condensed, sans-serif" fontSize="22" fontWeight="600" letterSpacing="1.5">
        {meta || "Add age and club"}
      </text>
      {[0.2, 0.4, 0.6, 0.8, 1].map((level) => (
        <path key={level} d={ring(cx, cy, radius * level, count)} fill="none" stroke="rgba(180,180,180,0.35)" />
      ))}
      {competencies.map((item, index) => {
        const end = polar(index, count, max, max, cx, cy, radius);
        const label = polar(index, count, max, max, cx, cy, radius + 46);
        const anchor = Math.cos(label.angle) > 0.35 ? "start" : Math.cos(label.angle) < -0.35 ? "end" : "middle";
        const value = scores[item.id] ?? 0;
        return (
          <g key={item.id}>
            <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(180,180,180,0.35)" />
            <text x={label.x} y={label.y} textAnchor={anchor} fill="#f2f2f2" fontFamily="Outfit, sans-serif" fontSize="15">
              {item.label}
            </text>
            <text x={label.x} y={label.y + 18} textAnchor={anchor} fill="#f2f2f2" fontFamily="Outfit, sans-serif" fontSize="15" fontWeight="600">
              {value.toFixed(1)}
            </text>
          </g>
        );
      })}
      {priorPath && <path d={priorPath} fill="rgba(160,190,220,0.12)" stroke="#d5e4ff" strokeWidth="2" strokeDasharray="5 4" />}
      <path d={path} fill="rgba(61,126,181,0.72)" stroke="#8ec4ef" strokeWidth="3" />
      {current.map((point, index) => (
        <circle key={competencies[index].id} cx={point.x} cy={point.y} r="3.5" fill="#d7ebff" />
      ))}
    </svg>
  );
}

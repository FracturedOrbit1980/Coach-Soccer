import type { PitchView, Point, Team, Token, Zone } from "../types";
import { uid } from "./id";

export const PITCH_L = 105;
export const PITCH_W = 68;
export const SVG_W = 1050;
export const SVG_H = 680;

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

export function toSvg(point: Point): Point {
  return { x: (point.x / 100) * SVG_W, y: (point.y / 100) * SVG_H };
}

export function viewBoxFor(view: PitchView): string {
  switch (view) {
    case "half":
      return "470 -36 620 752";
    case "box":
      return "800 90 290 500";
    default:
      return "-40 -36 1130 752";
  }
}

export function metresBetween(a: Point, b: Point): number {
  const dx = ((a.x - b.x) / 100) * PITCH_L;
  const dy = ((a.y - b.y) / 100) * PITCH_W;
  return Math.hypot(dx, dy);
}

export interface Slot {
  role: string;
  x: number;
  y: number;
}

export const FORMATIONS: Record<string, Slot[]> = {
  "2-2": [
    { role: "LB", x: 18, y: 34 },
    { role: "RB", x: 18, y: 66 },
    { role: "LM", x: 34, y: 38 },
    { role: "RM", x: 34, y: 62 },
  ],
  Diamond: [
    { role: "6", x: 20, y: 50 },
    { role: "L", x: 32, y: 32 },
    { role: "R", x: 32, y: 68 },
    { role: "9", x: 44, y: 50 },
  ],
  "3-1": [
    { role: "L", x: 18, y: 32 },
    { role: "C", x: 16, y: 50 },
    { role: "R", x: 18, y: 68 },
    { role: "9", x: 36, y: 50 },
  ],
  "3-2-1": [
    { role: "LCB", x: 36, y: 32 },
    { role: "CB", x: 32, y: 50 },
    { role: "RCB", x: 36, y: 68 },
    { role: "LCM", x: 50, y: 38 },
    { role: "RCM", x: 50, y: 62 },
    { role: "9", x: 66, y: 50 },
  ],
  "4-2-3": [
    { role: "LB", x: 22, y: 14 },
    { role: "LCB", x: 18, y: 36 },
    { role: "RCB", x: 18, y: 64 },
    { role: "RB", x: 22, y: 86 },
    { role: "LDM", x: 36, y: 40 },
    { role: "RDM", x: 36, y: 60 },
    { role: "LW", x: 52, y: 16 },
    { role: "10", x: 54, y: 50 },
    { role: "RW", x: 52, y: 84 },
  ],
  "4-3-3": [
    { role: "LB", x: 22, y: 14 },
    { role: "LCB", x: 18, y: 36 },
    { role: "RCB", x: 18, y: 64 },
    { role: "RB", x: 22, y: 86 },
    { role: "LCM", x: 38, y: 30 },
    { role: "DM", x: 34, y: 50 },
    { role: "RCM", x: 38, y: 70 },
    { role: "LW", x: 62, y: 16 },
    { role: "ST", x: 66, y: 50 },
    { role: "RW", x: 62, y: 84 },
  ],
  "4-2-3-1": [
    { role: "LB", x: 22, y: 14 },
    { role: "LCB", x: 18, y: 36 },
    { role: "RCB", x: 18, y: 64 },
    { role: "RB", x: 22, y: 86 },
    { role: "LDM", x: 34, y: 40 },
    { role: "RDM", x: 34, y: 60 },
    { role: "LW", x: 52, y: 16 },
    { role: "10", x: 50, y: 50 },
    { role: "RW", x: 52, y: 84 },
    { role: "ST", x: 68, y: 50 },
  ],
  "3-5-2": [
    { role: "LCB", x: 20, y: 30 },
    { role: "CB", x: 16, y: 50 },
    { role: "RCB", x: 20, y: 70 },
    { role: "LWB", x: 34, y: 12 },
    { role: "RWB", x: 34, y: 88 },
    { role: "LCM", x: 36, y: 36 },
    { role: "RCM", x: 36, y: 64 },
    { role: "10", x: 50, y: 50 },
    { role: "LST", x: 64, y: 40 },
    { role: "RST", x: 64, y: 60 },
  ],
  "4-4-2": [
    { role: "LB", x: 22, y: 14 },
    { role: "LCB", x: 18, y: 36 },
    { role: "RCB", x: 18, y: 64 },
    { role: "RB", x: 22, y: 86 },
    { role: "LM", x: 40, y: 16 },
    { role: "LCM", x: 38, y: 38 },
    { role: "RCM", x: 38, y: 62 },
    { role: "RM", x: 40, y: 84 },
    { role: "LST", x: 62, y: 40 },
    { role: "RST", x: 62, y: 60 },
  ],
};

export function tokensForFormation(team: Team, name: string): Token[] {
  const slots = FORMATIONS[name] ?? FORMATIONS["4-3-3"];
  const gkX = team === "home" ? (name === "3-2-1" ? 22 : 6) : name === "3-2-1" ? 78 : 94;
  const tokens: Token[] = [
    {
      id: uid(),
      kind: "gk",
      team,
      number: 1,
      role: "GK",
      x: gkX,
      y: 50,
    },
  ];
  slots.forEach((slot, index) => {
    tokens.push({
      id: uid(),
      kind: "player",
      team,
      number: index + 2,
      role: slot.role,
      x: team === "home" ? slot.x : 100 - slot.x,
      y: slot.y,
    });
  });
  return tokens;
}

export function practiceRect(
  zone: Zone,
  lengthM: number,
  widthM: number,
): { x: number; y: number; w: number; h: number } | null {
  if (zone === "full") return null;
  const length = clamp(lengthM, 8, PITCH_L);
  const width = clamp(widthM, 8, PITCH_W);
  const anchors: Record<Exclude<Zone, "full">, Point> = {
    "defensive-third": { x: 20, y: 34 },
    "middle-third": { x: 52.5, y: 34 },
    "attacking-third": { x: 86, y: 34 },
    "left-channel": { x: 52.5, y: 12 },
    "right-channel": { x: 52.5, y: 56 },
    "half-space": { x: 72, y: 20 },
    "penalty-box": { x: 94, y: 34 },
  };
  const anchor = anchors[zone];
  const x = clamp(anchor.x - length / 2, 0, PITCH_L - length);
  const y = clamp(anchor.y - width / 2, 0, PITCH_W - width);
  return {
    x: (x / PITCH_L) * 100,
    y: (y / PITCH_W) * 100,
    w: (length / PITCH_L) * 100,
    h: (width / PITCH_W) * 100,
  };
}

export function polyline(points: Point[]): string {
  return points
    .map((point, index) => {
      const svg = toSvg(point);
      return `${index === 0 ? "M" : "L"} ${svg.x.toFixed(1)} ${svg.y.toFixed(1)}`;
    })
    .join(" ");
}

export function dribblePath(points: Point[]): string {
  if (points.length < 2) return "";
  const pts = points.map(toSvg);
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  const amp = 7;
  const wave = 16;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const a = pts[i];
    const b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const steps = Math.max(2, Math.round(len / wave));
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    for (let s = 1; s <= steps; s += 1) {
      const t = s / steps;
      const px = a.x + (b.x - a.x) * t;
      const py = a.y + (b.y - a.y) * t;
      const off = Math.sin(t * Math.PI * steps) * amp;
      d += ` L ${(px + nx * off).toFixed(1)} ${(py + ny * off).toFixed(1)}`;
    }
  }
  return d;
}

import type { Frame, Stroke, Tier, Token } from "../types";
import { clamp, metresBetween } from "./geometry";
import { uid } from "./id";
import type { Point } from "../types";

export interface PressResult {
  ok: boolean;
  tokens: Token[];
  strokes: Stroke[];
  summary: string;
}

function stepToward(from: Point, to: Point, factor: number, gapM: number): Point {
  let x = from.x + (to.x - from.x) * factor;
  let y = from.y + (to.y - from.y) * factor;
  const distance = metresBetween({ x, y }, to);
  if (distance < gapM && distance > 0.2) {
    const scale = gapM / distance;
    const dx = ((x - to.x) / 100) * 105;
    const dy = ((y - to.y) / 100) * 68;
    x = to.x + ((dx * scale) / 105) * 100;
    y = to.y + ((dy * scale) / 68) * 100;
  }
  return { x: clamp(x, 1.5, 98.5), y: clamp(y, 1.5, 98.5) };
}

export function suggestPress(frame: Frame, tier: Tier): PressResult {
  const ball = frame.tokens.find((token) => token.kind === "ball");
  const away = frame.tokens.filter(
    (token) => token.team === "away" && (token.kind === "player" || token.kind === "gk"),
  );
  if (!ball || away.length === 0) {
    return {
      ok: false,
      tokens: frame.tokens,
      strokes: frame.strokes,
      summary: "Place a ball and at least one opposition player, then suggest the press.",
    };
  }

  const ranked = [...away].sort((a, b) => metresBetween(a, ball) - metresBetween(b, ball));
  const count = tier === "5" || tier === "7" ? 2 : tier === "9" ? 3 : 4;
  const pressers = new Set(ranked.slice(0, Math.min(count, ranked.length)).map((token) => token.id));
  const factor = tier === "5" ? 0.45 : tier === "7" ? 0.52 : tier === "9" ? 0.58 : 0.66;
  const gap = tier === "11" ? 3.8 : tier === "9" ? 4.2 : 4.8;

  const tokens = frame.tokens.map((token) => {
    if (token.kind === "gk") return token;
    if (pressers.has(token.id)) {
      const next = stepToward(token, ball, factor, gap);
      return { ...token, ...next };
    }
    if ((tier === "11" || tier === "9") && token.team === "away" && token.kind === "player") {
      return {
        ...token,
        x: clamp(token.x + (ball.x - token.x) * 0.14, 1.5, 98.5),
        y: clamp(token.y + (ball.y - token.y) * 0.2, 1.5, 98.5),
      };
    }
    return token;
  });

  const zoneW = tier === "11" ? 18 : tier === "9" ? 16 : 13;
  const zoneH = tier === "11" ? 30 : tier === "9" ? 24 : 20;
  const strokes: Stroke[] = [
    ...frame.strokes,
    {
      id: uid(),
      kind: "press",
      team: "away",
      points: [
        { x: ball.x - zoneW / 2, y: ball.y - zoneH / 2 },
        { x: ball.x + zoneW / 2, y: ball.y + zoneH / 2 },
      ],
    },
  ];

  for (const id of pressers) {
    const from = frame.tokens.find((token) => token.id === id);
    const to = tokens.find((token) => token.id === id);
    if (!from || !to) continue;
    strokes.push({
      id: uid(),
      kind: "run",
      team: "away",
      points: [
        { x: from.x, y: from.y },
        { x: to.x, y: to.y },
      ],
    });
  }

  const summary =
    tier === "5" || tier === "7"
      ? "Nearest two step in and lock the ball. Individual pressure, the rest stay."
      : tier === "9"
        ? "The unit of three curves the press and takes away the inside pass."
        : "The line jumps on the trigger. Ball-side locks, the rest narrow and keep cover.";

  return { ok: true, tokens, strokes, summary };
}

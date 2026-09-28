import type { Frame, Token } from "../types";

function samePiece(a: Token, b: Token): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "ball") return true;
  if (a.kind === "player" || a.kind === "gk") {
    return a.team === b.team && a.number === b.number;
  }
  return false;
}

function findMatch(tokens: Token[], token: Token): Token | undefined {
  return tokens.find((item) => item.id === token.id) ?? tokens.find((item) => samePiece(item, token));
}

export function sampleFrame(frames: Frame[], t: number): { tokens: Token[]; strokes: Frame["strokes"] } {
  if (frames.length === 0) return { tokens: [], strokes: [] };
  const max = frames.length - 1;
  const clamped = Math.min(Math.max(t, 0), max);
  const i = Math.floor(clamped);
  const j = Math.min(i + 1, max);
  const local = clamped - i;
  if (i === j) return { tokens: frames[i].tokens, strokes: frames[i].strokes };

  const from = frames[i];
  const to = frames[j];
  const eased = local * local * (3 - 2 * local);
  const used = new Set<string>();
  const tokens: Token[] = [];

  for (const token of to.tokens) {
    const prev = findMatch(from.tokens, token);
    if (prev) {
      used.add(prev.id);
      tokens.push({
        ...token,
        x: prev.x + (token.x - prev.x) * eased,
        y: prev.y + (token.y - prev.y) * eased,
      });
    } else if (eased > 0.5) {
      tokens.push(token);
    }
  }

  for (const token of from.tokens) {
    if (!used.has(token.id) && !findMatch(to.tokens, token) && eased < 0.5) {
      tokens.push(token);
    }
  }

  return { tokens, strokes: eased > 0.45 ? to.strokes : from.strokes };
}

import type { SeasonSheet, Session, SquadPlayer, Team, Token } from "../types";
import { uid } from "./id";

const SAMPLE: { number: number; name: string; position: string }[] = [
  { number: 1, name: "Callum Reid", position: "GK" },
  { number: 2, name: "Fraser Dunn", position: "RB" },
  { number: 3, name: "Euan Mackay", position: "LB" },
  { number: 4, name: "Lewis Grant", position: "RCB" },
  { number: 5, name: "Hamish Cole", position: "LCB" },
  { number: 6, name: "Rory Blake", position: "DM" },
  { number: 7, name: "Jamie Kerr", position: "RW" },
  { number: 8, name: "Owen Fraser", position: "CM" },
  { number: 9, name: "Archie Bell", position: "ST" },
  { number: 10, name: "Finn Murray", position: "AM" },
  { number: 11, name: "Kyle Ross", position: "LW" },
  { number: 12, name: "Ben Shaw", position: "GK" },
  { number: 14, name: "Tom Weir", position: "CB" },
  { number: 16, name: "Jack Neil", position: "CM" },
  { number: 18, name: "Sam Doyle", position: "ST" },
];

const FAMILIES: Record<string, string[]> = {
  gk: ["gk", "goalkeeper", "keeper"],
  cb: ["cb", "lcb", "rcb"],
  fb: ["lb", "rb", "lwb", "rwb", "fb", "wb"],
  dm: ["dm", "cdm", "ldm", "rdm", "6"],
  cm: ["cm", "lcm", "rcm", "8"],
  am: ["am", "cam", "10"],
  w: ["lw", "rw", "lm", "rm"],
  st: ["st", "cf", "lst", "rst", "9"],
};

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function family(value: string): string | null {
  const key = normalise(value);
  if (!key) return null;
  for (const [name, aliases] of Object.entries(FAMILIES)) {
    if (aliases.includes(key)) return name;
  }
  return null;
}

function side(value: string): "l" | "r" | null {
  const key = value.trim().toLowerCase();
  if (key.startsWith("l")) return "l";
  if (key.startsWith("r")) return "r";
  return null;
}

export function isGoalkeeper(position: string): boolean {
  return family(position) === "gk";
}

export function roleFits(role: string | undefined, position: string): boolean {
  if (!role?.trim()) return false;
  const left = family(role);
  const right = family(position);
  if (left && right) return left === right;
  return normalise(role) === normalise(position);
}

function sameSide(role: string | undefined, position: string): boolean {
  if (!roleFits(role, position)) return false;
  const roleSide = side(role ?? "");
  const positionSide = side(position);
  if (roleSide && positionSide) return roleSide === positionSide;
  return true;
}

export function shortName(name?: string): string {
  const trimmed = name?.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  const last = parts[parts.length - 1];
  return last.length > 12 ? `${last.slice(0, 11)}…` : last;
}

export function isSquadPlayer(value: unknown): value is SquadPlayer {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<SquadPlayer>;
  return typeof player.id === "string" && typeof player.name === "string" && typeof player.number === "number" && typeof player.position === "string";
}

export function isSeason(value: unknown): value is SeasonSheet {
  if (!value || typeof value !== "object") return false;
  const season = value as Partial<SeasonSheet>;
  return (
    typeof season.id === "string" &&
    typeof season.name === "string" &&
    typeof season.season === "string" &&
    typeof season.club === "string" &&
    Array.isArray(season.players) &&
    season.players.every((player) => isSquadPlayer(player))
  );
}

export function samplePlayers(): SquadPlayer[] {
  return SAMPLE.map((player) => ({ ...player, id: uid() }));
}

export function blankSeason(season = "2026/27"): SeasonSheet {
  return {
    id: uid(),
    name: "First team",
    season,
    club: "",
    players: [],
  };
}

export function starterSeason(): SeasonSheet {
  return {
    ...blankSeason(),
    club: "",
    players: samplePlayers(),
  };
}

export function nextShirt(players: SquadPlayer[]): number {
  const used = new Set(players.map((player) => player.number));
  for (let number = 1; number <= 99; number += 1) {
    if (!used.has(number)) return number;
  }
  return players.length + 1;
}

export function nextSquadPick(players: SquadPlayer[], tokens: Token[], team: Team, gk: boolean): SquadPlayer | undefined {
  const usedIds = new Set(
    tokens.map((token) => token.squadPlayerId).filter((id): id is string => Boolean(id)),
  );
  const usedNumbers = new Set(
    tokens
      .filter((token) => token.team === team && (token.kind === "player" || token.kind === "gk"))
      .map((token) => token.number),
  );
  const available = [...players]
    .sort((a, b) => a.number - b.number)
    .filter((player) => !usedIds.has(player.id) && !usedNumbers.has(player.number));
  if (gk) return available.find((player) => isGoalkeeper(player.position)) ?? available[0];
  return available.find((player) => !isGoalkeeper(player.position)) ?? available[0];
}

export function stampFromSquad(tokens: Token[], players: SquadPlayer[], team: Team = "home"): Token[] {
  const pool = [...players].sort((a, b) => a.number - b.number);
  const used = new Set<string>();
  for (const token of tokens) {
    if (token.team === team && token.squadPlayerId && pool.some((player) => player.id === token.squadPlayerId)) {
      used.add(token.squadPlayerId);
    }
  }
  const take = (pred?: (player: SquadPlayer) => boolean) => {
    const found = pool.find((player) => !used.has(player.id) && (!pred || pred(player)));
    if (!found) return undefined;
    used.add(found.id);
    return found;
  };
  return tokens.map((token) => {
    if (token.team !== team || (token.kind !== "player" && token.kind !== "gk")) return token;
    if (token.squadPlayerId) {
      const existing = pool.find((player) => player.id === token.squadPlayerId);
      if (existing) {
        return {
          ...token,
          number: existing.number,
          name: existing.name,
          role: token.role || existing.position,
        };
      }
    }
    const pick =
      token.kind === "gk"
        ? (take((player) => isGoalkeeper(player.position)) ?? take())
        : (take((player) => sameSide(token.role, player.position)) ??
          take((player) => roleFits(token.role, player.position)) ??
          take((player) => !isGoalkeeper(player.position)) ??
          take());
    if (!pick) return token;
    return {
      ...token,
      number: pick.number,
      name: pick.name,
      squadPlayerId: pick.id,
      role: token.role || pick.position,
    };
  });
}

export function syncSquadPlayer(session: Session, previous: SquadPlayer, player: SquadPlayer): Session {
  return {
    ...session,
    phases: session.phases.map((phase) => ({
      ...phase,
      frames: phase.frames.map((frame) => ({
        ...frame,
        tokens: frame.tokens.map((token) => {
          if (token.squadPlayerId !== player.id) return token;
          const role = !token.role || token.role === previous.position ? player.position : token.role;
          return { ...token, number: player.number, name: player.name, role };
        }),
      })),
    })),
  };
}

export function detachSquadPlayer(session: Session, playerId: string): Session {
  return {
    ...session,
    phases: session.phases.map((phase) => ({
      ...phase,
      frames: phase.frames.map((frame) => ({
        ...frame,
        tokens: frame.tokens.map((token) =>
          token.squadPlayerId === playerId ? { ...token, squadPlayerId: undefined } : token,
        ),
      })),
    })),
  };
}

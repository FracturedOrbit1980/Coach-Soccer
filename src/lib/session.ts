import { PHASE_META, SCAFFOLDS } from "../data/scaffolding";
import type { Frame, Phase, PhaseType, Session, Tier, Token } from "../types";
import { uid } from "./id";

export function now(): string {
  return new Date().toISOString();
}

export function cloneSession(session: Session): Session {
  return structuredClone(session);
}

export function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<Session>;
  if (session.tier !== "C" && session.tier !== "B" && session.tier !== "A") return false;
  if (typeof session.title !== "string" || !Array.isArray(session.phases) || session.phases.length === 0) {
    return false;
  }
  if (!session.opponent || typeof session.opponent !== "object") return false;
  return session.phases.every((phase) => {
    if (!phase || typeof phase !== "object") return false;
    return Array.isArray(phase.frames) && phase.frames.length > 0 && Array.isArray(phase.coachingPoints);
  });
}

export function blankFrame(note = "Start picture"): Frame {
  return { id: uid(), note, tokens: [], strokes: [] };
}

export function cloneFrame(frame: Frame): Frame {
  return {
    id: uid(),
    note: frame.note,
    tokens: frame.tokens.map((token) => ({ ...token })),
    strokes: frame.strokes.map((stroke) => ({
      ...stroke,
      id: uid(),
      points: stroke.points.map((point) => ({ ...point })),
    })),
  };
}

export function blankPhase(type: PhaseType, tier: Tier): Phase {
  const meta = PHASE_META[type];
  const scale = tier === "C" ? 0.75 : tier === "B" ? 0.9 : 1;
  return {
    id: uid(),
    type,
    title: meta.label,
    minutes: meta.minutes,
    lengthM: type === "game" ? meta.length : Math.round(meta.length * scale),
    widthM: type === "game" ? meta.width : Math.round(meta.width * scale),
    zone: meta.zone,
    organisation: "",
    coachingPoints: [],
    interventions: [],
    questions: [],
    frames: [blankFrame()],
  };
}

export function blankSession(tier: Tier = "B"): Session {
  const phase = blankPhase("warmup", tier);
  return {
    id: uid(),
    title: "Untitled session",
    tier,
    ageGroup: tier === "C" ? "U12–U14" : tier === "B" ? "U15–U16" : "Senior",
    duration: phase.minutes,
    theme: "",
    moment: "in-possession",
    principle: "",
    what: "",
    where: "",
    who: "",
    when: "",
    why: "",
    coachBehaviours: [],
    interventionStyles: [],
    environment: "",
    playerFocus: [],
    opponent: { shape: "", buildUp: "", pressTrigger: "", weakness: "" },
    phases: [phase],
    updatedAt: now(),
  };
}

export function leadPhase(session: Session): { phaseId: string; frameId: string } {
  const phase = session.phases.find((item) => item.frames.length > 1) ?? session.phases[0];
  return { phaseId: phase.id, frameId: phase.frames[0].id };
}

export function updatePhase(session: Session, phaseId: string, fn: (phase: Phase) => Phase): Session {
  return {
    ...session,
    phases: session.phases.map((phase) => (phase.id === phaseId ? fn(phase) : phase)),
  };
}

export function updateFrame(
  session: Session,
  phaseId: string,
  frameId: string,
  fn: (frame: Frame) => Frame,
): Session {
  return updatePhase(session, phaseId, (phase) => ({
    ...phase,
    frames: phase.frames.map((frame) => (frame.id === frameId ? fn(frame) : frame)),
  }));
}

export function nextNumber(tokens: Token[], team: Token["team"]): number {
  const used = new Set(
    tokens
      .filter((token) => token.team === team && (token.kind === "player" || token.kind === "gk"))
      .map((token) => token.number ?? 0),
  );
  for (let number = 1; number <= 11; number += 1) {
    if (!used.has(number)) return number;
  }
  return used.size + 1;
}

export function playerCount(tokens: Token[], team: Token["team"]): number {
  return tokens.filter((token) => token.team === team && (token.kind === "player" || token.kind === "gk")).length;
}

export function slug(name: string): string {
  const value = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return value || "session";
}

export function tierLabel(tier: Tier): string {
  return SCAFFOLDS[tier].name;
}

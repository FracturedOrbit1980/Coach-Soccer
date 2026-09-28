import type { InspectorTab, Session } from "../types";
import { SCAFFOLDS } from "../data/scaffolding";

export interface Check {
  id: string;
  label: string;
  detail: string;
  ok: boolean;
  tab: InspectorTab;
}

function filled(value: string): boolean {
  return value.trim().length > 1;
}

export function validate(session: Session): { score: number; max: number; checks: Check[] } {
  const scaffold = SCAFFOLDS[session.tier];
  const minutes = session.phases.reduce((sum, phase) => sum + (Number(phase.minutes) || 0), 0);
  const questions = session.phases.reduce(
    (sum, phase) => sum + phase.questions.filter((item) => item.trim()).length,
    0,
  );
  const pointsMissing = session.phases.some((phase) => !phase.coachingPoints.some((item) => item.trim()));
  const hasPicture = session.phases.some((phase) =>
    phase.frames.some((frame) => {
      const players = frame.tokens.filter((token) => token.kind === "player" || token.kind === "gk").length;
      const ball = frame.tokens.some((token) => token.kind === "ball");
      return ball && players >= 2;
    }),
  );
  const animated = session.phases.some((phase) => phase.frames.length > 1);

  const tierOk = (() => {
    if (session.tier === "C") {
      const hasSsg = session.phases.some((phase) => phase.type === "ssg");
      const hasGame = session.phases.some((phase) => phase.type === "game");
      const small = session.phases.every((phase) => phase.lengthM <= 55);
      return hasSsg && !hasGame && small;
    }
    if (session.tier === "B") {
      return session.phases.some((phase) => phase.type === "functional") && session.when.trim().length > 8;
    }
    return (
      session.phases.some((phase) => phase.type === "game") &&
      filled(session.opponent.shape) &&
      filled(session.opponent.pressTrigger) &&
      filled(session.opponent.weakness)
    );
  })();

  const tierDetail =
    session.tier === "C"
      ? "Include a small-sided game, keep areas at 55m or under, and leave 11v11 for later licences."
      : session.tier === "B"
        ? "Add a functional phase and write the trigger in When."
        : "Add an 11v11 phase and complete the opponent shape, trigger, and weakness.";

  const checks: Check[] = [
    { id: "title", label: "Session title", detail: "Name the session so a colleague can find it.", ok: filled(session.title) && session.title !== "Untitled session", tab: "session" },
    { id: "principle", label: "Principle", detail: "One sentence the whole session serves.", ok: filled(session.principle), tab: "session" },
    { id: "what", label: "What", detail: "The action or problem in the game.", ok: filled(session.what), tab: "session" },
    { id: "where", label: "Where", detail: "The zone of the pitch.", ok: filled(session.where), tab: "session" },
    { id: "who", label: "Who", detail: "The players or the unit.", ok: filled(session.who), tab: "session" },
    { id: "when", label: "When", detail: "The trigger or the moment it happens.", ok: filled(session.when), tab: "session" },
    { id: "why", label: "Why", detail: "The effect you want on the game.", ok: filled(session.why), tab: "session" },
    { id: "duration", label: "Time adds up", detail: `Phases total ${minutes}′. Session is set to ${session.duration}′.`, ok: Math.abs(minutes - session.duration) <= 5, tab: "phase" },
    { id: "points", label: "Coaching points", detail: "Every phase needs at least one point you will actually say.", ok: session.phases.length > 0 && !pointsMissing, tab: "phase" },
    { id: "questions", label: "Guided questions", detail: "At least two questions across the session.", ok: questions >= 2, tab: "phase" },
    { id: "focus", label: "Player focus", detail: "Tick the side of the player you are developing.", ok: session.playerFocus.length > 0, tab: "pillars" },
    { id: "environment", label: "Environment", detail: "Area, numbers, and the climate you want.", ok: session.environment.trim().length > 12, tab: "pillars" },
    { id: "style", label: "Intervention style", detail: "How you will get in and out of the practice.", ok: session.interventionStyles.length > 0, tab: "pillars" },
    { id: "picture", label: "Picture on the pitch", detail: "A ball and at least two players in one frame.", ok: hasPicture, tab: "phase" },
    { id: "animate", label: "Second picture", detail: "Add a keyframe so the idea can move.", ok: animated, tab: "phase" },
    { id: "tier", label: `${scaffold.name} fit`, detail: tierDetail, ok: tierOk, tab: "session" },
  ];

  return { score: checks.filter((check) => check.ok).length, max: checks.length, checks };
}

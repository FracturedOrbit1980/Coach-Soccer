import type { Client, Competency, IndividualDevelopment, PlayerProfile, Review, StaffRole } from "../types";
import { COACHING_AXES } from "../data/competencies";
import { uid } from "./id";
import { now } from "./session";

export function axesToCompetencies(labels: readonly string[]): Competency[] {
  return labels.map((label) => ({ id: uid(), label }));
}

export function emptyScores(competencies: Competency[], seed = 5): Record<string, number> {
  return Object.fromEntries(competencies.map((item) => [item.id, seed]));
}

export function makeReview(competencies: Competency[], scores?: Record<string, number>, note = "Starting profile"): Review {
  return {
    id: uid(),
    date: new Date().toISOString().slice(0, 10),
    note,
    scores: scores ?? emptyScores(competencies),
  };
}

export function defaultIndividualDevelopment(): IndividualDevelopment {
  return {
    strengths: "Quick first touch; agility and close control in 1v1 situations.",
    growthAreas: "Disguise when executing turns and weak-foot ball mastery.",
    targetMilestone: "Reach 50 keep-ups and execute game-speed Cruyff and scissor cuts.",
    insights:
      "Daily 15-minute 1-person ball mastery: focus on inside/outside cuts, 1v1 moves to beat players, and juggling ladders.",
    ballMastery: {
      dribbling: 6,
      turning: 6,
      movesToBeat: 5,
      juggling: 5,
      firstTouch: 6,
      weakFoot: 5,
    },
    completedSkillIds: [],
    feedback: {
      positives: "High work-rate, sharp scanning before receiving, and brave when taking players on 1v1.",
      workOns: "Look to release the ball quicker when double-teamed; continue working on left-foot turning disguise.",
      suggestedDrillIds: ["5s-1v1-dual-goals", "7s-buildup-pivot"],
    },
  };
}

export function makePlayerProfile(input: {
  name: string;
  age: string;
  club: string;
  position: string;
  dominantFoot?: "Right" | "Left" | "Both";
}): PlayerProfile {
  const competencies = axesToCompetencies(COACHING_AXES);
  const stamp = now();
  return {
    id: uid(),
    name: input.name.trim() || "New Player",
    age: input.age.trim(),
    club: input.club.trim(),
    position: input.position.trim(),
    dominantFoot: input.dominantFoot ?? "Right",
    notes: "",
    individualDevelopment: defaultIndividualDevelopment(),
    competencies,
    reviews: [makeReview(competencies)],
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export const makeClient = makePlayerProfile;

export function isClient(value: unknown): value is Client {
  if (!value || typeof value !== "object") return false;
  const client = value as Partial<Client>;
  return typeof client.id === "string" && typeof client.name === "string" && Array.isArray(client.competencies) && Array.isArray(client.reviews);
}

export const isPlayerProfile = isClient;

export function isStaffRole(value: unknown): value is StaffRole {
  return value === "coach" || value === "assistant";
}

export function roleLabel(role: StaffRole): string {
  return role === "assistant" ? "Assistant coach" : "Coach";
}

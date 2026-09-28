import type { Client, Competency, Review, StaffRole } from "../types";
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

export function makeClient(input: { name: string; age: string; club: string; position: string }): Client {
  const competencies = axesToCompetencies(COACHING_AXES);
  const stamp = now();
  return {
    id: uid(),
    name: input.name.trim() || "Unnamed client",
    age: input.age.trim(),
    club: input.club.trim(),
    position: input.position.trim(),
    notes: "",
    competencies,
    reviews: [makeReview(competencies)],
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function isClient(value: unknown): value is Client {
  if (!value || typeof value !== "object") return false;
  const client = value as Partial<Client>;
  return typeof client.id === "string" && typeof client.name === "string" && Array.isArray(client.competencies) && Array.isArray(client.reviews);
}

export function isStaffRole(value: unknown): value is StaffRole {
  return value === "coach" || value === "assistant";
}

export function roleLabel(role: StaffRole): string {
  return role === "assistant" ? "Assistant coach" : "Coach";
}

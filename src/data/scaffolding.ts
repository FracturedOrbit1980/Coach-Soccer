import type { Moment, PhaseType, PlayerFocus, Tier, Zone } from "../types";

export interface Scaffold {
  tier: Tier;
  name: string;
  headline: string;
  summary: string;
  focus: string[];
  phaseTypes: PhaseType[];
  formations: string[];
  maxPlayers: number;
  questions: string[];
  interventions: string[];
  watchouts: string[];
}

export const SCAFFOLDS: Record<Tier, Scaffold> = {
  C: {
    tier: "C",
    name: "UEFA C",
    headline: "Fundamentals and small-sided games",
    summary:
      "Keep the picture simple, the area tight, and the repetition high. Coach the player in front of you: first touch, body shape, and one idea at a time.",
    focus: [
      "Technical detail under light pressure",
      "Recognise a free player",
      "Small-sided games with a clear outcome",
      "Interventions the player can use on the next rep",
    ],
    phaseTypes: ["warmup", "technical", "ssg"],
    formations: ["2-2", "Diamond", "3-1"],
    maxPlayers: 7,
    questions: [
      "Where is the free player?",
      "Can your first touch take you away from the press?",
      "Which foot lets you see the next pass?",
      "What happens if both of you jump at the ball?",
    ],
    interventions: ["Demo", "Freeze", "Concurrent", "Q&A"],
    watchouts: [
      "Stay at 7v7 or smaller.",
      "One coaching point at a time.",
      "If the game gets noisy, shrink the area before you add a rule.",
    ],
  },
  B: {
    tier: "B",
    name: "UEFA B",
    headline: "Units, functions, and transitions",
    summary:
      "Coach a unit inside the team game. The practice needs a real opponent problem, a trigger, and a picture for both moments.",
    focus: [
      "Units of the back line, midfield, and front line",
      "Functional practices with realistic pressure",
      "Triggers to press, drop, or play forward",
      "Both phases of a transition",
    ],
    phaseTypes: ["warmup", "technical", "functional", "ssg"],
    formations: ["3-2-1", "4-3-3", "4-2-3"],
    maxPlayers: 9,
    questions: [
      "What is the trigger to jump?",
      "Who locks the ball, and who covers the next pass?",
      "If the ball travels inside, which body jumps?",
      "What does the rest of the unit do in the same moment?",
    ],
    interventions: ["Freeze", "Walkthrough", "Guided discovery", "Concurrent"],
    watchouts: [
      "Name the unit you are coaching.",
      "Put the trigger in When, not only in the theme.",
      "A functional practice needs an opponent action, not only a mannequin.",
    ],
  },
  A: {
    tier: "A",
    name: "UEFA A",
    headline: "Game model and opponent strategy",
    summary:
      "The session is a piece of the game model. Coach the team against a specific opponent idea, and let the 11v11 confirm the principle.",
    focus: [
      "11v11 structure and a named game model",
      "Opponent build-up, trigger, and weakness",
      "One principle carried through the whole session",
      "Connections between units, not isolated shapes",
    ],
    phaseTypes: ["warmup", "technical", "functional", "ssg", "game"],
    formations: ["4-3-3", "4-2-3-1", "3-5-2", "4-4-2"],
    maxPlayers: 11,
    questions: [
      "How does the press change if their 6 drops between the centre-backs?",
      "What is the cue for the far-side winger?",
      "Where is the cover if we jump and they play through the first line?",
      "Which game-model principle is this repetition for?",
    ],
    interventions: ["Walkthrough", "Guided discovery", "Terminal", "Q&A"],
    watchouts: [
      "Fill the opponent model before you draw the press.",
      "The 11v11 should test the same principle as the functional practice.",
      "Prefer a constraint that keeps the game alive over a long stoppage.",
    ],
  },
};

export const PHASE_META: Record<
  PhaseType,
  { label: string; hint: string; minutes: number; length: number; width: number; zone: Zone }
> = {
  warmup: {
    label: "Warm-up",
    hint: "Prepare the picture and the body.",
    minutes: 12,
    length: 20,
    width: 20,
    zone: "middle-third",
  },
  technical: {
    label: "Technical",
    hint: "Repeat the action with one clear detail.",
    minutes: 15,
    length: 32,
    width: 24,
    zone: "defensive-third",
  },
  functional: {
    label: "Functional",
    hint: "A unit against an opponent problem.",
    minutes: 20,
    length: 50,
    width: 40,
    zone: "middle-third",
  },
  ssg: {
    label: "Small-sided game",
    hint: "Let the game test the idea.",
    minutes: 20,
    length: 40,
    width: 30,
    zone: "middle-third",
  },
  game: {
    label: "11v11 game",
    hint: "The principle under match conditions.",
    minutes: 30,
    length: 105,
    width: 68,
    zone: "full",
  },
};

export const MOMENTS: { id: Moment; label: string }[] = [
  { id: "in-possession", label: "In possession" },
  { id: "out-of-possession", label: "Out of possession" },
  { id: "transition-attack", label: "Transition to attack" },
  { id: "transition-defend", label: "Transition to defend" },
];

export const ZONES: { id: Zone; label: string }[] = [
  { id: "full", label: "Full pitch" },
  { id: "defensive-third", label: "Defensive third" },
  { id: "middle-third", label: "Middle third" },
  { id: "attacking-third", label: "Attacking third" },
  { id: "left-channel", label: "Left channel" },
  { id: "right-channel", label: "Right channel" },
  { id: "half-space", label: "Half-space" },
  { id: "penalty-box", label: "Penalty box" },
];

export const AGE_GROUPS = ["U8–U11", "U12–U14", "U15–U16", "U17–U19", "Senior", "Adult amateur"];

export const BEHAVIOURS = [
  "Positive and specific",
  "Player-centred language",
  "Scan the picture before speaking",
  "One voice at a time",
  "Demo, then play",
  "Silence after the question",
  "Challenge the picture, not the person",
];

export const INTERVENTION_STYLES = [
  "Command",
  "Q&A",
  "Guided discovery",
  "Freeze",
  "Concurrent",
  "Terminal",
  "Walkthrough",
  "Demo",
];

export const FOCUS: { id: PlayerFocus; label: string; hint: string }[] = [
  { id: "technical", label: "Technical", hint: "Action, surface, body shape" },
  { id: "physical", label: "Physical", hint: "Acceleration, duel, repeat sprint" },
  { id: "psychological", label: "Psychological", hint: "Decision, composure, scan" },
  { id: "social", label: "Social", hint: "Communication, role, help" },
];

export const PILLARS = [
  {
    id: "coach",
    title: "The Coach",
    copy: "Behaviours, intervention, and the timing of your voice.",
  },
  {
    id: "environment",
    title: "The Environment",
    copy: "Area, numbers, constraints, and the climate of the session.",
  },
  {
    id: "player",
    title: "The Player",
    copy: "Technical, physical, psychological, and social detail.",
  },
  {
    id: "game",
    title: "The Game",
    copy: "Moment, principle, and the problem the opponent sets.",
  },
] as const;

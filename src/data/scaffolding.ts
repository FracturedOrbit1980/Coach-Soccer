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

export const FORMATS: Tier[] = ["5", "7", "9", "11"];

export const SCAFFOLDS: Record<Tier, Scaffold> = {
  "5": {
    tier: "5",
    name: "5-a-side",
    headline: "Touches, pictures, and a small goal",
    summary:
      "Grassroots football. Keep the area tight, the repetition high, and the idea to one thing the player can use on the next touch.",
    focus: [
      "First touch and body shape",
      "See the free player",
      "Score, or keep the ball, in a small game",
      "A coaching point short enough to say at a stop",
    ],
    phaseTypes: ["warmup", "technical", "ssg"],
    formations: ["2-2", "Diamond", "3-1"],
    maxPlayers: 5,
    questions: [
      "Where is the free player?",
      "Can your first touch take you away from the press?",
      "Which foot lets you see the next pass?",
      "What happens if both of you jump at the ball?",
    ],
    interventions: ["Demo", "Freeze", "Concurrent", "Q&A"],
    watchouts: [
      "Stay at 5v5 or smaller.",
      "One coaching point at a time.",
      "If the game gets noisy, shrink the area before you add a rule.",
    ],
  },
  "7": {
    tier: "7",
    name: "7-a-side",
    headline: "A shape, without the full pitch",
    summary:
      "The age where a back line and a front line show up. Coach the relationship between them, still inside a game the players can see.",
    focus: [
      "A back line that steps together",
      "A forward who pins, or comes short",
      "The first pass out of pressure",
      "Both moments of a turnover",
    ],
    phaseTypes: ["warmup", "technical", "functional", "ssg"],
    formations: ["2-3-1", "3-2-1", "2-1-2-1"],
    maxPlayers: 7,
    questions: [
      "When do the two at the back step?",
      "Who is free if the ball goes inside?",
      "Can the forward come and still threaten the goal?",
      "What does the rest of the team do on the turnover?",
    ],
    interventions: ["Freeze", "Demo", "Guided discovery", "Concurrent"],
    watchouts: [
      "Name the unit you are coaching.",
      "Keep the area inside 60 metres.",
      "A mini goal should face the game you actually want.",
    ],
  },
  "9": {
    tier: "9",
    name: "9-a-side",
    headline: "Width, a unit, and a trigger",
    summary:
      "Youth football with enough players to coach a press and a wide player. The practice needs an opponent problem and a moment to jump.",
    focus: [
      "Units of the back line, midfield, and front line",
      "A trigger to press, drop, or play forward",
      "Width and the half-space",
      "The picture on both sides of a turnover",
    ],
    phaseTypes: ["warmup", "technical", "functional", "ssg"],
    formations: ["3-2-3", "3-3-2", "2-3-2-1"],
    maxPlayers: 9,
    questions: [
      "What is the trigger to jump?",
      "Who locks the ball, and who covers the next pass?",
      "If the ball travels inside, which body jumps?",
      "What does the rest of the unit do in the same moment?",
    ],
    interventions: ["Freeze", "Walkthrough", "Guided discovery", "Concurrent"],
    watchouts: [
      "Put the trigger in When, not only in the theme.",
      "A functional practice needs an opponent action, not only a mannequin.",
      "Keep one principle through the whole session.",
    ],
  },
  "11": {
    tier: "11",
    name: "11-a-side",
    headline: "The full game, from GDL to pro",
    summary:
      "Match shape. Coach the team against a specific opponent idea, and let the game confirm the principle.",
    focus: [
      "A named shape and one principle",
      "Opponent build-up, trigger, and weakness",
      "Connections between units",
      "The same idea in the practice and the match",
    ],
    phaseTypes: ["warmup", "technical", "functional", "ssg", "game"],
    formations: ["4-3-3", "4-2-3-1", "3-5-2", "4-4-2"],
    maxPlayers: 11,
    questions: [
      "How does the press change if their 6 drops between the centre-backs?",
      "What is the cue for the far-side winger?",
      "Where is the cover if we jump and they play through the first line?",
      "Which principle is this repetition for?",
    ],
    interventions: ["Walkthrough", "Guided discovery", "Terminal", "Q&A"],
    watchouts: [
      "Fill the opponent model before you draw the press.",
      "The match should test the same principle as the practice.",
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
    label: "Match",
    hint: "The principle in the format you are coaching.",
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

export const AGE_GROUPS = [
  "Grassroots U6",
  "Grassroots U7",
  "Grassroots U8",
  "Grassroots U9",
  "Grassroots U10",
  "Grassroots U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U18",
  "U19",
  "U21",
  "GDL",
  "Pro",
];

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

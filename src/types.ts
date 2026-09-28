export type Tier = "C" | "B" | "A";

export type Moment =
  | "in-possession"
  | "out-of-possession"
  | "transition-attack"
  | "transition-defend";

export type PhaseType = "warmup" | "technical" | "functional" | "ssg" | "game";

export type Zone =
  | "full"
  | "defensive-third"
  | "middle-third"
  | "attacking-third"
  | "left-channel"
  | "right-channel"
  | "half-space"
  | "penalty-box";

export type PitchView = "full" | "half" | "box" | "thirds" | "channels";

export type Tool =
  | "select"
  | "home"
  | "away"
  | "gk-home"
  | "gk-away"
  | "ball"
  | "cone"
  | "mannequin"
  | "goal"
  | "pole"
  | "pass"
  | "run"
  | "dribble"
  | "press"
  | "marker"
  | "erase";

export type TokenKind =
  | "player"
  | "gk"
  | "ball"
  | "cone"
  | "mannequin"
  | "goal"
  | "pole"
  | "marker";

export type Team = "home" | "away";

export type StrokeKind = "pass" | "run" | "dribble" | "press";

export type PlayerFocus = "technical" | "physical" | "psychological" | "social";

export type InspectorTab = "session" | "phase" | "method" | "pillars";

export interface Point {
  x: number;
  y: number;
}

export interface Token {
  id: string;
  kind: TokenKind;
  team?: Team;
  number?: number;
  role?: string;
  label?: string;
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  kind: StrokeKind;
  team: Team;
  points: Point[];
}

export interface Frame {
  id: string;
  note: string;
  tokens: Token[];
  strokes: Stroke[];
}

export interface Phase {
  id: string;
  type: PhaseType;
  title: string;
  minutes: number;
  lengthM: number;
  widthM: number;
  zone: Zone;
  organisation: string;
  coachingPoints: string[];
  interventions: string[];
  questions: string[];
  frames: Frame[];
}

export interface Opponent {
  shape: string;
  buildUp: string;
  pressTrigger: string;
  weakness: string;
}

export type StaffRole = "coach" | "assistant";

export interface Competency {
  id: string;
  label: string;
}

export interface Review {
  id: string;
  date: string;
  note: string;
  scores: Record<string, number>;
}

export interface Client {
  id: string;
  name: string;
  age: string;
  club: string;
  position: string;
  notes: string;
  competencies: Competency[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  title: string;
  tier: Tier;
  clientId?: string;
  ageGroup: string;
  duration: number;
  theme: string;
  moment: Moment;
  principle: string;
  what: string;
  where: string;
  who: string;
  when: string;
  why: string;
  coachBehaviours: string[];
  interventionStyles: string[];
  environment: string;
  playerFocus: PlayerFocus[];
  opponent: Opponent;
  phases: Phase[];
  updatedAt: string;
}

export interface LibraryEntry {
  id: string;
  name: string;
  tier: Tier;
  updatedAt: string;
  session: Session;
  clientId?: string;
  savedBy?: StaffRole;
}

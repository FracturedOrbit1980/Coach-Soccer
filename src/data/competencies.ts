export const COACHING_AXES = [
  "Scanning",
  "First touch",
  "Passing",
  "Dribbling",
  "Receiving",
  "Pressing",
  "Duels",
  "Positioning",
  "Communication",
  "Composure",
];

export const BALL_MASTERY_AXES = [
  "Dribble: Close Control",
  "Dribble: Speed Burst",
  "Turns: Cruyff & Cut",
  "Turns: Drag-Back",
  "Moves: Scissors & Feint",
  "Moves: Stepover & Chop",
  "Moves: 1v1 Elastico",
  "Juggling: Foot-to-Foot",
  "Juggling: Aerial Touch",
  "Weak-Foot Mastery",
];

export const MATCH_AXES = [
  "SCA",
  "Dribbling",
  "Key Passes",
  "Goals/Shot",
  "Prog Passes",
  "xA",
  "NP xG",
  "Tkl + Int",
  "Aerials Won",
  "Blocks",
  "Fouls Drawn",
  "Through Balls",
  "Prog Passes Received",
];

export const TEMPLATES = [
  { id: "coaching", label: "Coaching competencies", axes: COACHING_AXES },
  { id: "ball-mastery", label: "1-Person Ball Mastery & 1v1", axes: BALL_MASTERY_AXES },
  { id: "match", label: "Match-action chart", axes: MATCH_AXES },
] as const;

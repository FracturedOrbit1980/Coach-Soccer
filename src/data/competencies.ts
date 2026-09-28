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
  { id: "match", label: "Match-action chart", axes: MATCH_AXES },
] as const;

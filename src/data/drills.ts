import type { Format, Frame, Phase, PhaseType, PitchView, Point, Stroke, Team, Token, Zone } from "../types";
import { uid } from "../lib/id";

export interface DrillVariant {
  id: string;
  name: string;
  description: string;
  rules?: string;
  coachingPoints?: string[];
  frames: Frame[];
}

export interface DrillItem {
  id: string;
  format: Format; // "5" | "7" | "9" | "11"
  title: string;
  category: "Warm-up & Ball Mastery" | "Rondo & Possession" | "Functional & Positional" | "Game & Transition";
  type: PhaseType;
  durationMinutes: number;
  pitchDimensions: {
    lengthM: number;
    widthM: number;
    zone: Zone;
    view: PitchView;
  };
  organisation: string;
  coachingPoints: string[];
  guidedQuestions: string[];
  variants: DrillVariant[];
}

function p(x: number, y: number): Point {
  return { x, y };
}

function t(
  id: string,
  kind: Token["kind"],
  x: number,
  y: number,
  extra: Partial<Token> = {},
): Token {
  return { id, kind, x, y, ...extra };
}

function player(
  id: string,
  team: Team,
  number: number,
  role: string,
  x: number,
  y: number,
  name?: string,
): Token {
  return t(id, "player", x, y, { team, number, role, name });
}

function gk(id: string, team: Team, number: number, x: number, y: number, name?: string): Token {
  return t(id, "gk", x, y, { team, number, role: "GK", name });
}

function goal(id: string, x: number, y: number, rotation = 0): Token {
  return t(id, "goal", x, y, { rotation });
}

function pass(id: string, team: Team, from: Point, to: Point): Stroke {
  return { id, kind: "pass", team, points: [from, to] };
}

function run(id: string, team: Team, from: Point, to: Point): Stroke {
  return { id, kind: "run", team, points: [from, to] };
}

function dribble(id: string, team: Team, from: Point, to: Point): Stroke {
  return { id, kind: "dribble", team, points: [from, to] };
}

function press(id: string, team: Team, from: Point, to: Point): Stroke {
  return { id, kind: "press", team, points: [from, to] };
}

function frame(note: string, tokens: Token[], strokes: Stroke[] = [], id = uid()): Frame {
  return { id, note, tokens, strokes };
}

// ============================================================================
// 5-A-SIDE DRILLS ("farther side")
// ============================================================================

const DRILL_5_1V1_MASTERY: DrillItem = {
  id: "5s-1v1-dual-goals",
  format: "5",
  title: "1v1 Ball Mastery & Dual Mini-Goals",
  category: "Warm-up & Ball Mastery",
  type: "technical",
  durationMinutes: 15,
  pitchDimensions: { lengthM: 20, widthM: 15, zone: "middle-third", view: "half" },
  organisation:
    "20×15m corridor. Attacker receives from coach or server, attacks 2 angled mini-goals. Defender presses from the baseline. If defender steals, counter to opposite endline.",
  coachingPoints: [
    "Commit the defender with positive speed before executing a move to beat.",
    "Use a scissor or body feint to unbalance the defender, then accelerate.",
    "Protect the ball with low centre of gravity when shielding.",
  ],
  guidedQuestions: [
    "Which foot should you attack with to disguise your turn?",
    "When is the best moment to explode into the space behind the defender?",
  ],
  variants: [
    {
      id: "v1",
      name: "Standard Dual Mini-Goals",
      description: "Direct 1v1. Attacker attacks either angled goal.",
      frames: [
        frame("Attacker prepares on edge of box. Defender steps out.", [
          player("a1", "home", 9, "ATT", 42, 50, "Attacker"),
          player("d1", "away", 4, "DEF", 62, 50, "Defender"),
          t("b1", "ball", 40, 50),
          goal("g1", 68, 30, 45),
          goal("g2", 68, 70, 135),
          t("c1", "cone", 35, 26),
          t("c2", "cone", 35, 74),
          t("c3", "cone", 72, 26),
          t("c4", "cone", 72, 74),
        ], [
          dribble("s1", "home", p(40, 50), p(50, 50)),
          run("s2", "away", p(62, 50), p(56, 50)),
        ]),
        frame("Attacker feints right and chops left toward the open goal.", [
          player("a1", "home", 9, "ATT", 53, 40, "Attacker"),
          player("d1", "away", 4, "DEF", 55, 54, "Defender"),
          t("b1", "ball", 56, 36),
          goal("g1", 68, 30, 45),
          goal("g2", 68, 70, 135),
          t("c1", "cone", 35, 26),
          t("c2", "cone", 35, 74),
          t("c3", "cone", 72, 26),
          t("c4", "cone", 72, 74),
        ], [
          run("s3", "home", p(53, 40), p(64, 32)),
          pass("s4", "home", p(56, 36), p(68, 30)),
        ]),
      ],
    },
    {
      id: "v2",
      name: "Progression: Recovery Defender & Time Limit",
      description: "Attacker has 6 seconds to score. Trailing defender enters on first touch.",
      frames: [
        frame("Attacker takes positive first touch under recovery pressure.", [
          player("a1", "home", 9, "ATT", 38, 48, "Attacker"),
          player("d1", "away", 4, "CB", 58, 48, "Defender 1"),
          player("d2", "away", 2, "RB", 32, 64, "Chaser"),
          t("b1", "ball", 39, 48),
          goal("g1", 68, 28, 40),
          goal("g2", 68, 72, 140),
        ], [
          dribble("s1", "home", p(39, 48), p(50, 38)),
          run("s2", "away", p(32, 64), p(46, 50)),
        ]),
        frame("Cruyff turn inside to evade both defenders and strike.", [
          player("a1", "home", 9, "ATT", 52, 62, "Attacker"),
          player("d1", "away", 4, "CB", 54, 40, "Defender 1"),
          player("d2", "away", 2, "RB", 48, 52, "Chaser"),
          t("b1", "ball", 65, 70),
          goal("g1", 68, 28, 40),
          goal("g2", 68, 72, 140),
        ], [
          pass("s3", "home", p(52, 62), p(67, 71)),
        ]),
      ],
    },
  ],
};

const DRILL_5_3V1_RONDO_BREAK: DrillItem = {
  id: "5s-3v1-rondo-break",
  format: "5",
  title: "3v1 Rondo into 2v1 Fast Break",
  category: "Rondo & Possession",
  type: "ssg",
  durationMinutes: 18,
  pitchDimensions: { lengthM: 28, widthM: 22, zone: "defensive-third", view: "half" },
  organisation:
    "14×14m rondo zone connected to two mini-goals. 3 players keep possession against 1 defender. After 4 passes, 2 attackers break out 2v1 against a second waiting defender.",
  coachingPoints: [
    "Angles of support must create 2 clear passing options at all times.",
    "First touch forward when breaking out of the rondo.",
    "Commit the defender before slipping the final pass across goal.",
  ],
  guidedQuestions: [
    "How does your body shape tell your teammate where to play the ball?",
    "When should you shoot versus slide the pass to your partner?",
  ],
  variants: [
    {
      id: "v1",
      name: "Standard 3v1 to 2v1 Breakout",
      description: "4 passes in rondo unlocks the 2v1 break toward target mini-goals.",
      frames: [
        frame("3v1 rondo in action. Quick one-two to draw the defender.", [
          player("h1", "home", 6, "P1", 20, 38, "Callum"),
          player("h2", "home", 8, "P2", 20, 62, "Fraser"),
          player("h3", "home", 10, "P3", 34, 50, "Euan"),
          player("a1", "away", 9, "DEF", 26, 48, "Presser"),
          player("a2", "away", 4, "CB", 54, 50, "Waiting DEF"),
          t("b1", "ball", 22, 38),
          goal("g1", 65, 34, 30),
          goal("g2", 65, 66, 150),
        ], [
          pass("p1", "home", p(22, 38), p(20, 62)),
          run("r1", "away", p(26, 48), p(22, 56)),
        ]),
        frame("Breakout triggered: 2 attackers surge forward against lone defender.", [
          player("h1", "home", 6, "P1", 28, 40, "Callum"),
          player("h2", "home", 8, "P2", 42, 60, "Fraser"),
          player("h3", "home", 10, "P3", 46, 36, "Euan"),
          player("a1", "away", 9, "DEF", 28, 56, "Presser"),
          player("a2", "away", 4, "CB", 52, 48, "Waiting DEF"),
          t("b1", "ball", 43, 58),
          goal("g1", 65, 34, 30),
          goal("g2", 65, 66, 150),
        ], [
          pass("p2", "home", p(43, 58), p(48, 38)),
          run("r2", "home", p(46, 36), p(58, 34)),
        ]),
        frame("Overload finish into the left mini-goal.", [
          player("h1", "home", 6, "P1", 30, 42, "Callum"),
          player("h2", "home", 8, "P2", 48, 58, "Fraser"),
          player("h3", "home", 10, "P3", 59, 36, "Euan"),
          player("a1", "away", 9, "DEF", 32, 54, "Presser"),
          player("a2", "away", 4, "CB", 53, 44, "Waiting DEF"),
          t("b1", "ball", 64, 34),
          goal("g1", 65, 34, 30),
          goal("g2", 65, 66, 150),
        ], [
          pass("p3", "home", p(59, 36), p(65, 34)),
        ]),
      ],
    },
    {
      id: "v2",
      name: "Progression: Chaser Recovery on Breakout",
      description: "Presser in rondo chases to create a 2v2 back-pressure recovery.",
      frames: [
        frame("Fast break with trailing recovery pressure.", [
          player("h2", "home", 8, "P2", 44, 58, "Fraser"),
          player("h3", "home", 10, "P3", 45, 38, "Euan"),
          player("a1", "away", 9, "DEF", 36, 52, "Chaser"),
          player("a2", "away", 4, "CB", 54, 48, "CB"),
          t("b1", "ball", 45, 56),
          goal("g1", 65, 34, 30),
          goal("g2", 65, 66, 150),
        ], [
          dribble("d1", "home", p(45, 56), p(52, 62)),
          run("r1", "away", p(36, 52), p(48, 54)),
        ]),
      ],
    },
  ],
};

const DRILL_5_SSG_4GOALS: DrillItem = {
  id: "5s-ssg-4goals",
  format: "5",
  title: "3v3 SSG with 4 Corner Mini-Goals",
  category: "Game & Transition",
  type: "ssg",
  durationMinutes: 20,
  pitchDimensions: { lengthM: 32, widthM: 24, zone: "middle-third", view: "half" },
  organisation:
    "32×24m pitch. 4 mini-goals placed at 45° angles on each corner. Teams score in either of the two opponent mini-goals, promoting diagonal switches and spatial awareness.",
  coachingPoints: [
    "If one goal is blocked, switch the point of attack with a fast diagonal ball.",
    "Form a triangle in possession: one ball-carrier, one deep, one high.",
    "Immediate counter-press when ball is lost: press the first receiver in 3 seconds.",
  ],
  guidedQuestions: [
    "When their defense shifts to the right goal, where is your quickest escape pass?",
  ],
  variants: [
    {
      id: "v1",
      name: "Standard 4 Mini-Goals (Diagonal Switch)",
      description: "Any goal counts. Quick switches are rewarded.",
      frames: [
        frame("Home team builds through centre. Away compacts near side.", [
          player("h1", "home", 4, "CB", 28, 50, "Lewis"),
          player("h2", "home", 7, "RW", 40, 72, "Jamie"),
          player("h3", "home", 11, "LW", 42, 28, "Kyle"),
          player("a1", "away", 9, "ST", 36, 50, "Striker"),
          player("a2", "away", 3, "LB", 46, 68, "Left Back"),
          player("a3", "away", 2, "RB", 44, 36, "Right Back"),
          t("b1", "ball", 30, 50),
          goal("g1", 18, 22, 225),
          goal("g2", 18, 78, 315),
          goal("g3", 64, 22, 45),
          goal("g4", 64, 78, 135),
        ], [
          pass("p1", "home", p(30, 50), p(40, 70)),
          run("r1", "away", p(36, 50), p(38, 62)),
        ]),
        frame("Overload on right side forces switch back across to isolated left winger.", [
          player("h1", "home", 4, "CB", 34, 46, "Lewis"),
          player("h2", "home", 7, "RW", 44, 74, "Jamie"),
          player("h3", "home", 11, "LW", 48, 26, "Kyle"),
          player("a1", "away", 9, "ST", 40, 64, "Striker"),
          player("a2", "away", 3, "LB", 48, 72, "Left Back"),
          player("a3", "away", 2, "RB", 42, 44, "Right Back"),
          t("b1", "ball", 35, 46),
          goal("g1", 18, 22, 225),
          goal("g2", 18, 78, 315),
          goal("g3", 64, 22, 45),
          goal("g4", 64, 78, 135),
        ], [
          pass("p2", "home", p(35, 46), p(48, 26)),
          run("r2", "home", p(48, 26), p(60, 24)),
        ]),
        frame("Kyle receives unmarked and slots into the top corner mini-goal.", [
          player("h1", "home", 4, "CB", 38, 44, "Lewis"),
          player("h2", "home", 7, "RW", 46, 66, "Jamie"),
          player("h3", "home", 11, "LW", 60, 24, "Kyle"),
          player("a1", "away", 9, "ST", 44, 52, "Striker"),
          player("a2", "away", 3, "LB", 48, 62, "Left Back"),
          player("a3", "away", 2, "RB", 48, 34, "Right Back"),
          t("b1", "ball", 63, 22),
          goal("g1", 18, 22, 225),
          goal("g2", 18, 78, 315),
          goal("g3", 64, 22, 45),
          goal("g4", 64, 78, 135),
        ], [
          pass("p3", "home", p(60, 24), p(64, 22)),
        ]),
      ],
    },
  ],
};

// ============================================================================
// 7-A-SIDE DRILLS ("sevener side")
// ============================================================================

const DRILL_7_BUILD_UP: DrillItem = {
  id: "7s-buildup-pivot",
  format: "7",
  title: "2-3-1 Build-Up vs High Press",
  category: "Functional & Positional",
  type: "functional",
  durationMinutes: 20,
  pitchDimensions: { lengthM: 52, widthM: 40, zone: "defensive-third", view: "half" },
  organisation:
    "Keeper + 2 CBs + central midfielder (#6) + 2 wingbacks play out from goal kicks against a front 3 pressing unit. Target: play into target forward or score in 2 mini-goals at halfway line.",
  coachingPoints: [
    "Centre backs split wide to the edges of the box on goal kicks.",
    "Pivot checks on a diagonal angle to create a passing lane between pressing strikers.",
    "Play the way you face under pressure, or turn if the back foot is free.",
  ],
  guidedQuestions: [
    "If their striker locks on your right foot, which teammate is now your outlet?",
    "When the pivot drops, what space opens up for the wingbacks?",
  ],
  variants: [
    {
      id: "v1",
      name: "Standard Build-Up via Dropping Pivot",
      description: "Keeper initiates to split CBs; pivot bounces to advancing wingback.",
      frames: [
        frame("Goal kick setup: CBs split wide, pivot checks to top of D.", [
          gk("gk1", "home", 1, 12, 50, "Callum"),
          player("cb1", "home", 4, "RCB", 22, 70, "Lewis"),
          player("cb2", "home", 5, "LCB", 22, 30, "Hamish"),
          player("dm1", "home", 6, "DM", 30, 50, "Rory"),
          player("wb1", "home", 2, "RB", 36, 80, "Fraser"),
          player("wb2", "home", 3, "LB", 36, 20, "Euan"),
          player("st1", "away", 9, "ST", 28, 42, "Opp 9"),
          player("rw1", "away", 7, "RW", 32, 28, "Opp 7"),
          player("lw1", "away", 11, "LW", 32, 72, "Opp 11"),
          t("b1", "ball", 13, 50),
          goal("mg1", 62, 25, 90),
          goal("mg2", 62, 75, 90),
        ], [
          pass("p1", "home", p(13, 50), p(22, 70)),
          run("r1", "away", p(32, 72), p(26, 70)),
        ]),
        frame("RCB plays inside to pivot who turns and releases wingback.", [
          gk("gk1", "home", 1, 14, 50, "Callum"),
          player("cb1", "home", 4, "RCB", 24, 70, "Lewis"),
          player("cb2", "home", 5, "LCB", 24, 30, "Hamish"),
          player("dm1", "home", 6, "DM", 32, 54, "Rory"),
          player("wb1", "home", 2, "RB", 46, 82, "Fraser"),
          player("wb2", "home", 3, "LB", 38, 20, "Euan"),
          player("st1", "away", 9, "ST", 28, 48, "Opp 9"),
          player("rw1", "away", 7, "RW", 30, 32, "Opp 7"),
          player("lw1", "away", 11, "LW", 28, 70, "Opp 11"),
          t("b1", "ball", 32, 54),
          goal("mg1", 62, 25, 90),
          goal("mg2", 62, 75, 90),
        ], [
          pass("p2", "home", p(32, 54), p(46, 80)),
          run("r2", "home", p(46, 82), p(58, 80)),
        ]),
        frame("Wingback breaks the press and scores in wide mini-goal.", [
          gk("gk1", "home", 1, 16, 50, "Callum"),
          player("cb1", "home", 4, "RCB", 28, 66, "Lewis"),
          player("cb2", "home", 5, "LCB", 26, 32, "Hamish"),
          player("dm1", "home", 6, "DM", 38, 54, "Rory"),
          player("wb1", "home", 2, "RB", 58, 78, "Fraser"),
          player("wb2", "home", 3, "LB", 40, 22, "Euan"),
          player("st1", "away", 9, "ST", 30, 50, "Opp 9"),
          player("rw1", "away", 7, "RW", 32, 34, "Opp 7"),
          player("lw1", "away", 11, "LW", 36, 72, "Opp 11"),
          t("b1", "ball", 61, 76),
          goal("mg1", 62, 25, 90),
          goal("mg2", 62, 75, 90),
        ], [
          pass("p3", "home", p(58, 78), p(62, 75)),
        ]),
      ],
    },
    {
      id: "v2",
      name: "Progression: Aggressive High Press with Man-to-Man",
      description: "Opponents lock man-to-man; GK uses chipped ball to opposite full-back.",
      frames: [
        frame("Man-to-man press forces keeper to clip into space for weak-side wingback.", [
          gk("gk1", "home", 1, 12, 50, "Callum"),
          player("cb1", "home", 4, "RCB", 20, 72, "Lewis"),
          player("cb2", "home", 5, "LCB", 20, 28, "Hamish"),
          player("dm1", "home", 6, "DM", 28, 50, "Rory"),
          player("wb1", "home", 2, "RB", 36, 84, "Fraser"),
          player("wb2", "home", 3, "LB", 38, 16, "Euan"),
          player("st1", "away", 9, "ST", 22, 48, "Opp 9"),
          player("rw1", "away", 7, "RW", 22, 28, "Opp 7"),
          player("lw1", "away", 11, "LW", 22, 72, "Opp 11"),
          t("b1", "ball", 13, 50),
          goal("mg1", 62, 25, 90),
          goal("mg2", 62, 75, 90),
        ], [
          pass("p1", "home", p(13, 50), p(38, 16)),
          run("r1", "home", p(38, 16), p(50, 18)),
        ]),
      ],
    },
  ],
};

const DRILL_7_4V2_PRESS_BOX: DrillItem = {
  id: "7s-4v2-press-counter",
  format: "7",
  title: "4v2 Pressing Box into 3v2 Counter",
  category: "Rondo & Possession",
  type: "ssg",
  durationMinutes: 18,
  pitchDimensions: { lengthM: 36, widthM: 28, zone: "middle-third", view: "half" },
  organisation:
    "18×18m grid. 4 home players maintain possession against 2 away defenders. When defenders win it, they quickly transition out to 2 wide target mini-goals or combine with a waiting forward.",
  coachingPoints: [
    "First defender presses ball speed; second defender covers passing lane.",
    "In transition, first pass forward must be immediate into open space.",
    "Attackers react with instant 3-second counter-press.",
  ],
  guidedQuestions: [
    "What cue tells the second defender to jump vs protect the space behind?",
  ],
  variants: [
    {
      id: "v1",
      name: "Standard 4v2 Transition to Counter Goals",
      description: "Steal and 2-touch finish to mini goals.",
      frames: [
        frame("4v2 keep-away in the grid.", [
          player("h1", "home", 4, "CB", 30, 36, "Lewis"),
          player("h2", "home", 6, "DM", 30, 64, "Rory"),
          player("h3", "home", 8, "CM", 46, 36, "Owen"),
          player("h4", "home", 10, "AM", 46, 64, "Finn"),
          player("a1", "away", 9, "Presser 1", 38, 44, "Press 1"),
          player("a2", "away", 10, "Presser 2", 38, 56, "Press 2"),
          t("b1", "ball", 32, 38),
          goal("g1", 64, 30, 90),
          goal("g2", 64, 70, 90),
        ], [
          pass("p1", "home", p(32, 38), p(46, 36)),
          press("pr1", "away", p(38, 44), p(44, 40)),
        ]),
        frame("Defender intercepts loose pass and transitions rapidly.", [
          player("h1", "home", 4, "CB", 32, 38, "Lewis"),
          player("h2", "home", 6, "DM", 32, 60, "Rory"),
          player("h3", "home", 8, "CM", 46, 38, "Owen"),
          player("h4", "home", 10, "AM", 46, 62, "Finn"),
          player("a1", "away", 9, "Presser 1", 44, 40, "Press 1"),
          player("a2", "away", 10, "Presser 2", 48, 56, "Press 2"),
          t("b1", "ball", 45, 41),
          goal("g1", 64, 30, 90),
          goal("g2", 64, 70, 90),
        ], [
          pass("p2", "away", p(45, 41), p(58, 68)),
          run("r2", "away", p(48, 56), p(58, 68)),
        ]),
      ],
    },
  ],
};

// ============================================================================
// 9-A-SIDE DRILLS ("niner side")
// ============================================================================

const DRILL_9_PLAY_THROUGH_MID: DrillItem = {
  id: "9s-midfield-break",
  format: "9",
  title: "6v4 Phase of Play: Playing Through Midfield",
  category: "Functional & Positional",
  type: "functional",
  durationMinutes: 22,
  pitchDimensions: { lengthM: 65, widthM: 50, zone: "middle-third", view: "half" },
  organisation:
    "6 attackers (#4, #5, #6, #8, #10, #9) combine through the central channel against 4 defending midfielders. Aim: break lines and penetrate into the attacking penalty area to score on big goal.",
  coachingPoints: [
    "Staggered midfield depths: #6 holding, #8 between lines, #10 on the half-turn in the pocket.",
    "Third-man combinations: pass into striker's feet, bounce to arriving #8, slip through to winger.",
    "Pass with pace and purpose through the defending lines.",
  ],
  guidedQuestions: [
    "When the striker pins the centre-back, where does the #8 make their run?",
    "If the midfield line is compact, how do we stretch them horizontally?",
  ],
  variants: [
    {
      id: "v1",
      name: "Third-Man Run & Bounce Combination",
      description: "Up-back-and-through combination to breach the midfield screen.",
      frames: [
        frame("CB initiates into #6. Attacking midfield creates depth.", [
          player("cb1", "home", 4, "CB", 26, 42, "Lewis"),
          player("cb2", "home", 5, "CB", 26, 58, "Hamish"),
          player("dm1", "home", 6, "DM", 36, 50, "Rory"),
          player("cm1", "home", 8, "CM", 48, 38, "Owen"),
          player("am1", "home", 10, "AM", 52, 62, "Finn"),
          player("st1", "home", 9, "ST", 66, 50, "Archie"),
          player("m1", "away", 4, "DM", 44, 46, "Opp DM"),
          player("m2", "away", 8, "CM", 44, 56, "Opp CM"),
          player("m3", "away", 7, "RM", 48, 70, "Opp RM"),
          player("m4", "away", 11, "LM", 48, 30, "Opp LM"),
          gk("gk1", "away", 1, 86, 50, "Opp GK"),
          t("b1", "ball", 28, 42),
          goal("g1", 90, 50, 0),
        ], [
          pass("p1", "home", p(28, 42), p(36, 50)),
          run("r1", "home", p(48, 38), p(58, 42)),
        ]),
        frame("#6 punches straight into striker's feet; striker sets back for advancing #8.", [
          player("cb1", "home", 4, "CB", 30, 44, "Lewis"),
          player("cb2", "home", 5, "CB", 30, 56, "Hamish"),
          player("dm1", "home", 6, "DM", 38, 50, "Rory"),
          player("cm1", "home", 8, "CM", 58, 44, "Owen"),
          player("am1", "home", 10, "AM", 58, 64, "Finn"),
          player("st1", "home", 9, "ST", 66, 50, "Archie"),
          player("m1", "away", 4, "DM", 46, 48, "Opp DM"),
          player("m2", "away", 8, "CM", 48, 54, "Opp CM"),
          player("m3", "away", 7, "RM", 50, 68, "Opp RM"),
          player("m4", "away", 11, "LM", 50, 32, "Opp LM"),
          gk("gk1", "away", 1, 86, 50, "Opp GK"),
          t("b1", "ball", 65, 50),
          goal("g1", 90, 50, 0),
        ], [
          pass("p2", "home", p(65, 50), p(58, 44)),
          run("r2", "home", p(66, 50), p(76, 52)),
        ]),
        frame("#8 slides through ball behind for striker to finish 1v1 on goalkeeper.", [
          player("cb1", "home", 4, "CB", 34, 46, "Lewis"),
          player("cb2", "home", 5, "CB", 34, 54, "Hamish"),
          player("dm1", "home", 6, "DM", 42, 50, "Rory"),
          player("cm1", "home", 8, "CM", 60, 46, "Owen"),
          player("am1", "home", 10, "AM", 62, 62, "Finn"),
          player("st1", "home", 9, "ST", 78, 52, "Archie"),
          player("m1", "away", 4, "DM", 50, 48, "Opp DM"),
          player("m2", "away", 8, "CM", 52, 54, "Opp CM"),
          player("m3", "away", 7, "RM", 54, 66, "Opp RM"),
          player("m4", "away", 11, "LM", 54, 34, "Opp LM"),
          gk("gk1", "away", 1, 84, 51, "Opp GK"),
          t("b1", "ball", 82, 52),
          goal("g1", 90, 50, 0),
        ], [
          pass("p3", "home", p(78, 52), p(88, 50)),
        ]),
      ],
    },
    {
      id: "v2",
      name: "Progression: Overload Wide & Cutback into Box",
      description: "Midfield switches to overlapping full-back for a low cross to near post.",
      frames: [
        frame("Diagonal switch out to wide channel.", [
          player("dm1", "home", 6, "DM", 40, 50, "Rory"),
          player("rw1", "home", 7, "RW", 60, 80, "Jamie"),
          player("st1", "home", 9, "ST", 68, 52, "Archie"),
          player("am1", "home", 10, "AM", 64, 40, "Finn"),
          t("b1", "ball", 42, 52),
          goal("g1", 90, 50, 0),
        ], [
          pass("p1", "home", p(42, 52), p(62, 80)),
          run("r1", "home", p(68, 52), p(78, 54)),
        ]),
      ],
    },
  ],
};

const DRILL_9_MID_BLOCK_PRESS: DrillItem = {
  id: "9s-midblock-trap",
  format: "9",
  title: "Mid-Block Press Trap into Fast Break",
  category: "Game & Transition",
  type: "functional",
  durationMinutes: 20,
  pitchDimensions: { lengthM: 68, widthM: 52, zone: "middle-third", view: "half" },
  organisation:
    "Team shapes in a compact mid-block. Striker curves run to force opponent CB to pass wide. Touchline press trap is sprung with 3 players locking the ball.",
  coachingPoints: [
    "Striker's curved run angles outward to cut off switch to opposite CB.",
    "Wingback jumps when ball travels to opponent fullback.",
    "Central midfielders slide and lock inside passing lanes.",
  ],
  guidedQuestions: [
    "What is the trigger that tells the unit the ball is locked on the sideline?",
  ],
  variants: [
    {
      id: "v1",
      name: "Touchline Pressing Trap",
      description: "Curve run forces play to right back; trap executed and fast counter.",
      frames: [
        frame("Mid-block organised. Opponent CB has possession.", [
          player("st1", "home", 9, "ST", 45, 46, "Archie"),
          player("rw1", "home", 7, "RW", 48, 70, "Jamie"),
          player("lw1", "home", 11, "LW", 48, 30, "Kyle"),
          player("cm1", "home", 8, "CM", 40, 44, "Owen"),
          player("cm2", "home", 6, "DM", 40, 56, "Rory"),
          player("ocb1", "away", 4, "CB", 30, 45, "Opp CB"),
          player("ofb1", "away", 2, "RB", 36, 75, "Opp RB"),
          t("b1", "ball", 32, 45),
          goal("g1", 85, 50, 0),
        ], [
          run("r1", "home", p(45, 46), p(38, 48)),
          pass("p1", "away", p(32, 45), p(36, 73)),
        ]),
        frame("Ball travels wide: winger and CM jump simultaneously to trap on sideline.", [
          player("st1", "home", 9, "ST", 40, 50, "Archie"),
          player("rw1", "home", 7, "RW", 38, 74, "Jamie"),
          player("lw1", "home", 11, "LW", 44, 38, "Kyle"),
          player("cm1", "home", 8, "CM", 42, 54, "Owen"),
          player("cm2", "home", 6, "DM", 39, 66, "Rory"),
          player("ocb1", "away", 4, "CB", 32, 45, "Opp CB"),
          player("ofb1", "away", 2, "RB", 38, 75, "Opp RB"),
          t("b1", "ball", 38, 74),
          goal("g1", 85, 50, 0),
        ], [
          press("pr1", "home", p(38, 74), p(38, 75)),
          run("r2", "home", p(40, 50), p(60, 52)),
        ]),
      ],
    },
  ],
};

// ============================================================================
// 11-A-SIDE DRILLS ("elevener side")
// ============================================================================

const DRILL_11_BUILDUP_VS_HIGHPRESS: DrillItem = {
  id: "11s-433-buildup",
  format: "11",
  title: "4-3-3 Build-Up vs 4-4-2 High Press Trapping",
  category: "Functional & Positional",
  type: "game",
  durationMinutes: 25,
  pitchDimensions: { lengthM: 105, widthM: 68, zone: "full", view: "full" },
  organisation:
    "11v11 match scenario. Back 4 + pivot + GK build from own penalty box against opponent high pressing front two and midfield line. Objective: break second line and transition to attack.",
  coachingPoints: [
    "Goalkeeper acts as +1 outfield player, drawing pressing forward before releasing.",
    "Opposite #8 and #10 provide diagonal depth behind the pressing midfield line.",
    "When opponent shifts heavily to ball-side, execute quick switch to weak-side winger.",
  ],
  guidedQuestions: [
    "How does the goalkeeper's positioning dictate which opponent presser is committed?",
    "Where is the free player if both opponent strikers mark our centre-backs?",
  ],
  variants: [
    {
      id: "v1",
      name: "Pivot Drops into Back-3 Build-Up",
      description: "6 drops between CBs to form 3v2 overload against front press.",
      frames: [
        frame("Keeper initiates build-up. #6 drops between centre backs.", [
          gk("gk", "home", 1, 8, 50, "Callum"),
          player("lcb", "home", 5, "LCB", 18, 32, "Hamish"),
          player("rcb", "home", 4, "RCB", 18, 68, "Lewis"),
          player("lb", "home", 3, "LB", 28, 14, "Euan"),
          player("rb", "home", 2, "RB", 28, 86, "Fraser"),
          player("dm", "home", 6, "DM", 14, 50, "Rory"),
          player("cm1", "home", 8, "LCM", 36, 36, "Owen"),
          player("cm2", "home", 10, "RCM", 36, 64, "Finn"),
          player("lw", "home", 11, "LW", 52, 16, "Kyle"),
          player("rw", "home", 7, "RW", 52, 84, "Jamie"),
          player("st", "home", 9, "ST", 62, 50, "Archie"),
          player("ast1", "away", 9, "ST", 24, 42, "Opp 9"),
          player("ast2", "away", 10, "ST", 24, 58, "Opp 10"),
          player("am1", "away", 7, "RM", 38, 76, "Opp RM"),
          player("am2", "away", 8, "CM", 38, 58, "Opp CM"),
          player("am3", "away", 4, "CM", 38, 42, "Opp CM2"),
          player("am4", "away", 11, "LM", 38, 24, "Opp LM"),
          t("b1", "ball", 9, 50),
          goal("g1", 104, 50, 0),
        ], [
          pass("p1", "home", p(9, 50), p(18, 68)),
          run("r1", "away", p(24, 58), p(20, 66)),
        ]),
        frame("RCB plays back through GK to switch across to LCB with time and space.", [
          gk("gk", "home", 1, 10, 50, "Callum"),
          player("lcb", "home", 5, "LCB", 22, 30, "Hamish"),
          player("rcb", "home", 4, "RCB", 20, 68, "Lewis"),
          player("lb", "home", 3, "LB", 34, 14, "Euan"),
          player("rb", "home", 2, "RB", 32, 86, "Fraser"),
          player("dm", "home", 6, "DM", 18, 50, "Rory"),
          player("cm1", "home", 8, "LCM", 40, 34, "Owen"),
          player("cm2", "home", 10, "RCM", 38, 64, "Finn"),
          player("lw", "home", 11, "LW", 56, 16, "Kyle"),
          player("rw", "home", 7, "RW", 52, 84, "Jamie"),
          player("st", "home", 9, "ST", 62, 50, "Archie"),
          player("ast1", "away", 9, "ST", 26, 40, "Opp 9"),
          player("ast2", "away", 10, "ST", 22, 64, "Opp 10"),
          t("b1", "ball", 22, 30),
          goal("g1", 104, 50, 0),
        ], [
          pass("p2", "home", p(22, 30), p(34, 14)),
          run("r2", "home", p(56, 16), p(68, 20)),
        ]),
        frame("LB drives into midfield and slips through pass to release the winger.", [
          gk("gk", "home", 1, 12, 50, "Callum"),
          player("lcb", "home", 5, "LCB", 26, 32, "Hamish"),
          player("rcb", "home", 4, "RCB", 24, 66, "Lewis"),
          player("lb", "home", 3, "LB", 46, 18, "Euan"),
          player("rb", "home", 2, "RB", 34, 84, "Fraser"),
          player("dm", "home", 6, "DM", 26, 50, "Rory"),
          player("cm1", "home", 8, "LCM", 48, 32, "Owen"),
          player("cm2", "home", 10, "RCM", 42, 62, "Finn"),
          player("lw", "home", 11, "LW", 70, 20, "Kyle"),
          player("rw", "home", 7, "RW", 54, 82, "Jamie"),
          player("st", "home", 9, "ST", 68, 48, "Archie"),
          t("b1", "ball", 70, 20),
          goal("g1", 104, 50, 0),
        ], [
          dribble("d1", "home", p(70, 20), p(84, 28)),
          run("r3", "home", p(68, 48), p(82, 46)),
        ]),
      ],
    },
    {
      id: "v2",
      name: "Inverted Full-Back Progression",
      description: "RB steps inside next to #6 to overload midfield central pivot.",
      frames: [
        frame("Inverted fullback steps into central midfield line.", [
          gk("gk", "home", 1, 8, 50, "Callum"),
          player("lcb", "home", 5, "LCB", 18, 30, "Hamish"),
          player("rcb", "home", 4, "RCB", 18, 68, "Lewis"),
          player("rb", "home", 2, "RB", 28, 58, "Fraser (Inv)"),
          player("dm", "home", 6, "DM", 28, 44, "Rory"),
          t("b1", "ball", 18, 68),
          goal("g1", 104, 50, 0),
        ], [
          pass("p1", "home", p(18, 68), p(28, 58)),
        ]),
      ],
    },
  ],
};

const DRILL_11_GEGENPRESS_TRANSITION: DrillItem = {
  id: "11s-gegenpress-rondo",
  format: "11",
  title: "Gegenpressing & Counter-Attack Transition",
  category: "Rondo & Possession",
  type: "ssg",
  durationMinutes: 20,
  pitchDimensions: { lengthM: 55, widthM: 45, zone: "middle-third", view: "half" },
  organisation:
    "7v7 in 50×40m area with 3 counter target mini-goals and 1 full-size goal. Rule: on turnover, losing team has 5 seconds to counter-press and win the ball back before opponent can shoot.",
  coachingPoints: [
    "Immediate reaction to ball loss: first player suffocates the carrier, next two cut the exits.",
    "Hunting in packs: do not stand and watch, sprint towards the ball within 1 second of loss.",
    "Once won back, immediately secure with a pass away from pressure.",
  ],
  guidedQuestions: [
    "What body cue tells you your teammate has locked the carrier so you can step up?",
  ],
  variants: [
    {
      id: "v1",
      name: "5-Second Counter-Press Rule",
      description: "Fast counter-press immediately upon possession turnover.",
      frames: [
        frame("Home loses possession. Immediate sprint to counter-press.", [
          player("h1", "home", 8, "CM", 42, 44, "Owen"),
          player("h2", "home", 10, "AM", 44, 56, "Finn"),
          player("h3", "home", 9, "ST", 48, 48, "Archie"),
          player("a1", "away", 6, "DM", 46, 50, "Opp Winner"),
          player("a2", "away", 8, "CM", 36, 36, "Opp Outlet"),
          t("b1", "ball", 46, 50),
          goal("g1", 72, 30, 45),
          goal("g2", 72, 70, 135),
        ], [
          press("pr1", "home", p(42, 44), p(45, 48)),
          press("pr2", "home", p(44, 56), p(45, 52)),
        ]),
        frame("Ball won back inside 3 seconds; immediate strike at goal.", [
          player("h1", "home", 8, "CM", 45, 47, "Owen"),
          player("h2", "home", 10, "AM", 45, 53, "Finn"),
          player("h3", "home", 9, "ST", 56, 48, "Archie"),
          player("a1", "away", 6, "DM", 44, 50, "Opp Dispossessed"),
          t("b1", "ball", 56, 48),
          goal("g1", 72, 30, 45),
          goal("g2", 72, 70, 135),
        ], [
          pass("p1", "home", p(56, 48), p(72, 30)),
        ]),
      ],
    },
  ],
};

// ============================================================================
// DRILLS MASTER CATALOG
// ============================================================================

export const DRILL_LIBRARY: DrillItem[] = [
  DRILL_5_1V1_MASTERY,
  DRILL_5_3V1_RONDO_BREAK,
  DRILL_5_SSG_4GOALS,
  DRILL_7_BUILD_UP,
  DRILL_7_4V2_PRESS_BOX,
  DRILL_9_PLAY_THROUGH_MID,
  DRILL_9_MID_BLOCK_PRESS,
  DRILL_11_BUILDUP_VS_HIGHPRESS,
  DRILL_11_GEGENPRESS_TRANSITION,
];

export function getDrillsForFormat(format: Format): DrillItem[] {
  return DRILL_LIBRARY.filter((d) => d.format === format);
}

export function findDrillById(drillId: string): DrillItem | undefined {
  return DRILL_LIBRARY.find((d) => d.id === drillId);
}

export function drillToPhase(drill: DrillItem, variantIndex = 0): Phase {
  const variant = drill.variants[variantIndex] ?? drill.variants[0];
  const frames = variant.frames.map((f) => ({
    id: uid(),
    note: f.note,
    tokens: f.tokens.map((tok) => ({ ...tok, id: uid() })),
    strokes: f.strokes.map((stk) => ({
      ...stk,
      id: uid(),
      points: stk.points.map((pt) => ({ ...pt })),
    })),
  }));

  return {
    id: uid(),
    type: drill.type,
    title: `${drill.title} (${variant.name})`,
    minutes: drill.durationMinutes,
    lengthM: drill.pitchDimensions.lengthM,
    widthM: drill.pitchDimensions.widthM,
    zone: drill.pitchDimensions.zone,
    organisation: `${drill.organisation} Variant: ${variant.description}`,
    coachingPoints: [...drill.coachingPoints, ...(variant.coachingPoints ?? [])],
    interventions: ["Freeze", "Demo", "Guided discovery"],
    questions: [...drill.guidedQuestions],
    frames: frames.length > 0 ? frames : [{ id: uid(), note: "Start picture", tokens: [], strokes: [] }],
  };
}

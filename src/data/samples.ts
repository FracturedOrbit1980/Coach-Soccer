import { tokensForFormation } from "../lib/geometry";
import { uid } from "../lib/id";
import { now } from "../lib/session";
import type { Frame, Phase, Point, Session, Stroke, Team, Tier, Token } from "../types";

function token(
  id: string,
  kind: Token["kind"],
  x: number,
  y: number,
  extra: Partial<Token> = {},
): Token {
  return { id, kind, x, y, ...extra };
}

function player(id: string, team: Team, number: number, role: string, x: number, y: number): Token {
  return token(id, "player", x, y, { team, number, role });
}

function at(base: Token[], moves: Record<string, [number, number]>, strokes: Stroke[], note: string, id: string): Frame {
  return {
    id,
    note,
    strokes,
    tokens: base.map((item) => {
      const next = moves[item.id];
      return next ? { ...item, x: next[0], y: next[1] } : { ...item };
    }),
  };
}

function pass(id: string, team: Team, from: Point, to: Point): Stroke {
  return { id, kind: "pass", team, points: [from, to] };
}

function run(id: string, team: Team, from: Point, to: Point): Stroke {
  return { id, kind: "run", team, points: [from, to] };
}

function phase(input: Omit<Phase, "id"> & { id?: string }): Phase {
  return { id: input.id ?? uid(), ...input };
}

function findRole(tokens: Token[], team: Team, role: string): Point {
  const item = tokens.find((tokenItem) => tokenItem.team === team && tokenItem.role === role);
  return item ? { x: item.x, y: item.y } : { x: 50, y: 50 };
}

function moveRoles(tokens: Token[], moves: Record<string, [number, number]>): Token[] {
  return tokens.map((item) => {
    if (!item.team || !item.role) return { ...item };
    const next = moves[`${item.team}:${item.role}`];
    return next ? { ...item, x: next[0], y: next[1] } : { ...item };
  });
}

function sampleC(): Session {
  const picture: Token[] = [
    token("c-gk", "gk", 10, 50, { team: "home", number: 1, role: "GK" }),
    player("c-rb", "home", 2, "RB", 26, 68),
    player("c-lb", "home", 3, "LB", 26, 32),
    player("c-6", "home", 8, "6", 38, 50),
    player("c-9", "home", 9, "9", 50, 40),
    player("c-a9", "away", 9, "9", 32, 42),
    player("c-a10", "away", 10, "10", 32, 60),
    player("c-a7", "away", 7, "7", 46, 24),
    player("c-a11", "away", 11, "11", 46, 74),
    token("c-ball", "ball", 13, 50),
    token("c-cone-1", "cone", 8, 28),
    token("c-cone-2", "cone", 8, 72),
    token("c-cone-3", "cone", 54, 28),
    token("c-cone-4", "cone", 54, 72),
  ];

  const technical = phase({
    id: "c-technical",
    type: "technical",
    title: "Play through the first press",
    minutes: 20,
    lengthM: 40,
    widthM: 30,
    zone: "defensive-third",
    organisation:
      "4v4 in 40×30. Keeper starts every rep. Two mini goals are the cones on the far line. Opposition can only press inside the area.",
    coachingPoints: [
      "Open body on the first touch so the next pass is already on.",
      "If both pressers jump, the spare player is the pass.",
    ],
    interventions: ["Freeze", "Demo"],
    questions: [
      "Where is the free player?",
      "Can your first touch take you away from the press?",
    ],
    frames: [
      at(picture, {}, [], "Keeper has it. Both centre-mids are showing.", "c-f1"),
      at(
        picture,
        { "c-ball": [26, 32], "c-lb": [28, 34], "c-a9": [24, 34] },
        [pass("c-p1", "home", { x: 10, y: 50 }, { x: 26, y: 32 }), run("c-r1", "away", { x: 32, y: 42 }, { x: 24, y: 34 })],
        "Left back receives side-on. The nearest presser locks.",
        "c-f2",
      ),
      at(
        picture,
        {
          "c-ball": [40, 50],
          "c-lb": [28, 34],
          "c-6": [40, 50],
          "c-9": [58, 36],
          "c-a9": [30, 38],
          "c-a10": [38, 56],
        },
        [pass("c-p2", "home", { x: 28, y: 34 }, { x: 40, y: 50 }), run("c-r2", "home", { x: 50, y: 40 }, { x: 58, y: 36 })],
        "The 6 bounces around the corner and the 9 shows beyond.",
        "c-f3",
      ),
    ],
  });

  return {
    id: "sample-c",
    title: "Break the first line",
    tier: "C",
    ageGroup: "U12–U14",
    duration: 50,
    theme: "First touch away from pressure",
    moment: "in-possession",
    principle: "Create a free player before you play forward.",
    what: "Play out from the goalkeeper through a two-player press.",
    where: "Defensive third, inside a 40×30 area.",
    who: "Goalkeeper, full-backs, and the 6 against two pressers.",
    when: "The goalkeeper has the ball and the press steps in.",
    why: "So the team can progress without forcing a long kick.",
    coachBehaviours: ["Positive and specific", "Demo, then play", "Silence after the question"],
    interventionStyles: ["Demo", "Freeze", "Q&A"],
    environment: "Quiet on the outside. Praise the touch, not the pass that was already easy.",
    playerFocus: ["technical", "psychological"],
    opponent: {
      shape: "2-2",
      buildUp: "They run straight at the ball.",
      pressTrigger: "Keeper's first touch.",
      weakness: "Both jump and leave the spare player.",
    },
    phases: [
      phase({
        id: "c-warm",
        type: "warmup",
        title: "Free player rondo",
        minutes: 10,
        lengthM: 16,
        widthM: 16,
        zone: "middle-third",
        organisation: "5v2 in a 16×16 box. Three touches. Change the middle pair after four wins.",
        coachingPoints: ["Play the way you are facing, then move the ball on."],
        interventions: ["Concurrent"],
        questions: ["Who is free before you receive?"],
        frames: [
          at(
            [
              player("cw1", "home", 4, "L", 42, 42),
              player("cw2", "home", 6, "R", 58, 42),
              player("cw3", "home", 8, "L", 42, 58),
              player("cw4", "home", 10, "R", 58, 58),
              player("cw5", "away", 7, "P", 48, 50),
              player("cw6", "away", 11, "P", 54, 50),
              token("cw-ball", "ball", 44, 44),
            ],
            {},
            [],
            "Rondo picture.",
            "c-wf",
          ),
        ],
      }),
      technical,
      phase({
        id: "c-ssg",
        type: "ssg",
        title: "4v4 to the end line",
        minutes: 20,
        lengthM: 40,
        widthM: 28,
        zone: "defensive-third",
        organisation: "4v4. Score by dribbling or passing over the far cone line. Restart from the keeper.",
        coachingPoints: ["Score only if the receiver's touch is away from pressure."],
        interventions: ["Terminal"],
        questions: ["Did we need the long kick?"],
        frames: [at(picture.filter((item) => !item.id.startsWith("c-cone") || item.id === "c-cone-3"), {}, [], "Game picture.", "c-sf")],
      }),
    ],
    updatedAt: now(),
  };
}

function sampleB(): Session {
  const picture: Token[] = [
    player("b-h9", "home", 9, "9", 62, 48),
    player("b-h11", "home", 11, "RW", 56, 76),
    player("b-h7", "home", 7, "LW", 56, 24),
    player("b-h8", "home", 8, "8", 46, 40),
    player("b-h10", "home", 10, "10", 46, 62),
    player("b-h6", "home", 6, "6", 34, 50),
    token("b-agk", "gk", 92, 50, { team: "away", number: 1, role: "GK" }),
    player("b-a5", "away", 5, "LCB", 78, 36),
    player("b-a4", "away", 4, "RCB", 78, 64),
    player("b-a3", "away", 3, "LB", 74, 16),
    player("b-a2", "away", 2, "RB", 74, 84),
    player("b-a6", "away", 6, "6", 64, 50),
    player("b-a8", "away", 8, "8", 56, 32),
    player("b-a10", "away", 10, "10", 56, 68),
    token("b-ball", "ball", 74, 40),
    token("b-dummy", "mannequin", 70, 50),
  ];

  return {
    id: "sample-b",
    title: "Jump the pivot",
    tier: "B",
    ageGroup: "U15–U16",
    duration: 60,
    theme: "Press the centre-back's pass into the 6",
    moment: "out-of-possession",
    principle: "Jump as a unit when the ball travels inside.",
    what: "Stop the opposition playing through their 6.",
    where: "Middle third, ball-side half-space.",
    who: "Front three plus the two eights. The 6 stays as cover.",
    when: "Their centre-back plays forward into the pivot, or the pivot shows in front of the ball.",
    why: "So the team wins the ball facing the goal instead of running back.",
    coachBehaviours: ["Scan the picture before speaking", "One voice at a time", "Challenge the picture, not the person"],
    interventionStyles: ["Freeze", "Walkthrough", "Guided discovery"],
    environment: "The opposition coach is live. Home only get the ball back if the press wins it inside 8 seconds.",
    playerFocus: ["psychological", "social", "physical"],
    opponent: {
      shape: "4-3-3",
      buildUp: "Centre-backs split, 6 shows between the lines.",
      pressTrigger: "Ball played inside from the centre-back.",
      weakness: "The 6 receives on the back foot.",
    },
    phases: [
      phase({
        id: "b-warm",
        type: "warmup",
        title: "Bounce and set",
        minutes: 15,
        lengthM: 24,
        widthM: 20,
        zone: "middle-third",
        organisation: "Groups of four. Bounce through the 6, set to the side, then accelerate out.",
        coachingPoints: ["The bounce player sets the angle with their hips, not a shout."],
        interventions: ["Concurrent"],
        questions: ["Where are your hips when the ball arrives?"],
        frames: [
          at(
            [
              player("bw1", "home", 6, "6", 40, 50),
              player("bw2", "home", 8, "8", 52, 36),
              player("bw3", "home", 4, "CB", 30, 50),
              player("bw4", "home", 7, "W", 58, 62),
              token("bw-ball", "ball", 32, 50),
            ],
            {},
            [pass("bw-p", "home", { x: 32, y: 50 }, { x: 40, y: 50 })],
            "Pattern.",
            "b-wf",
          ),
        ],
      }),
      phase({
        id: "b-functional",
        type: "functional",
        title: "Jump the pivot",
        minutes: 25,
        lengthM: 48,
        widthM: 40,
        zone: "middle-third",
        organisation:
          "Opposition back four and midfield three build out. Home front three and two eights press. Score if the press wins it and finishes within two passes.",
        coachingPoints: [
          "The 9 locks the centre-back. The ball-side eight jumps the 6.",
          "The weak-side eight narrows. Nobody presses the same player.",
        ],
        interventions: ["Walkthrough", "Freeze"],
        questions: [
          "What is the trigger to jump?",
          "Who locks the ball, and who covers the next pass?",
        ],
        frames: [
          at(picture, {}, [], "Centre-back has it. The 6 is showing inside.", "b-f1"),
          at(
            picture,
            { "b-h9": [72, 40], "b-h7": [68, 26] },
            [run("b-r1", "home", { x: 62, y: 48 }, { x: 72, y: 40 }), run("b-r2", "home", { x: 56, y: 24 }, { x: 68, y: 26 })],
            "The 9 curves the press. The winger locks the full-back.",
            "b-f2",
          ),
          at(
            picture,
            {
              "b-ball": [64, 50],
              "b-a6": [64, 50],
              "b-h9": [74, 38],
              "b-h7": [70, 22],
              "b-h8": [62, 46],
              "b-h10": [58, 60],
            },
            [
              pass("b-p1", "away", { x: 74, y: 40 }, { x: 64, y: 50 }),
              run("b-r3", "home", { x: 46, y: 40 }, { x: 62, y: 46 }),
              {
                id: "b-zone",
                kind: "press",
                team: "home",
                points: [
                  { x: 56, y: 36 },
                  { x: 74, y: 64 },
                ],
              },
            ],
            "Ball inside. The eight jumps the 6 and the unit holds the curve.",
            "b-f3",
          ),
        ],
      }),
      phase({
        id: "b-ssg",
        type: "ssg",
        title: "7v7 with a live trigger",
        minutes: 20,
        lengthM: 55,
        widthM: 44,
        zone: "middle-third",
        organisation: "7v7 including keepers. A goal only counts if the press started when the centre-back played forward.",
        coachingPoints: ["If the trigger is missed, drop together. Do not press one and leave five."],
        interventions: ["Terminal"],
        questions: ["Did the whole unit see the same trigger?"],
        frames: [at(picture.filter((item) => item.kind !== "mannequin"), {}, [], "Game picture.", "b-sf")],
      }),
    ],
    updatedAt: now(),
  };
}

function sampleA(): Session {
  const home = tokensForFormation("home", "4-3-3").map((item) =>
    item.kind === "gk" ? item : { ...item, x: Math.min(90, item.x + 8) },
  );
  const away = tokensForFormation("away", "4-3-3");
  const base = [...home, ...away];
  const ball = (x: number, y: number): Token => token("a-ball", "ball", x, y);

  const start = [...base, ball(78, 36)];
  const jumped = [
    ...moveRoles(base, {
      "home:ST": [78, 40],
      "home:LW": [74, 18],
      "home:RW": [70, 78],
    }),
    ball(76, 16),
  ];
  const through = [
    ...moveRoles(base, {
      "home:ST": [80, 38],
      "home:LW": [74, 18],
      "home:LCM": [62, 44],
      "home:DM": [48, 50],
      "home:RCM": [56, 64],
      "home:RW": [68, 80],
      "away:DM": [66, 50],
    }),
    ball(64, 50),
  ];

  const game = phase({
    id: "a-game",
    type: "game",
    title: "11v11 — jump or drop on the 6",
    minutes: 45,
    lengthM: 105,
    widthM: 68,
    zone: "full",
    organisation:
      "Full pitch. Opposition score double if they play through the 6 facing play. Home score double if they win it in the opponent half within the press.",
    coachingPoints: [
      "The striker locks the centre-back. The ball-side eight, not the six, jumps the pivot.",
      "If the 6 drops between the centre-backs, the striker goes with him and the eights hold.",
    ],
    interventions: ["Walkthrough", "Terminal"],
    questions: [
      "How does the press change if their 6 drops between the centre-backs?",
      "Where is the cover if we jump and they clip the first line?",
    ],
    frames: [
      { id: "a-f1", note: "Their left centre-back has it. Rest defence is set.", tokens: start, strokes: [] },
      {
        id: "a-f2",
        note: "They bounce wide. The winger jumps, the striker still locks the centre-back.",
        tokens: jumped,
        strokes: [
          pass("a-p1", "away", findRole(start, "away", "LCB"), findRole(jumped, "away", "LB")),
          run("a-r1", "home", findRole(start, "home", "LW"), findRole(jumped, "home", "LW")),
        ],
      },
      {
        id: "a-f3",
        note: "The 6 receives inside. The eight jumps and the far side narrows.",
        tokens: through,
        strokes: [
          pass("a-p2", "away", findRole(jumped, "away", "LB"), { x: 64, y: 50 }),
          run("a-r2", "home", findRole(start, "home", "LCM"), findRole(through, "home", "LCM")),
          {
            id: "a-zone",
            kind: "press",
            team: "home",
            points: [
              { x: 56, y: 30 },
              { x: 78, y: 62 },
            ],
          },
        ],
      },
    ],
  });

  return {
    id: "sample-a",
    title: "High press versus a 4-3-3",
    tier: "A",
    ageGroup: "Senior",
    duration: 90,
    theme: "Opponent game model — jump the 6",
    moment: "out-of-possession",
    principle: "Press on the inside pass, drop as a line if the 6 splits the centre-backs.",
    what: "A high press against a 4-3-3 that builds through the pivot.",
    where: "Opponent build-up half, central lane and ball-side half-space.",
    who: "The front three connected to the midfield three. The back line holds the rest-defence line.",
    when: "Trigger is the centre-back's pass into the 6, or the 6's movement between the centre-backs.",
    why: "To arrive at goal-side of the ball in the opponent half, or to keep a compact block if the trap is played through.",
    coachBehaviours: ["Scan the picture before speaking", "Challenge the picture, not the person", "Silence after the question"],
    interventionStyles: ["Walkthrough", "Guided discovery", "Terminal"],
    environment: "Match clock running. Stop only to replay the trigger, then restart from the same goalkeeper.",
    playerFocus: ["psychological", "social", "physical"],
    opponent: {
      shape: "4-3-3",
      buildUp: "Keeper plays to the weak-side centre-back. The 6 offers between the lines, full-backs stay wide.",
      pressTrigger: "Centre-back plays inside to the 6, or the winger receives facing his own goal.",
      weakness: "The 6 is uncomfortable receiving with the eight already on his shoulder.",
    },
    phases: [
      phase({
        id: "a-warm",
        type: "warmup",
        title: "Activation in the game model",
        minutes: 15,
        lengthM: 30,
        widthM: 20,
        zone: "middle-third",
        organisation: "Passing lines in a 4-3-3 shape at walking then tempo pace. One ball, one bounce through the 6.",
        coachingPoints: ["The shape you press in is the shape you build in."],
        interventions: ["Concurrent"],
        questions: ["Which body is the 6 in our model?"],
        frames: [{ id: "a-wf", note: "Activation shape.", tokens: home, strokes: [] }],
      }),
      phase({
        id: "a-functional",
        type: "functional",
        title: "Trap on the weak-side centre-back",
        minutes: 30,
        lengthM: 60,
        widthM: 50,
        zone: "attacking-third",
        organisation:
          "Opposition back four, 6, and both wingers. Home front three and midfield three. The practice restarts the moment the ball leaves the pressing zone.",
        coachingPoints: ["Show them wide, then jump the return pass inside."],
        interventions: ["Walkthrough", "Guided discovery"],
        questions: ["What is the cue for the far-side winger?"],
        frames: [{ id: "a-ff", note: "Functional picture.", tokens: start, strokes: [] }],
      }),
      game,
    ],
    updatedAt: now(),
  };
}

export function createSample(tier: Tier): Session {
  if (tier === "C") return sampleC();
  if (tier === "A") return sampleA();
  return sampleB();
}

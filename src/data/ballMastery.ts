export interface BallMasterySkill {
  id: string;
  title: string;
  category: "dribbling" | "turning" | "moves" | "juggling";
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  targetBenchmark: string;
  coachingCues: string[];
}

export const BALL_MASTERY_SKILLS: BallMasterySkill[] = [
  // --- DRIBBLING ---
  {
    id: "dribble-close-box",
    title: "Inside-Outside Close Control Box",
    category: "dribbling",
    description:
      "Keep the ball tightly moving within a 2×2m box using alternating inside and outside surfaces of both feet.",
    level: "Beginner",
    targetBenchmark: "60 touches in 45 seconds without leaving the grid",
    coachingCues: [
      "Knees bent with low centre of gravity.",
      "Touch the ball every step; do not run after it.",
      "Head up on every 3rd touch to scan surroundings.",
    ],
  },
  {
    id: "dribble-sole-roll-cut",
    title: "Sole Roll & Outside Cut Combo",
    category: "dribbling",
    description:
      "Roll the ball across your body with the sole of the foot, then instantly flick it forward with the outside of the opposite foot.",
    level: "Intermediate",
    targetBenchmark: "30 continuous transitions (15 left, 15 right) in 40s",
    coachingCues: [
      "Use the studs/sole for a smooth roll across the midline.",
      "Immediate explosive push with the outside pinky toe.",
      "Keep plant foot hopping to maintain balance.",
    ],
  },
  {
    id: "dribble-speed-burst",
    title: "Speed Dribble & Deceleration Gates",
    category: "dribbling",
    description:
      "Dribble with top laces over 10m, slam the brakes with a sole stop at the gate, and explode back.",
    level: "Advanced",
    targetBenchmark: "6 clean reps in 30 seconds with sharp stops",
    coachingCues: [
      "Point toe down and strike ball with laces for straight acceleration.",
      "Lower hips rapidly before stopping to avoid tipping forward.",
      "Immediate change of pace out of the stop.",
    ],
  },

  // --- TURNING ---
  {
    id: "turn-cruyff",
    title: "The Cruyff Turn",
    category: "turning",
    description:
      "Disguise as a shot or long pass, hook the ball behind your plant leg with the inside of the foot, and turn 180° into space.",
    level: "Beginner",
    targetBenchmark: "10 clean executions (5 each foot) with realistic disguise",
    coachingCues: [
      "Full arm swing and raised head to sell the fake strike.",
      "Plant foot firmly slightly past the ball.",
      "Snap the inside of the kicking foot back through the gap.",
    ],
  },
  {
    id: "turn-drag-back",
    title: "Sole Drag-Back & U-Turn",
    category: "turning",
    description:
      "Under pressure on the touchline, plant the non-kicking foot and drag the ball backwards with the sole, opening hips to face the new direction.",
    level: "Beginner",
    targetBenchmark: "20 reps alternating feet while maintaining rhythm",
    coachingCues: [
      "Shield the ball with the body as you reach with the sole.",
      "Hop on the plant foot as the ball rolls backwards.",
      "Turn your shoulders immediately to face the exit space.",
    ],
  },
  {
    id: "turn-stepover-turn",
    title: "Stepover Turn (Rivaldo / Zidane Turn)",
    category: "turning",
    description:
      "Step over the ball with one foot as if shielding it forward, then pivot and take it away with the inside of the opposite foot.",
    level: "Intermediate",
    targetBenchmark: "15 continuous turns across cones with zero hesitation",
    coachingCues: [
      "Step cleanly over the ball without touching it.",
      "Drop the shoulder of the stepping leg to sell the run.",
      "Pivot 180 degrees quickly on the balls of your feet.",
    ],
  },
  {
    id: "turn-inside-outside-hook",
    title: "Inside & Outside Hook Mastery",
    category: "turning",
    description:
      "Sharp 180° turns around cones using first the inside of the foot, then the outside of the foot.",
    level: "Intermediate",
    targetBenchmark: "10 alternating hooks around 4 cones under 25s",
    coachingCues: [
      "Bend both knees deeply to get underneath the ball's momentum.",
      "Snap the ankle firmly to kill the ball's momentum on the turn.",
      "Accelerate immediately after the hook.",
    ],
  },

  // --- MOVES TO BEAT PLAYERS ---
  {
    id: "move-single-scissor",
    title: "Single & Double Scissors",
    category: "moves",
    description:
      "Circle one or both feet around the ball from inside to outside, feinting in one direction before pushing the opposite way with the outside of the foot.",
    level: "Intermediate",
    targetBenchmark: "8 reps beating stationary cone at game-speed",
    coachingCues: [
      "Step foot around the front of the ball, landing heel-first to dip shoulder.",
      "Keep hips facing forward until the final touch.",
      "Explode out with the outside of the opposite foot.",
    ],
  },
  {
    id: "move-body-feint",
    title: "Body Feint (Sir Stanley Matthews)",
    category: "moves",
    description:
      "Drop your shoulder and lean heavily on the plant foot without touching the ball, then burst in the opposite direction.",
    level: "Beginner",
    targetBenchmark: "10 reps with clear body weight shift and acceleration",
    coachingCues: [
      "Exaggerate the shoulder drop and bend the knee of the fake side.",
      "Eyes must look in the direction of the fake.",
      "Push off the fake foot with power to accelerate away.",
    ],
  },
  {
    id: "move-ronaldo-chop",
    title: "The Ronaldo Chop",
    category: "moves",
    description:
      "Mid-stride jump, chopping the ball with the inside of the trailing foot behind the front plant leg at a 45° angle.",
    level: "Advanced",
    targetBenchmark: "8 clean chops while sprinting at 80% pace",
    coachingCues: [
      "Time the little hop just before contact.",
      "Trailing foot chops down and across behind the standing leg.",
      "Change direction immediately onto the 45-degree angle.",
    ],
  },
  {
    id: "move-elastico",
    title: "The Elastico (Flip-Flap)",
    category: "moves",
    description:
      "In a single touch, push the ball outward with the outside of the foot, then rapidly wrap the inside of the same foot around it to snap it back inside.",
    level: "Advanced",
    targetBenchmark: "6 continuous elasticos with smooth single-motion flick",
    coachingCues: [
      "Ankle must stay flexible and relaxed.",
      "First touch pushes ball diagonally out to draw the defender's leg.",
      "Wrist-flick motion with the ankle to snap it across.",
    ],
  },

  // --- JUGGLING ---
  {
    id: "juggle-foot-to-foot",
    title: "Alternating Foot-to-Foot Juggling",
    category: "juggling",
    description:
      "Continuous keep-ups alternating strictly between right foot and left foot, keeping the ball below waist height.",
    level: "Beginner",
    targetBenchmark: "50 continuous alternating touches (25 Right, 25 Left)",
    coachingCues: [
      "Lock ankle pointing slightly up toward your shin for gentle backspin.",
      "Hit the sweet spot on the laces / bridge of the boot.",
      "Stay light on the balls of your feet with knees soft.",
    ],
  },
  {
    id: "juggle-thigh-ladder",
    title: "Thigh-to-Foot Aerial Ladder",
    category: "juggling",
    description:
      "Sequence pattern: Right Foot → Right Thigh → Left Thigh → Left Foot → repeat.",
    level: "Intermediate",
    targetBenchmark: "10 complete 4-touch cycles (40 touches total) without dropping",
    coachingCues: [
      "Thigh comes up parallel to the ground to cushion the ball up.",
      "Soft touch so the ball does not bounce above head height.",
      "Adjust body position with small micro-hops.",
    ],
  },
  {
    id: "juggle-aerial-cushion",
    title: "High Ball Cushion & Ground Kill",
    category: "juggling",
    description:
      "Pop ball 4-5 metres into the air; on descent, cushion it dead with the laces or outside of the foot before it touches the grass.",
    level: "Advanced",
    targetBenchmark: "8 dead cushions within a 1-metre radius",
    coachingCues: [
      "Meet the ball with your foot as it falls and drop the foot at the same speed.",
      "Relax the ankle completely like a pillow on impact.",
      "Immediately prepare body to dribble or pass.",
    ],
  },
];

export function getSkillsByCategory(category: BallMasterySkill["category"]): BallMasterySkill[] {
  return BALL_MASTERY_SKILLS.filter((s) => s.category === category);
}

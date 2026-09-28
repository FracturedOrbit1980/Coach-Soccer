import { useRef, useState, type PointerEvent } from "react";
import { dribblePath, polyline, practiceRect, SVG_H, SVG_W, toSvg, viewBoxFor } from "../lib/geometry";
import { shortName } from "../lib/squad";
import type { Frame, PitchView, Point, Stroke, StrokeKind, Team, Token, Tool, Zone } from "../types";

const DRAW: Tool[] = ["pass", "run", "dribble", "press"];

interface PitchProps {
  frame: Frame;
  onion?: Frame | null;
  view: PitchView;
  tool: Tool;
  selectedId: string | null;
  showGrid: boolean;
  showArea: boolean;
  lengthM: number;
  widthM: number;
  zone: Zone;
  drawTeam?: Team;
  readOnly?: boolean;
  onSelect?: (id: string | null, kind?: "token" | "stroke" | null) => void;
  onCheckpoint?: () => void;
  onPatchToken?: (id: string, partial: Partial<Token>) => void;
  onPlace?: (point: Point) => void;
  onStroke?: (kind: StrokeKind, points: Point[]) => void;
  onErase?: (id: string, kind: "token" | "stroke") => void;
}

function simplify(points: Point[]): Point[] {
  const kept = [points[0]];
  for (const point of points.slice(1)) {
    const last = kept[kept.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) >= 0.65) kept.push(point);
  }
  const end = points[points.length - 1];
  const last = kept[kept.length - 1];
  if (Math.hypot(end.x - last.x, end.y - last.y) > 0.2) kept.push(end);
  return kept;
}

export function Pitch({
  frame,
  onion,
  view,
  tool,
  selectedId,
  showGrid,
  showArea,
  lengthM,
  widthM,
  zone,
  drawTeam = "home",
  readOnly,
  onSelect,
  onCheckpoint,
  onPatchToken,
  onPlace,
  onStroke,
  onErase,
}: PitchProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
  const drawing = useRef<Point[] | null>(null);
  const [draft, setDraft] = useState<Point[] | null>(null);
  const prefix = `p${frame.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const interactive = !readOnly && (tool === "select" || tool === "erase");
  const area = showArea ? practiceRect(zone, lengthM, widthM) : null;

  function toPitch(event: PointerEvent<SVGSVGElement>): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 50, y: 50 };
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 50, y: 50 };
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    return { x: (local.x / SVG_W) * 100, y: (local.y / SVG_H) * 100 };
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (readOnly) return;
    event.preventDefault();
    svgRef.current?.setPointerCapture(event.pointerId);
    const point = toPitch(event);
    const target = event.target instanceof Element ? event.target : null;
    const tokenId = target?.closest("[data-token]")?.getAttribute("data-token");
    const strokeId = target?.closest("[data-stroke]")?.getAttribute("data-stroke");

    if (tool === "erase") {
      if (tokenId) onErase?.(tokenId, "token");
      else if (strokeId) onErase?.(strokeId, "stroke");
      return;
    }
    if (tool === "select") {
      if (tokenId) {
        const token = frame.tokens.find((item) => item.id === tokenId);
        if (!token) return;
        onSelect?.(tokenId, "token");
        drag.current = { id: tokenId, dx: token.x - point.x, dy: token.y - point.y, moved: false };
        return;
      }
      if (strokeId) {
        onSelect?.(strokeId, "stroke");
        return;
      }
      onSelect?.(null, null);
      return;
    }
    if (DRAW.includes(tool)) {
      drawing.current = [point];
      setDraft([point]);
      return;
    }
    onPlace?.(point);
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (readOnly) return;
    const point = toPitch(event);
    if (drag.current) {
      if (!drag.current.moved) {
        drag.current.moved = true;
        onCheckpoint?.();
      }
      onPatchToken?.(drag.current.id, {
        x: Math.min(98.5, Math.max(1.5, point.x + drag.current.dx)),
        y: Math.min(98.5, Math.max(1.5, point.y + drag.current.dy)),
      });
      return;
    }
    if (drawing.current) {
      const next = [...drawing.current, point];
      drawing.current = next;
      setDraft(next);
    }
  }

  function onPointerUp() {
    if (drawing.current && drawing.current.length > 1 && DRAW.includes(tool)) {
      const points = tool === "press" ? [drawing.current[0], drawing.current[drawing.current.length - 1]] : simplify(drawing.current);
      const start = points[0];
      const end = points[points.length - 1];
      if (Math.hypot(end.x - start.x, end.y - start.y) >= 1.1) {
        onStroke?.(tool as StrokeKind, points);
      }
    }
    drawing.current = null;
    drag.current = null;
    setDraft(null);
  }

  return (
    <svg
      ref={svgRef}
      className="pitch-svg"
      data-tool={tool}
      viewBox={viewBoxFor(view)}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="img"
      aria-label="Tactical pitch"
    >
      <PitchDefs prefix={prefix} />
      <rect x={-80} y={-80} width={1300} height={900} fill="#07140f" />
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill={`url(#${prefix}-grass)`} />
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill={`url(#${prefix}-vignette)`} />
      <rect x="8" y="8" width={SVG_W - 16} height={SVG_H - 16} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="16" />
      {showGrid && <Grid />}
      {view === "channels" && <Channels />}
      {view === "thirds" && <Thirds />}
      <g transform="translate(2.2 3.2)" opacity="0.4">
        <Markings ink="#03140c" dots={false} />
      </g>
      <Markings />
      {area && (
        <g>
          <rect
            x={(area.x / 100) * SVG_W}
            y={(area.y / 100) * SVG_H}
            width={(area.w / 100) * SVG_W}
            height={(area.h / 100) * SVG_H}
            fill="rgba(255,255,255,0.05)"
            stroke="#f4f7fb"
            strokeDasharray="10 8"
            strokeWidth="2"
          />
        </g>
      )}
      {onion && (
        <g opacity="0.28">
          {onion.tokens.map((token) => (
            <TokenGlyph key={`onion-${token.id}`} token={token} prefix={prefix} />
          ))}
        </g>
      )}
      {frame.strokes.map((stroke) => (
        <StrokeGlyph key={stroke.id} stroke={stroke} prefix={prefix} interactive={interactive} selected={selectedId === stroke.id} />
      ))}
      {draft && DRAW.includes(tool) && (
        <StrokeGlyph
          stroke={{ id: "draft", kind: tool as StrokeKind, team: drawTeam, points: draft }}
          prefix={prefix}
          interactive={false}
          selected={false}
        />
      )}
      {frame.tokens
        .filter((token) => token.kind !== "player" && token.kind !== "gk" && token.kind !== "ball")
        .map((token) => (
          <TokenGlyph key={token.id} token={token} prefix={prefix} interactive={interactive} selected={selectedId === token.id} />
        ))}
      {frame.tokens
        .filter((token) => token.kind === "player" || token.kind === "gk")
        .map((token) => (
          <TokenGlyph key={token.id} token={token} prefix={prefix} interactive={interactive} selected={selectedId === token.id} />
        ))}
      {frame.tokens
        .filter((token) => token.kind === "ball")
        .map((token) => (
          <TokenGlyph key={token.id} token={token} prefix={prefix} interactive={interactive} selected={selectedId === token.id} />
        ))}
    </svg>
  );
}

function Grid() {
  const lines = [];
  for (let metre = 5; metre < 105; metre += 5) {
    const x = metre * 10;
    lines.push(<line key={`vx${metre}`} x1={x} y1={0} x2={x} y2={SVG_H} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />);
  }
  for (let metre = 5; metre < 68; metre += 5) {
    const y = metre * 10;
    lines.push(<line key={`hy${metre}`} x1={0} y1={y} x2={SVG_W} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />);
  }
  return <g>{lines}</g>;
}

function Thirds() {
  return (
    <g>
      {[350, 700].map((x) => (
        <line key={x} x1={x} y1={0} x2={x} y2={SVG_H} stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="8 8" />
      ))}
      <ZoneLabel x={175} label="Defensive" />
      <ZoneLabel x={525} label="Middle" />
      <ZoneLabel x={875} label="Attacking" />
    </g>
  );
}

function Channels() {
  const lane = SVG_H / 5;
  return (
    <g>
      {[1, 3].map((index) => (
        <rect key={index} x="0" y={lane * index} width={SVG_W} height={lane} fill="rgba(255,255,255,0.05)" />
      ))}
      {Array.from({ length: 4 }, (_, index) => (
        <line
          key={index}
          x1="0"
          y1={lane * (index + 1)}
          x2={SVG_W}
          y2={lane * (index + 1)}
          stroke="rgba(255,255,255,0.28)"
          strokeDasharray="6 8"
        />
      ))}
      <text x="16" y={lane * 0.55} fill="#f4f7fb" fontSize="16" fontFamily="Outfit, sans-serif">
        Wide
      </text>
      <text x="16" y={lane * 1.55} fill="#f4f7fb" fontSize="16" fontFamily="Outfit, sans-serif">
        Half-space
      </text>
      <text x="16" y={lane * 2.55} fill="#f4f7fb" fontSize="16" fontFamily="Outfit, sans-serif">
        Central
      </text>
    </g>
  );
}

function ZoneLabel({ x, label }: { x: number; label: string }) {
  return (
    <text x={x} y="28" textAnchor="middle" fill="#f4f7fb" fontSize="18" fontFamily="Outfit, sans-serif" opacity="0.85">
      {label}
    </text>
  );
}

function PitchDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      <linearGradient id={`${prefix}-grass-a`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#24aa60" />
        <stop offset="46%" stopColor="#128246" />
        <stop offset="100%" stopColor="#0a572e" />
      </linearGradient>
      <linearGradient id={`${prefix}-grass-b`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#17884b" />
        <stop offset="46%" stopColor="#0d6c3a" />
        <stop offset="100%" stopColor="#073f21" />
      </linearGradient>
      <pattern id={`${prefix}-grass`} width="84" height={SVG_H} patternUnits="userSpaceOnUse">
        <rect width="42" height={SVG_H} fill={`url(#${prefix}-grass-a)`} />
        <rect x="42" width="42" height={SVG_H} fill={`url(#${prefix}-grass-b)`} />
      </pattern>
      <radialGradient id={`${prefix}-vignette`} cx="50%" cy="44%" r="72%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
        <stop offset="40%" stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
      </radialGradient>
      <linearGradient id={`${prefix}-home-kit`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#9ec4f5" />
        <stop offset="36%" stopColor="#1d4f98" />
        <stop offset="100%" stopColor="#091f40" />
      </linearGradient>
      <linearGradient id={`${prefix}-away-kit`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fffaf0" />
        <stop offset="42%" stopColor="#f0ddb0" />
        <stop offset="100%" stopColor="#c4a56a" />
      </linearGradient>
      <linearGradient id={`${prefix}-gk-kit`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c8ffe8" />
        <stop offset="40%" stopColor="#18a574" />
        <stop offset="100%" stopColor="#08543a" />
      </linearGradient>
      <linearGradient id={`${prefix}-gk-away-kit`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffd2aa" />
        <stop offset="42%" stopColor="#e07a32" />
        <stop offset="100%" stopColor="#8a3d12" />
      </linearGradient>
      <radialGradient id={`${prefix}-head`} cx="34%" cy="30%" r="72%">
        <stop offset="0%" stopColor="#f7dcc2" />
        <stop offset="58%" stopColor="#e0aa78" />
        <stop offset="100%" stopColor="#a56a42" />
      </radialGradient>
      <radialGradient id={`${prefix}-ball`} cx="34%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="62%" stopColor="#e6e6de" />
        <stop offset="100%" stopColor="#b4b4aa" />
      </radialGradient>
      <linearGradient id={`${prefix}-cone`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffe0c2" />
        <stop offset="38%" stopColor="#ff7a2a" />
        <stop offset="100%" stopColor="#b13e00" />
      </linearGradient>
      <linearGradient id={`${prefix}-dummy`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff9a9a" />
        <stop offset="42%" stopColor="#d23b3b" />
        <stop offset="100%" stopColor="#6c1414" />
      </linearGradient>
      <radialGradient id={`${prefix}-ground`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(0,0,0,0.5)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
      <marker id={`${prefix}-home`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="#d5e4ff" />
      </marker>
      <marker id={`${prefix}-away`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill="#f0d48a" />
      </marker>
    </defs>
  );
}

function Markings({ ink = "#f7fbf8", dots = true }: { ink?: string; dots?: boolean }) {
  const boxY = (SVG_H - 403.2) / 2;
  const sixY = (SVG_H - 183.2) / 2;
  return (
    <g fill="none" stroke={ink} strokeWidth="2.4" strokeLinejoin="round">
      <path d="M0 303.4 H-16 V376.6 H0" />
      <path d="M1050 303.4 H1066 V376.6 H1050" />
      <rect x="0" y="0" width={SVG_W} height={SVG_H} />
      <line x1="525" y1="0" x2="525" y2={SVG_H} />
      <circle cx="525" cy="340" r="91.5" />
      {dots && <circle cx="525" cy="340" r="3" fill={ink} stroke="none" />}
      <rect x="0" y={boxY} width="165" height="403.2" />
      <rect x="885" y={boxY} width="165" height="403.2" />
      <rect x="0" y={sixY} width="55" height="183.2" />
      <rect x="995" y={sixY} width="55" height="183.2" />
      {dots && <circle cx="110" cy="340" r="3" fill={ink} stroke="none" />}
      {dots && <circle cx="940" cy="340" r="3" fill={ink} stroke="none" />}
      <path d="M165 266.9 A91.5 91.5 0 0 1 165 413.1" />
      <path d="M885 266.9 A91.5 91.5 0 0 0 885 413.1" />
      <path d="M0 10 A10 10 0 0 0 10 0" />
      <path d="M1040 0 A10 10 0 0 0 1050 10" />
      <path d="M10 680 A10 10 0 0 0 0 670" />
      <path d="M1050 670 A10 10 0 0 0 1040 680" />
    </g>
  );
}

function StrokeGlyph({
  stroke,
  prefix,
  interactive,
  selected,
}: {
  stroke: Stroke;
  prefix: string;
  interactive: boolean;
  selected: boolean;
}) {
  const color = stroke.team === "home" ? "#d5e4ff" : "#f0d48a";
  const marker = stroke.team === "home" ? `url(#${prefix}-home)` : `url(#${prefix}-away)`;
  if (stroke.points.length < 2) return null;
  if (stroke.kind === "press") {
    const a = toSvg(stroke.points[0]);
    const b = toSvg(stroke.points[stroke.points.length - 1]);
    return (
      <rect
        data-stroke={stroke.id}
        x={Math.min(a.x, b.x)}
        y={Math.min(a.y, b.y)}
        width={Math.abs(a.x - b.x)}
        height={Math.abs(a.y - b.y)}
        rx="8"
        fill={stroke.team === "home" ? "rgba(80,140,255,0.18)" : "rgba(228,182,90,0.18)"}
        stroke={selected ? "#ffffff" : color}
        strokeWidth={selected ? 3 : 2}
        strokeDasharray="8 6"
        style={{ pointerEvents: interactive ? "all" : "none" }}
      />
    );
  }
  const d = stroke.kind === "dribble" ? dribblePath(stroke.points) : polyline(stroke.points);
  return (
    <path
      data-stroke={stroke.id}
      d={d}
      fill="none"
      stroke={stroke.kind === "dribble" ? "#c8ffe4" : color}
      strokeWidth={selected ? 4 : 2.6}
      strokeLinecap="round"
      strokeDasharray={stroke.kind === "run" ? "9 7" : undefined}
      markerEnd={stroke.kind === "dribble" ? undefined : marker}
      style={{ pointerEvents: interactive ? "stroke" : "none" }}
    />
  );
}

function TokenGlyph({
  token,
  prefix,
  interactive = false,
  selected = false,
}: {
  token: Token;
  prefix: string;
  interactive?: boolean;
  selected?: boolean;
}) {
  const point = toSvg(token);
  const events = interactive ? "all" : "none";
  if (token.kind === "marker") {
    const label = token.label || "Note";
    const width = Math.max(52, label.length * 7.2 + 16);
    return (
      <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
        <rect x={-8} y={-18} width={width} height={22} rx="5" fill="#101820" stroke={selected ? "#ffffff" : "#e4b65a"} />
        <text x="4" y="-3" fill="#f6e7c4" fontSize="12" fontFamily="Outfit, sans-serif">
          {label}
        </text>
      </g>
    );
  }
  if (token.kind === "cone") {
    return (
      <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
        <ellipse cy="10" rx="10" ry="3" fill={`url(#${prefix}-ground)`} />
        <path d="M0 -14 L10.5 9 H-10.5 Z" fill={`url(#${prefix}-cone)`} stroke={selected ? "#fff" : "#7a2e00"} strokeWidth="1.2" />
        <path d="M-1.2 -12 L2.2 8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    );
  }
  if (token.kind === "mannequin") {
    return (
      <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
        {selected && <rect x="-14" y="-32" width="28" height="46" rx="10" fill="none" stroke="#e4b65a" strokeWidth="1.6" />}
        <ellipse cy="12" rx="12" ry="3.6" fill={`url(#${prefix}-ground)`} />
        <rect x="-10" y="7" width="20" height="3.4" rx="1.2" fill="#2c2c2c" />
        <rect x="-1.4" y="1" width="2.8" height="7" fill="#4a4a4a" />
        <path d="M-8 -20 C-11 -11 -10 0 -7 2.2 H7 C10 0 11 -11 8 -20 C4.4 -25 -4.4 -25 -8 -20 Z" fill={`url(#${prefix}-dummy)`} />
        <path d="M1.2 -22 C5.4 -17 6.6 -8 5.4 1 H2.6 C3.8 -8 2.4 -16 0.4 -21 Z" fill="rgba(0,0,0,0.22)" />
        <path d="M-4.6 -20 C-6.2 -14 -5.5 -8 -4.2 -4" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.3" strokeLinecap="round" />
        <circle cy="-26" r="5.8" fill={`url(#${prefix}-head)`} />
        <ellipse cx="-1.5" cy="-27.6" rx="2.1" ry="1.2" fill="rgba(255,255,255,0.4)" />
      </g>
    );
  }
  if (token.kind === "goal") {
    return (
      <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
        <ellipse cy="14" rx="20" ry="4" fill={`url(#${prefix}-ground)`} />
        <path d="M-18 -12 V12 H18 V-12" fill="rgba(255,255,255,0.08)" stroke={selected ? "#fff" : "#f7fbf8"} strokeWidth="2.4" />
        <path d="M-18 -12 L-26 -4 V16 L-18 12" fill="rgba(0,0,0,0.18)" stroke="#d7e4dc" strokeWidth="1.3" />
        <path d="M-12 -12 V12 M-6 -12 V12 M0 -12 V12 M6 -12 V12 M12 -12 V12" stroke="rgba(247,251,248,0.35)" strokeWidth="0.8" />
      </g>
    );
  }
  if (token.kind === "pole") {
    return (
      <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
        <ellipse cy="16" rx="6" ry="2" fill={`url(#${prefix}-ground)`} />
        <rect x="-2.2" y="-16" width="4.4" height="32" rx="2" fill={selected ? "#fff" : "#ffe08a"} />
        <rect x="-2.2" y="-16" width="1.6" height="32" rx="1" fill="rgba(255,255,255,0.45)" />
      </g>
    );
  }
  if (token.kind === "ball") {
    return (
      <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
        <ellipse cy="7" rx="8" ry="2.6" fill={`url(#${prefix}-ground)`} />
        <circle r="8.4" fill={`url(#${prefix}-ball)`} stroke={selected ? "#e4b65a" : "#1c1c1c"} strokeWidth="1.1" />
        <path d="M0 -4.4 L3.5 -1.2 L2.2 3.5 H-2.2 L-3.5 -1.2 Z" fill="#1c1c1c" />
        <path d="M0 -4.4 L0 -8.2 M3.5 -1.2 L7.2 -2.2 M2.2 3.5 L4.6 7.2 M-2.2 3.5 L-4.6 7.2 M-3.5 -1.2 L-7.2 -2.2" stroke="#1c1c1c" strokeWidth="0.7" />
      </g>
    );
  }

  return <PlayerMannequin token={token} prefix={prefix} events={events} selected={selected} />;
}

function PlayerMannequin({
  token,
  prefix,
  events,
  selected,
}: {
  token: Token;
  prefix: string;
  events: "all" | "none";
  selected: boolean;
}) {
  const home = token.team !== "away";
  const keeper = token.kind === "gk";
  const fill = keeper
    ? `url(#${prefix}-${home ? "gk-kit" : "gk-away-kit"})`
    : `url(#${prefix}-${home ? "home-kit" : "away-kit"})`;
  const arm = keeper ? (home ? "#0c6a48" : "#8a3e14") : home ? "#12386e" : "#9a7438";
  const ink = !home && !keeper ? "#1c1408" : "#f7fbff";
  const trim = keeper ? (home ? "#e9fff6" : "#ffe4cc") : home ? "#e4b65a" : "#1d3f86";
  const name = shortName(token.name);
  const point = toSvg(token);
  return (
    <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
      <rect x="-18" y="-46" width="36" height="70" fill="transparent" />
      {selected && <rect x="-16" y="-44" width="32" height="54" rx="14" fill="none" stroke="#e4b65a" strokeWidth="1.7" />}
      <ellipse cx="0" cy="4" rx="13" ry="4.2" fill={`url(#${prefix}-ground)`} />
      <path d="M-6.4 -10 L-8.6 1.4 Q-5.4 3.4 -2.2 1.2 L-1.1 -10 Z" fill="#1a1a1a" />
      <path d="M1.1 -10 L2.4 1.2 Q5.6 3.4 8.6 1.4 L6.4 -10 Z" fill="#101010" />
      <path d="M-9 0.2 H-2 Q-1.2 2.8 -4.8 3 Q-9.6 3 -9 0.2 Z" fill={trim} />
      <path d="M2 0.2 H9 Q9.6 3 4.8 3 Q1.2 2.8 2 0.2 Z" fill={trim} />
      <path
        d="M-8.6 -25.2 C-10.6 -18 -9.4 -12 -7.2 -9.4 H7.2 C9.4 -12 10.6 -18 8.6 -25.2 C5.2 -29 -5.2 -29 -8.6 -25.2 Z"
        fill={fill}
        stroke="rgba(0,0,0,0.28)"
        strokeWidth="0.6"
      />
      <path d="M2 -27 C6.6 -24 8.6 -18 7.2 -10.4 H4 C5.6 -17 4.2 -23 1 -26 Z" fill="rgba(0,0,0,0.24)" />
      <path d="M-5.6 -26 C-7.2 -20 -6.5 -15 -5 -11.5" fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M-7.6 -22.5 C-14 -18 -14.8 -12 -11.4 -8" fill="none" stroke={arm} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M7.6 -22.5 C14 -18 14.8 -12 11.4 -8" fill="none" stroke={arm} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M-3.3 -26.6 Q0 -24.4 3.3 -26.6" fill="none" stroke={trim} strokeWidth="1.35" strokeLinecap="round" />
      <circle cy="-34" r="6.4" fill={`url(#${prefix}-head)`} stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
      <ellipse cx="-1.6" cy="-36" rx="2.4" ry="1.5" fill="rgba(255,255,255,0.42)" />
      <text textAnchor="middle" y="-15.2" fill={ink} fontSize="12" fontFamily="Barlow Condensed, sans-serif" fontWeight="700">
        {token.number ?? ""}
      </text>
      {(name || token.role) && (
        <text
          textAnchor="middle"
          y="16"
          fill="#f7fbf8"
          fontSize="11"
          fontFamily="Barlow Condensed, sans-serif"
          letterSpacing="0.4"
          stroke="#07140c"
          strokeWidth="2.8"
          paintOrder="stroke"
        >
          {name || token.role}
        </text>
      )}
    </g>
  );
}

import { useRef, useState, type PointerEvent } from "react";
import { dribblePath, polyline, practiceRect, SVG_H, SVG_W, toSvg, viewBoxFor } from "../lib/geometry";
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
      <defs>
        <pattern id={`${prefix}-grass`} width="70" height={SVG_H} patternUnits="userSpaceOnUse">
          <rect width="35" height={SVG_H} fill="#128245" />
          <rect x="35" width="35" height={SVG_H} fill="#0f7640" />
        </pattern>
        <marker id={`${prefix}-home`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="#d5e4ff" />
        </marker>
        <marker id={`${prefix}-away`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="#f0d48a" />
        </marker>
      </defs>
      <rect x={-80} y={-80} width={1300} height={900} fill="#07140f" />
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill={`url(#${prefix}-grass)`} />
      {showGrid && <Grid />}
      {view === "channels" && <Channels />}
      {view === "thirds" && <Thirds />}
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
            <TokenGlyph key={`onion-${token.id}`} token={token} />
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
          <TokenGlyph key={token.id} token={token} interactive={interactive} selected={selectedId === token.id} />
        ))}
      {frame.tokens
        .filter((token) => token.kind === "player" || token.kind === "gk")
        .map((token) => (
          <TokenGlyph key={token.id} token={token} interactive={interactive} selected={selectedId === token.id} />
        ))}
      {frame.tokens
        .filter((token) => token.kind === "ball")
        .map((token) => (
          <TokenGlyph key={token.id} token={token} interactive={interactive} selected={selectedId === token.id} />
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

function Markings() {
  const boxY = (SVG_H - 403.2) / 2;
  const sixY = (SVG_H - 183.2) / 2;
  return (
    <g fill="none" stroke="#f7fbf8" strokeWidth="2.4" strokeLinejoin="round">
      <path d="M0 303.4 H-16 V376.6 H0" />
      <path d="M1050 303.4 H1066 V376.6 H1050" />
      <rect x="0" y="0" width={SVG_W} height={SVG_H} />
      <line x1="525" y1="0" x2="525" y2={SVG_H} />
      <circle cx="525" cy="340" r="91.5" />
      <circle cx="525" cy="340" r="3" fill="#f7fbf8" stroke="none" />
      <rect x="0" y={boxY} width="165" height="403.2" />
      <rect x="885" y={boxY} width="165" height="403.2" />
      <rect x="0" y={sixY} width="55" height="183.2" />
      <rect x="995" y={sixY} width="55" height="183.2" />
      <circle cx="110" cy="340" r="3" fill="#f7fbf8" stroke="none" />
      <circle cx="940" cy="340" r="3" fill="#f7fbf8" stroke="none" />
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

function TokenGlyph({ token, interactive = false, selected = false }: { token: Token; interactive?: boolean; selected?: boolean }) {
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
        <path d="M0 -12 L9 10 H-9 Z" fill="#ff8a3d" stroke={selected ? "#fff" : "#7a2e00"} strokeWidth="1.5" />
      </g>
    );
  }
  if (token.kind === "mannequin") {
    return (
      <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
        <circle cy="-10" r="5" fill="#d84b4b" />
        <path d="M-8 12 L0 -4 L8 12 Z" fill="#d84b4b" stroke={selected ? "#fff" : "#5c1212"} />
      </g>
    );
  }
  if (token.kind === "goal") {
    return (
      <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
        <path d="M-18 -12 V12 H18 V-12" fill="none" stroke={selected ? "#fff" : "#f7fbf8"} strokeWidth="2.4" />
        <path d="M-18 -12 L-26 -4 V16 L-18 12" fill="none" stroke="#f7fbf8" strokeWidth="1.4" opacity="0.7" />
      </g>
    );
  }
  if (token.kind === "pole") {
    return (
      <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
        <rect x="-2" y="-16" width="4" height="32" rx="2" fill={selected ? "#fff" : "#ffe08a"} />
      </g>
    );
  }
  if (token.kind === "ball") {
    return (
      <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
        <circle r="8" fill="#f7f7f2" stroke={selected ? "#e4b65a" : "#1c1c1c"} strokeWidth="1.4" />
        <path d="M0 -4 L3.2 -1.2 L2 3.2 H-2 L-3.2 -1.2 Z" fill="#1c1c1c" />
      </g>
    );
  }

  const home = token.team !== "away";
  const radius = token.kind === "gk" ? 18 : 16;
  return (
    <g data-token={token.id} transform={`translate(${point.x} ${point.y})`} style={{ pointerEvents: events }}>
      {selected && <circle r={radius + 6} fill="none" stroke="#e4b65a" strokeWidth="2.5" />}
      <circle cy="2" r={radius} fill="rgba(0,0,0,0.25)" />
      <circle
        r={radius}
        fill={home ? "#163864" : "#f4f7fb"}
        stroke={token.kind === "gk" ? "#3dce97" : home ? "#9ec0ff" : "#d7b56a"}
        strokeWidth="2"
      />
      <text
        textAnchor="middle"
        y="5"
        fill={home ? "#f4f8ff" : "#142033"}
        fontSize="13"
        fontFamily="Outfit, sans-serif"
        fontWeight="600"
      >
        {token.number ?? ""}
      </text>
      {token.role && (
        <text
          textAnchor="middle"
          y={radius + 13}
          fill="#f7fbf8"
          fontSize="11"
          fontFamily="Outfit, sans-serif"
          stroke="#0c2418"
          strokeWidth="3"
          paintOrder="stroke"
        >
          {token.role}
        </text>
      )}
    </g>
  );
}

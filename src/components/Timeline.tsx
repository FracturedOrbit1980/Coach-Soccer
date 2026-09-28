import { Pause, Play, Plus, Trash2 } from "lucide-react";
import { useRef } from "react";
import type { Frame, Token } from "../types";

const SPEEDS = [
  { value: 0.45, label: "0.5×" },
  { value: 0.8, label: "1×" },
  { value: 1.15, label: "1.5×" },
  { value: 1.7, label: "2×" },
];

export function Timeline({
  frames,
  activeId,
  liveIndex,
  playing,
  speed,
  note,
  onSelect,
  onPlay,
  onAdd,
  onDelete,
  onSpeed,
  onNote,
  onScrubStart,
  onScrub,
  onScrubEnd,
}: {
  frames: Frame[];
  activeId: string;
  liveIndex: number;
  playing: boolean;
  speed: number;
  note: string;
  onSelect: (id: string) => void;
  onPlay: () => void;
  onAdd: () => void;
  onDelete: () => void;
  onSpeed: (speed: number) => void;
  onNote: (note: string, history: boolean) => void;
  onScrubStart: () => void;
  onScrub: (value: number) => void;
  onScrubEnd: (value: number) => void;
}) {
  const max = Math.max(frames.length - 1, 0);
  const noteArmed = useRef(false);
  return (
    <footer className="timeline">
      <div className="transport">
        <button type="button" className="play" onClick={onPlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <label className="speed">
          <span>Speed</span>
          <select value={speed} onChange={(event) => onSpeed(Number(event.target.value))}>
            {SPEEDS.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="frames">
        <div className="film">
          {frames.map((frame, index) => (
            <button
              key={frame.id}
              type="button"
              className={frame.id === activeId || (playing && Math.round(liveIndex) === index) ? "frame on" : "frame"}
              onClick={() => onSelect(frame.id)}
            >
              <Thumb tokens={frame.tokens} />
              <span>
                {index + 1}
                {frame.note ? ` · ${frame.note}` : ""}
              </span>
            </button>
          ))}
        </div>
        <input
          className="scrub"
          type="range"
          min={0}
          max={max}
          step={0.01}
          value={Math.min(liveIndex, max)}
          aria-label="Scrub animation"
          onPointerDown={onScrubStart}
          onChange={(event) => onScrub(Number(event.target.value))}
          onPointerUp={(event) => onScrubEnd(Number((event.target as HTMLInputElement).value))}
        />
      </div>
      <div className="frame-edit">
        <label>
          <span>Keyframe note</span>
          <input
            value={note}
            onChange={(event) => {
              const history = !noteArmed.current;
              noteArmed.current = true;
              onNote(event.target.value, history);
            }}
            onBlur={() => {
              noteArmed.current = false;
            }}
          />
        </label>
        <button type="button" onClick={onAdd}>
          <Plus size={14} /> Keyframe
        </button>
        <button type="button" onClick={onDelete} aria-label="Delete keyframe">
          <Trash2 size={14} />
        </button>
      </div>
    </footer>
  );
}

function Thumb({ tokens }: { tokens: Token[] }) {
  return (
    <span className="thumb" aria-hidden="true">
      {tokens
        .filter((token) => token.kind === "player" || token.kind === "gk" || token.kind === "ball")
        .map((token) => (
          <i
            key={token.id}
            className={token.kind === "ball" ? "ball" : token.team === "away" ? "away" : "home"}
            style={{ left: `${token.x}%`, top: `${token.y}%` }}
          />
        ))}
    </span>
  );
}

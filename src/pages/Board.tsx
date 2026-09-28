import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Inspector } from "../components/Inspector";
import { Pitch } from "../components/Pitch";
import { Timeline } from "../components/Timeline";
import { Toolbar } from "../components/Toolbar";
import { TopBar } from "../components/TopBar";
import { ZONES } from "../data/scaffolding";
import { sampleFrame } from "../lib/animate";
import { decodeSession } from "../lib/share";
import { useEditor } from "../store/editor";
import type { PitchView, Tier } from "../types";

const VIEWS: { id: PitchView; label: string }[] = [
  { id: "full", label: "Full" },
  { id: "half", label: "Att. half" },
  { id: "box", label: "Box" },
  { id: "thirds", label: "Thirds" },
  { id: "channels", label: "Channels" },
];

export function BoardPage() {
  const editor = useEditor();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [playT, setPlayT] = useState(0);
  const [speed, setSpeed] = useState(0.8);
  const boot = useRef(false);
  const editorRef = useRef(editor);
  const nudging = useRef(false);
  editorRef.current = editor;

  useEffect(() => {
    if (boot.current) return;
    boot.current = true;
    const shared = params.get("d");
    const sample = params.get("sample");
    if (shared) {
      decodeSession(shared)
        .then((session) => {
          editorRef.current.replaceSession(session, "Shared session opened.");
          navigate("/board", { replace: true });
        })
        .catch(() => editorRef.current.setNotice("Could not open that shared session."));
      return;
    }
    if (sample === "C" || sample === "B" || sample === "A") {
      editorRef.current.loadSample(sample);
      navigate("/board", { replace: true });
    }
  }, [navigate, params]);

  const phaseId = editor.phase.id;
  const [playbackPhase, setPlaybackPhase] = useState(phaseId);
  if (playbackPhase !== phaseId) {
    setPlaybackPhase(phaseId);
    setPlaying(false);
    setScrubbing(false);
  }

  useEffect(() => {
    if (!playing) return;
    let frameId = 0;
    let last = performance.now();
    const frames = editor.phase.frames;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      let finished = false;
      setPlayT((prev) => {
        const next = prev + dt * speed;
        if (next >= frames.length - 1) {
          finished = true;
          return frames.length - 1;
        }
        return next;
      });
      if (finished) {
        setPlaying(false);
        editorRef.current.setActiveFrame(frames[frames.length - 1].id);
        return;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [playing, speed, editor.phase.id, editor.phase.frames]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)
      ) {
        return;
      }
      const api = editorRef.current;
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) api.redo();
        else api.undo();
        return;
      }
      if (event.key === " ") {
        event.preventDefault();
        togglePlay();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (api.selectedId && api.selectedKind) {
          event.preventDefault();
          api.erase(api.selectedId, api.selectedKind);
        }
        return;
      }
      const nudge: Record<string, [number, number]> = {
        arrowleft: [-0.7, 0],
        arrowright: [0.7, 0],
        arrowup: [0, -0.7],
        arrowdown: [0, 0.7],
      };
      const delta = nudge[key];
      if (!delta) return;
      event.preventDefault();
      if (!nudging.current) {
        api.checkpoint();
        nudging.current = true;
      }
      api.nudge(delta[0], delta[1]);
    };
    const onUp = () => {
      nudging.current = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const frameIndex = Math.max(
    0,
    editor.phase.frames.findIndex((frame) => frame.id === editor.frame.id),
  );
  const t = playing || scrubbing ? playT : frameIndex;
  const sampled = sampleFrame(editor.phase.frames, t);
  const pictured = { ...editor.frame, tokens: sampled.tokens, strokes: sampled.strokes };
  const zone = ZONES.find((item) => item.id === editor.phase.zone)?.label ?? "Pitch";

  function togglePlay() {
    if (editorRef.current.phase.frames.length < 2) {
      editorRef.current.setNotice("Add a second keyframe to animate the picture.");
      return;
    }
    setScrubbing(false);
    setPlaying((current) => {
      if (current) return false;
      const frames = editorRef.current.phase.frames;
      const index = frames.findIndex((frame) => frame.id === editorRef.current.frame.id);
      setPlayT(index >= frames.length - 1 ? 0 : Math.max(index, 0));
      return true;
    });
  }

  return (
    <div className="board-shell">
      <TopBar />
      <Toolbar
        tool={editor.tool}
        tier={editor.session.tier as Tier}
        drawTeam={editor.drawTeam}
        disabled={playing}
        onTool={editor.setTool}
        onDrawTeam={editor.setDrawTeam}
        onFormation={(name) => editor.applyFormation(editor.drawTeam, name)}
        onSuggest={editor.suggest}
        onClearStrokes={editor.clearStrokes}
        onClearEquipment={editor.clearEquipment}
      />
      <div className="stage">
        <div className="stage-bar">
          <div className="views" role="group" aria-label="Pitch view">
            {VIEWS.map((view) => (
              <button key={view.id} type="button" aria-pressed={editor.pitchView === view.id} onClick={() => editor.setPitchView(view.id)}>
                {view.label}
              </button>
            ))}
          </div>
          <div className="views">
            <button type="button" aria-pressed={editor.grid} onClick={editor.toggleGrid}>
              Grid
            </button>
            <button type="button" aria-pressed={editor.onion} onClick={editor.toggleOnion}>
              Onion
            </button>
            <button type="button" aria-pressed={editor.areaOverlay} onClick={editor.toggleArea}>
              Area
            </button>
          </div>
        </div>
        <Pitch
          frame={pictured}
          onion={editor.onion && !playing && !scrubbing ? editor.phase.frames[frameIndex - 1] : null}
          view={editor.pitchView}
          tool={playing ? "select" : editor.tool}
          selectedId={playing ? null : editor.selectedId}
          showGrid={editor.grid}
          showArea={editor.areaOverlay}
          lengthM={editor.phase.lengthM}
          widthM={editor.phase.widthM}
          zone={editor.phase.zone}
          drawTeam={editor.drawTeam}
          readOnly={playing}
          onSelect={editor.select}
          onCheckpoint={editor.checkpoint}
          onPatchToken={(id, partial) => editor.patchToken(id, partial, false)}
          onPlace={editor.placeAt}
          onStroke={editor.addStroke}
          onErase={editor.erase}
        />
        <div className="pitch-caption">
          <span>
            {zone} · {editor.phase.lengthM}×{editor.phase.widthM} m
          </span>
          <span className="legend">
            <i className="home" /> Home
            <i className="away" /> Opp
            <i className="ball" /> Ball
          </span>
          <button type="button" className="text-btn" onClick={editor.applySquadToFrame} disabled={playing}>
            Use {editor.activeSeason.season || "squad"} names
          </button>
          <span>Home attacks →</span>
        </div>
        {pictured.tokens.length === 0 && !playing && (
          <p className="pitch-hint">Pick a shape in the rail, or choose Home and click the pitch. Players wear the season squad.</p>
        )}
      </div>
      <Timeline
        frames={editor.phase.frames}
        activeId={editor.frame.id}
        liveIndex={t}
        playing={playing}
        speed={speed}
        note={editor.frame.note}
        onSelect={(id) => {
          setPlaying(false);
          setScrubbing(false);
          editor.setActiveFrame(id);
        }}
        onPlay={togglePlay}
        onAdd={() => {
          setPlaying(false);
          editor.addFrame();
        }}
        onDelete={() => {
          setPlaying(false);
          editor.deleteFrame();
        }}
        onSpeed={setSpeed}
        onNote={(note, history) => editor.patchFrame({ note }, history)}
        onScrubStart={() => {
          setPlaying(false);
          setScrubbing(true);
          setPlayT(frameIndex);
        }}
        onScrub={setPlayT}
        onScrubEnd={(value) => {
          const index = Math.round(value);
          const frame = editor.phase.frames[index];
          setScrubbing(false);
          setPlayT(index);
          if (frame) editor.setActiveFrame(frame.id);
        }}
      />
      <Inspector />
      {editor.panelOpen && (
        <button type="button" className="inspector-back" aria-label="Close details" onClick={() => editor.setPanelOpen(false)} />
      )}
      {editor.notice && (
        <div className="toast" role="status">
          {editor.notice}
        </div>
      )}
    </div>
  );
}

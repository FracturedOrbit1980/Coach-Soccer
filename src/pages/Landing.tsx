import { Map, MessageCircle, PersonStanding, Waypoints } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Mark } from "../components/Mark";
import { Pitch } from "../components/Pitch";
import { PILLARS, SCAFFOLDS } from "../data/scaffolding";
import { createSample } from "../data/samples";
import { sampleFrame } from "../lib/animate";
import { useEditor } from "../store/editor";
import type { Tier } from "../types";

const ICONS = [MessageCircle, Map, PersonStanding, Waypoints];

export function Landing() {
  const editor = useEditor();
  const demo = useMemo(() => createSample("B"), []);
  const phase = demo.phases.find((item) => item.frames.length > 1) ?? demo.phases[0];
  const [t, setT] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!document.hidden) {
        setT((value) => {
          const next = value + dt * 0.55;
          return next >= phase.frames.length - 1 ? 0 : next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase.frames.length]);

  const pictured = sampleFrame(phase.frames, t);
  const frame = { ...phase.frames[0], tokens: pictured.tokens, strokes: pictured.strokes };

  return (
    <div className="landing">
      <header className="nav">
        <Link to="/" className="brand">
          <Mark />
          <span>
            <strong>SFA Tactics</strong>
            <small>Coach education</small>
          </span>
        </Link>
        <nav>
          <a href="#tiers">Licences</a>
          <a href="#pillars">Four pillars</a>
          <Link to="/board">Open board</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Scottish FA · UEFA C, B, and A</p>
          <h1>The session, drawn the way the game is taught.</h1>
          <p className="lede">
            A tactical board for coach education. Place the picture, animate the trigger, and check the plan against the four pillars before you walk out to the pitch.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/board">
              Continue in the board
            </Link>
            <Link className="btn ghost" to="/sheet">
              Open the session sheet
            </Link>
          </div>
          <p className="continue">On this browser: {editor.session.title}</p>
        </div>
        <div className="hero-stage">
          <div className="hero-pitch">
            <Pitch
              frame={frame}
              view="thirds"
              tool="select"
              selectedId={null}
              showGrid={false}
              showArea
              lengthM={phase.lengthM}
              widthM={phase.widthM}
              zone={phase.zone}
              readOnly
            />
          </div>
          <div className="hero-caption">
            <span>UEFA B sample</span>
            <strong>Jump the pivot</strong>
            <span>Press space on the board to play it yourself.</span>
          </div>
        </div>
      </section>

      <section className="band" id="pillars">
        {PILLARS.map((pillar, index) => {
          const Icon = ICONS[index];
          return (
            <article key={pillar.id}>
              <Icon size={18} />
              <h2>{pillar.title}</h2>
              <p>{pillar.copy}</p>
            </article>
          );
        })}
      </section>

      <section className="tiers" id="tiers">
        <div className="section-head">
          <p className="eyebrow">Dynamic scaffolding</p>
          <h2>The licence changes the board, not just the badge.</h2>
        </div>
        <div className="tier-grid">
          {(["C", "B", "A"] as Tier[]).map((tier) => {
            const scaffold = SCAFFOLDS[tier];
            return (
              <article key={tier} className={`tier-card tier-${tier.toLowerCase()}`}>
                <p>UEFA {tier}</p>
                <h3>{scaffold.headline}</h3>
                <p>{scaffold.summary}</p>
                <ul>
                  {scaffold.focus.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link to={`/board?sample=${tier}`}>Open the {scaffold.name} sample</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="split-feature">
        <article>
          <p className="eyebrow">Animation studio</p>
          <h2>Keyframes, not a video editor.</h2>
          <p>
            Record the start picture, the trigger, and the outcome. Scrub the timeline, change the speed, and keep an onion-skin of the previous frame so the run is honest.
          </p>
        </article>
        <article>
          <p className="eyebrow">Session plan</p>
          <h2>A sheet you can print.</h2>
          <p>
            Phases, area, coaching points, guided questions, and the opponent model sit beside the pitch. Export JSON, copy a share link, or print the session sheet.
          </p>
        </article>
        <article>
          <p className="eyebrow">Opponent read</p>
          <h2>Suggest the press.</h2>
          <p>
            UEFA C steps the nearest two in. UEFA B curves a unit of three. UEFA A jumps the line and narrows the rest. It adds a keyframe you can edit, not a black box.
          </p>
        </article>
      </section>

      <footer className="site-footer">
        <p>
          An independent coaching tool organised around the Scottish FA four-pillar model and UEFA licence themes. Not an official Scottish FA or UEFA product.
        </p>
        <Link to="/board">Start from the current board</Link>
      </footer>
    </div>
  );
}

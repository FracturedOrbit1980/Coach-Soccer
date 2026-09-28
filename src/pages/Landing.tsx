import { Map, MessageCircle, PersonStanding, Waypoints } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Mark } from "../components/Mark";
import { Pitch } from "../components/Pitch";
import { FORMATS, PILLARS, SCAFFOLDS } from "../data/scaffolding";
import { createSample } from "../data/samples";
import { sampleFrame } from "../lib/animate";
import { useEditor } from "../store/editor";

const ICONS = [MessageCircle, Map, PersonStanding, Waypoints];

export function Landing() {
  const editor = useEditor();
  const demo = useMemo(() => createSample("7"), []);
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
            <strong>Sportfika</strong>
            <small>Tactics board</small>
          </span>
        </Link>
        <nav>
          <a href="#formats">Formats</a>
          <a href="#session">The session</a>
          <Link to="/squad" className="nav-keep">Squad</Link>
          <Link to="/clients" className="nav-keep">Clients</Link>
          <Link to="/board" className="nav-keep">Open board</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Grassroots to GDL and pro</p>
          <h1>The session, drawn the way your team plays.</h1>
          <p className="lede">
            Sportfika is a tactics board for 5-a-side, 7-a-side, 9-a-side, and 11-a-side. Place the mannequins, turn the mini goals, and keep the squad’s names from the first grassroots age through to GDL and pro.
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
            <span>7-a-side sample</span>
            <strong>Jump the pivot</strong>
            <span>Press space on the board to play it yourself.</span>
          </div>
        </div>
      </section>

      <section className="band" id="session">
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

      <section className="tiers" id="formats">
        <div className="section-head">
          <p className="eyebrow">Age and numbers</p>
          <h2>Five, seven, nine, or eleven. Grassroots through to GDL and pro.</h2>
        </div>
        <div className="tier-grid">
          {FORMATS.map((format) => {
            const scaffold = SCAFFOLDS[format];
            return (
              <article key={format} className={`tier-card format-${format}`}>
                <p>{scaffold.name}</p>
                <h3>{scaffold.headline}</h3>
                <p>{scaffold.summary}</p>
                <ul>
                  {scaffold.focus.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link to={`/board?sample=${format}`}>Open the {scaffold.name} sample</Link>
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
          <p className="eyebrow">Season squad</p>
          <h2>Names that survive the next drill.</h2>
          <p>
            Keep a team sheet for the season. Drop a shape or place a home mannequin and the shirt number and surname come with it. Change the sheet once and the open picture follows.
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
            5-a-side and 7-a-side step the nearest two in. 9-a-side curves a unit of three. 11-a-side jumps the line and narrows the rest. It adds a keyframe you can edit.
          </p>
        </article>
      </section>

      <footer className="site-footer">
        <p>
          Sportfika keeps the squad, the pictures, and the session on this browser. From the first grassroots age group to GDL and pro.
        </p>
        <Link to="/board">Start from the current board</Link>
      </footer>
    </div>
  );
}

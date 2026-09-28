import { ClipboardList, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Mark } from "../components/Mark";
import { Pitch } from "../components/Pitch";
import { FORMATS, SCAFFOLDS } from "../data/scaffolding";
import { createSample } from "../data/samples";
import { sampleFrame } from "../lib/animate";
import { useEditor } from "../store/editor";

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
            <strong>Sportfica</strong>
            <small>Tactics & Player Hub</small>
          </span>
        </Link>
        <nav>
          <a href="#roles">Choose Role</a>
          <a href="#formats">Formats</a>
          <Link to="/board" className="nav-keep">Tactics Board</Link>
          <Link to="/clients" className="nav-keep">Player Profiles</Link>
          <Link to="/squad" className="nav-keep">Squad</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Grassroots · Academy · GDL · Pro</p>
          <h1>Tactics made simple. Player growth made clear.</h1>
          <p className="lede">
            Sportfica brings session design and player development together. Fast animated drill building for coaches; direct role feedback and ball mastery for players.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/board">
              Open Tactics Board
            </Link>
            <Link className="btn ghost" to="/clients">
              Player Profiles & Feedback
            </Link>
          </div>
          <p className="continue">Active session: <strong>{editor.session.title}</strong></p>
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
            <span>7-a-side build-up</span>
            <strong>2-3-1 Pivot Animation</strong>
            <span>Press space on board to play.</span>
          </div>
        </div>
      </section>

      {/* CLEAR ROLE DEFINITIONS: COACH vs PLAYER */}
      <section className="role-selector-section" id="roles">
        <div className="section-head text-center">
          <p className="eyebrow">Select Your Role</p>
          <h2>Coach or Player</h2>
          <p className="role-intro-sub">Two distinct sides of Sportfica engineered for your responsibilities.</p>
        </div>

        <div className="role-split-grid">
          {/* COACH ROLE CARD */}
          <div className="role-card coach-portal">
            <div className="role-card-badge">Coach Portal</div>
            <div className="role-card-icon">
              <ClipboardList size={28} />
            </div>
            <h3>Coach</h3>
            <p className="role-summary">
              Responsible for training sessions, tactical drills, and individual player feedback and development.
            </p>
            <ul className="role-duties">
              <li><strong>Assemble Training Sessions:</strong> Quick drill builder with pre-populated animated library across 5s, 7s, 9s, and 11s.</li>
              <li><strong>Player Feedback & IDP:</strong> Provide direct positive feedback and constructive development areas per player.</li>
              <li><strong>Tactical Drills & Rotation:</strong> Place lifelike mannequins, rotate mini goals, and animate triggers.</li>
              <li><strong>Season Squad Sheet:</strong> Maintain shirt numbers, positions, and rosters that carry directly into drills.</li>
            </ul>
            <div className="role-cta">
              <Link to="/board" className="btn primary full-w">
                Open Coach Board
              </Link>
            </div>
          </div>

          {/* PLAYER ROLE CARD */}
          <div className="role-card player-portal">
            <div className="role-card-badge">Player Portal</div>
            <div className="role-card-icon">
              <User size={28} />
            </div>
            <h3>Player</h3>
            <p className="role-summary">
              Views coach feedback and suggested drills to improve role and position (positive and constructive).
            </p>
            <ul className="role-duties">
              <li><strong>Role & Position Feedback:</strong> View what you do well (positives) and constructive areas to improve.</li>
              <li><strong>Suggested Drills:</strong> Access drill recommendations from your coach tailored to your position.</li>
              <li><strong>1-Person Ball Mastery:</strong> Practice solo drills for dribbling, turning, moves to beat, and juggling.</li>
              <li><strong>Competency Progress:</strong> Radar development chart and milestone tracking over time.</li>
            </ul>
            <div className="role-cta">
              <Link to="/clients" className="btn ghost full-w">
                Open Player Profiles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Formats Grid: 5s, 7s, 9s, 11s */}
      <section className="tiers" id="formats">
        <div className="section-head">
          <p className="eyebrow">Age & Pitch Numbers</p>
          <h2>5s, 7s, 9s, and 11s. Grassroots through to GDL and pro.</h2>
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
                <Link to={`/board?sample=${format}`}>Open {scaffold.name} sample</Link>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="site-footer">
        <p>
          Sportfica · Tactical session builder & individual player development hub.
        </p>
        <div className="footer-links">
          <Link to="/board">Tactics Board</Link>
          <Link to="/clients">Player Profiles</Link>
          <Link to="/squad">Season Squad</Link>
        </div>
      </footer>
    </div>
  );
}

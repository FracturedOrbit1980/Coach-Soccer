import { Link } from "react-router-dom";
import { Mark } from "../components/Mark";
import { Pitch } from "../components/Pitch";
import { FOCUS, MOMENTS, PHASE_META, ZONES } from "../data/scaffolding";
import { validate } from "../lib/validate";
import { useEditor } from "../store/editor";

export function SheetPage() {
  const { session } = useEditor();
  const report = validate(session);
  const moment = MOMENTS.find((item) => item.id === session.moment)?.label ?? session.moment;

  return (
    <div className="sheet-page">
      <div className="sheet-toolbar no-print">
        <Link to="/board">Back to the board</Link>
        <button type="button" onClick={() => window.print()}>
          Print / save as PDF
        </button>
      </div>
      <article className="sheet">
        <header className="sheet-head">
          <Mark size={36} />
          <div>
            <p>Sportfica · {session.tier}-a-side · {session.ageGroup}</p>
            <h1>{session.title}</h1>
          </div>
          <div className="sheet-score">
            Method {report.score}/{report.max}
          </div>
        </header>
        <dl className="sheet-meta">
          <div>
            <dt>Age</dt>
            <dd>{session.ageGroup}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{session.duration} minutes</dd>
          </div>
          <div>
            <dt>Moment</dt>
            <dd>{moment}</dd>
          </div>
          <div>
            <dt>Theme</dt>
            <dd>{session.theme || "—"}</dd>
          </div>
        </dl>
        <p className="sheet-principle">{session.principle || "Add a principle on the board."}</p>
        <section className="sheet-grid">
          {(["what", "where", "who", "when", "why"] as const).map((key) => (
            <div key={key}>
              <h2>{key}</h2>
              <p>{session[key] || "—"}</p>
            </div>
          ))}
        </section>
        <section className="sheet-grid two">
          <div>
            <h2>The player</h2>
            <p>{session.playerFocus.map((id) => FOCUS.find((item) => item.id === id)?.label ?? id).join(" · ") || "—"}</p>
          </div>
          <div>
            <h2>Intervention</h2>
            <p>{session.interventionStyles.join(" · ") || "—"}</p>
          </div>
          <div>
            <h2>Coach</h2>
            <p>{session.coachBehaviours.join(" · ") || "—"}</p>
          </div>
          <div>
            <h2>Environment</h2>
            <p>{session.environment || "—"}</p>
          </div>
        </section>
        <section>
          <h2>Opponent</h2>
          <p>
            {session.opponent.shape || "Shape not set"}. {session.opponent.buildUp} Trigger: {session.opponent.pressTrigger || "—"}. Weakness:{" "}
            {session.opponent.weakness || "—"}.
          </p>
        </section>
        {session.phases.map((phase, index) => {
          const picture = phase.frames[phase.frames.length - 1];
          const zone = ZONES.find((item) => item.id === phase.zone)?.label ?? phase.zone;
          return (
            <section key={phase.id} className="phase-block">
              <header>
                <h2>
                  {index + 1}. {phase.title || PHASE_META[phase.type].label}
                </h2>
                <p>
                  {PHASE_META[phase.type].label} · {phase.minutes}′ · {phase.lengthM}×{phase.widthM} m · {zone}
                </p>
              </header>
              <div className="sheet-pitch">
                <Pitch
                  frame={picture}
                  view="full"
                  tool="select"
                  selectedId={null}
                  showGrid={false}
                  showArea={phase.zone !== "full"}
                  lengthM={phase.lengthM}
                  widthM={phase.widthM}
                  zone={phase.zone}
                  readOnly
                />
              </div>
              {phase.organisation && <p>{phase.organisation}</p>}
              {phase.coachingPoints.filter(Boolean).length > 0 && (
                <>
                  <h3>Coaching points</h3>
                  <ul>
                    {phase.coachingPoints.filter(Boolean).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </>
              )}
              {phase.questions.filter(Boolean).length > 0 && (
                <>
                  <h3>Questions</h3>
                  <ul>
                    {phase.questions.filter(Boolean).map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          );
        })}
      </article>
    </div>
  );
}

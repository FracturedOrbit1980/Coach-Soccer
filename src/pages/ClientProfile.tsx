import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RadarChart } from "../components/RadarChart";
import { Mark } from "../components/Mark";
import { BALL_MASTERY_SKILLS } from "../data/ballMastery";
import { TEMPLATES } from "../data/competencies";
import { roleLabel } from "../lib/clients";
import { useEditor } from "../store/editor";

export function ClientProfilePage() {
  const { clientId } = useParams();
  const editor = useEditor();
  const navigate = useNavigate();
  const client = editor.clients.find((item) => item.id === clientId);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [compare, setCompare] = useState(true);
  const [axis, setAxis] = useState("");
  const [masteryTab, setMasteryTab] = useState<"dribbling" | "turning" | "moves" | "juggling">("dribbling");

  if (!client) {
    return (
      <div className="clients-page">
        <main className="clients-wrap">
          <h1>Player Profile not found</h1>
          <p className="hint">This profile may have been removed or created in a different browser session.</p>
          <Link to="/clients" className="btn primary">Back to Player Profiles</Link>
        </main>
      </div>
    );
  }

  const selected = client.reviews.find((review) => review.id === reviewId) ?? client.reviews[0];
  const selectedIndex = client.reviews.findIndex((review) => review.id === selected?.id);
  const previous = compare && selectedIndex >= 0 ? client.reviews[selectedIndex + 1] : undefined;
  const sessions = editor.library.filter((entry) => entry.clientId === client.id || entry.session.clientId === client.id);
  const activeId = client.id;
  const idp = client.individualDevelopment ?? {
    strengths: "",
    growthAreas: "",
    targetMilestone: "",
    insights: "",
    ballMastery: { dribbling: 5, turning: 5, movesToBeat: 5, juggling: 5, firstTouch: 5, weakFoot: 5 },
    completedSkillIds: [],
  };

  function setScore(competencyId: string, value: number) {
    if (!selected) return;
    editor.updateReview(activeId, selected.id, {
      scores: { ...selected.scores, [competencyId]: value },
    });
  }

  function setMasteryScore(key: keyof typeof idp.ballMastery, value: number) {
    editor.updateIndividualDevelopment(activeId, (prev) => ({
      ...prev,
      ballMastery: {
        ...prev.ballMastery,
        [key]: value,
      },
    }));
  }

  const categorySkills = BALL_MASTERY_SKILLS.filter((s) => s.category === masteryTab);

  return (
    <div className="clients-page">
      <header className="nav">
        <Link to="/" className="brand">
          <Mark />
          <span>
            <strong>Sportfica</strong>
            <small>Player Profile · {roleLabel(editor.staffRole)}</small>
          </span>
        </Link>
        <nav>
          <Link to="/board" className="nav-keep">Board</Link>
          <Link to="/squad" className="nav-keep">Squad</Link>
          <Link to="/clients" className="nav-keep">Player Profiles</Link>
        </nav>
      </header>
      <main className="profile-layout">
        {/* Left Column: Radar Competency Graph & Ball Mastery Breakdown */}
        <section className="radar-card">
          <div className="profile-card-header">
            <div>
              <p className="eyebrow">Individual Development</p>
              <h2>{client.name}</h2>
              <span className="profile-subtitle">
                {[client.age && `Age ${client.age}`, client.club, client.position, client.dominantFoot && `${client.dominantFoot} foot`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
            <div className="profile-badge">Player Profile</div>
          </div>

          {selected ? (
            <RadarChart
              name={client.name}
              age={client.age}
              club={client.club}
              position={client.position}
              competencies={client.competencies}
              scores={selected.scores}
              previous={previous?.scores}
            />
          ) : (
            <p className="hint">Add a review to draw the chart.</p>
          )}

          <div className="radar-actions">
            <label className="check-line">
              <input type="checkbox" checked={compare} onChange={(event) => setCompare(event.target.checked)} />
              Show earlier review as dashed line
            </label>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                editor.addReview(client.id);
                setReviewId(null);
              }}
            >
              + New Competency Review
            </button>
          </div>

          {previous && selected && (
            <ul className="deltas">
              {client.competencies.map((item) => {
                const next = selected.scores[item.id] ?? 0;
                const before = previous.scores[item.id] ?? 0;
                const delta = next - before;
                if (Math.abs(delta) < 0.05) return null;
                return (
                  <li key={item.id}>
                    {item.label} {delta > 0 ? "+" : ""}
                    {delta.toFixed(1)}
                  </li>
                );
              })}
            </ul>
          )}

          {/* 1-PERSON BALL MASTERY CURRICULUM */}
          <div className="ball-mastery-section">
            <div className="row-between">
              <div>
                <h3>1-Person Ball Mastery & Technical Insights</h3>
                <p className="hint">Individual drills for solo development: dribbling, turning, moves to beat, and juggling.</p>
              </div>
            </div>

            {/* Quick Rating Sliders for 1-Person Mastery */}
            <div className="mastery-ratings-grid">
              {(
                [
                  { key: "dribbling", label: "Dribbling Speed & Control" },
                  { key: "turning", label: "Turning & Disguise" },
                  { key: "movesToBeat", label: "Moves to Beat Players" },
                  { key: "juggling", label: "Juggling & Aerial Control" },
                  { key: "firstTouch", label: "First Touch Precision" },
                  { key: "weakFoot", label: "Weak-Foot Execution" },
                ] as const
              ).map(({ key, label }) => (
                <label key={key} className="score-row compact">
                  <span>{label}</span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={idp.ballMastery[key] ?? 5}
                    onChange={(e) => setMasteryScore(key, Number(e.target.value))}
                  />
                  <b>{(idp.ballMastery[key] ?? 5).toFixed(1)}</b>
                </label>
              ))}
            </div>

            {/* Category tabs for skills */}
            <div className="mastery-cat-tabs" role="tablist">
              {(
                [
                  { id: "dribbling", label: "Dribbling" },
                  { id: "turning", label: "Turning" },
                  { id: "moves", label: "Moves to Beat" },
                  { id: "juggling", label: "Juggling" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={masteryTab === tab.id ? "tab-btn active" : "tab-btn"}
                  onClick={() => setMasteryTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Skill Cards for Selected Category */}
            <div className="skills-grid">
              {categorySkills.map((skill) => {
                const isCompleted = idp.completedSkillIds?.includes(skill.id);
                return (
                  <div key={skill.id} className={`skill-card ${isCompleted ? "mastered" : ""}`}>
                    <div className="row-between">
                      <strong>{skill.title}</strong>
                      <span className="skill-level">{skill.level}</span>
                    </div>
                    <p className="skill-desc">{skill.description}</p>
                    <p className="skill-benchmark">
                      <strong>Benchmark:</strong> {skill.targetBenchmark}
                    </p>
                    <ul className="skill-cues">
                      {skill.coachingCues.map((cue, i) => (
                        <li key={i}>{cue}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={`text-btn ${isCompleted ? "success" : ""}`}
                      onClick={() => editor.toggleSkillCompleted(client.id, skill.id)}
                    >
                      {isCompleted ? "✓ Logged as Practised" : "+ Mark as Practised"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Column: Player Profile Bio, IDP Notes, Reviews & Linked Sessions */}
        <section className="profile-side">
          {/* Distinction Banner: Player Profile vs Coach's Session Setup */}
          <div className="role-callout">
            <span className="role-tag">PLAYER PROFILE</span>
            <p>
              Dedicated individual profile for <strong>{client.name}</strong>. Track personal ball mastery, specific growth targets, and attach tailored training sessions.
            </p>
          </div>

          <div className="stack">
            <h2>Player Information</h2>
            <label className="field">
              <span>Player Full Name</span>
              <input value={client.name} onChange={(event) => editor.updateClient(client.id, { name: event.target.value })} />
            </label>
            <div className="split">
              <label className="field">
                <span>Age / Category</span>
                <input value={client.age} onChange={(event) => editor.updateClient(client.id, { age: event.target.value })} />
              </label>
              <label className="field">
                <span>Primary Position</span>
                <input value={client.position} onChange={(event) => editor.updateClient(client.id, { position: event.target.value })} />
              </label>
            </div>
            <div className="split">
              <label className="field">
                <span>Club / Academy</span>
                <input value={client.club} onChange={(event) => editor.updateClient(client.id, { club: event.target.value })} />
              </label>
              <label className="field">
                <span>Dominant Foot</span>
                <select
                  value={client.dominantFoot ?? "Right"}
                  onChange={(e) => editor.updateClient(client.id, { dominantFoot: e.target.value as "Right" | "Left" | "Both" })}
                >
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                  <option value="Both">Both</option>
                </select>
              </label>
            </div>
          </div>

          {/* Individual Development Plan & Insights */}
          <div className="stack">
            <h2>Individual Development & Insights</h2>
            <label className="field">
              <span>Key Strengths</span>
              <textarea
                rows={2}
                value={idp.strengths}
                placeholder="e.g. Explosive change of pace, low centre of gravity..."
                onChange={(e) => editor.updateIndividualDevelopment(client.id, { strengths: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Growth & Development Areas</span>
              <textarea
                rows={2}
                value={idp.growthAreas}
                placeholder="e.g. Disguise on inside cut, turning under back-pressure..."
                onChange={(e) => editor.updateIndividualDevelopment(client.id, { growthAreas: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Target Milestone</span>
              <input
                value={idp.targetMilestone}
                placeholder="e.g. 50 keep-ups, clean double scissors at match-speed..."
                onChange={(e) => editor.updateIndividualDevelopment(client.id, { targetMilestone: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Coach Insights & Homework</span>
              <textarea
                rows={3}
                value={idp.insights}
                placeholder="Specific 1-person ball mastery homework, video review notes, drill recommendations..."
                onChange={(e) => editor.updateIndividualDevelopment(client.id, { insights: e.target.value })}
              />
            </label>
            <label className="field">
              <span>General Player Notes</span>
              <textarea
                rows={2}
                value={client.notes}
                placeholder="Physical notes, attendance, motivation..."
                onChange={(event) => editor.updateClient(client.id, { notes: event.target.value })}
              />
            </label>
          </div>

          {/* Reviews List & Slider Editing */}
          <div className="stack">
            <div className="row-between">
              <h2>Competency Reviews ({client.reviews.length})</h2>
            </div>
            {client.reviews.map((review) => (
              <button
                key={review.id}
                type="button"
                className={review.id === selected?.id ? "phase-chip on" : "phase-chip"}
                onClick={() => setReviewId(review.id)}
              >
                <span>{review.date}</span>
                <span>{review.note || "Review"}</span>
              </button>
            ))}
            {selected && (
              <>
                <label className="field">
                  <span>Review Date</span>
                  <input type="date" value={selected.date} onChange={(event) => editor.updateReview(client.id, selected.id, { date: event.target.value })} />
                </label>
                <label className="field">
                  <span>Development Note</span>
                  <input value={selected.note} onChange={(event) => editor.updateReview(client.id, selected.id, { note: event.target.value })} />
                </label>
                {client.competencies.map((item) => (
                  <label key={item.id} className="score-row">
                    <span>{item.label}</span>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={selected.scores[item.id] ?? 0}
                      onChange={(event) => setScore(item.id, Number(event.target.value))}
                    />
                    <b>{(selected.scores[item.id] ?? 0).toFixed(1)}</b>
                  </label>
                ))}
                {client.reviews.length > 1 && (
                  <button type="button" className="text-btn danger" onClick={() => editor.deleteReview(client.id, selected.id)}>
                    Delete this review
                  </button>
                )}
              </>
            )}
          </div>

          {/* Radar Chart Axes Presets */}
          <div className="stack">
            <h2>Chart Templates</h2>
            <div className="chips">
              {TEMPLATES.map((template) => (
                <button key={template.id} type="button" onClick={() => editor.applyTemplate(client.id, template.id)}>
                  {template.label}
                </button>
              ))}
            </div>
            {client.competencies.map((item) => (
              <div key={item.id} className="string-row">
                <input
                  value={item.label}
                  aria-label="Competency name"
                  onChange={(event) => editor.renameCompetency(client.id, item.id, event.target.value)}
                />
                <button type="button" className="icon-btn" aria-label="Remove competency" onClick={() => editor.removeCompetency(client.id, item.id)}>
                  ×
                </button>
              </div>
            ))}
            <form
              className="string-row"
              onSubmit={(event) => {
                event.preventDefault();
                if (!axis.trim()) return;
                editor.addCompetency(client.id, axis);
                setAxis("");
              }}
            >
              <input value={axis} onChange={(event) => setAxis(event.target.value)} placeholder="Add a custom competency" />
              <button className="text-btn" type="submit">Add</button>
            </form>
          </div>

          {/* Linked Coach's Training Sessions */}
          <div className="stack">
            <div className="row-between">
              <h2>Attached Training Sessions</h2>
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  editor.newSessionForClient(client.id);
                  navigate("/board");
                }}
              >
                + New Drill for {client.name.split(" ")[0]}
              </button>
            </div>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                editor.assignClient(client.id);
                editor.saveLibrary();
              }}
            >
              Save Active Board to {client.name}
            </button>
            {sessions.length === 0 && <p className="hint">No training sessions attached to this player yet.</p>}
            {sessions.map((entry) => (
              <div key={entry.id} className="library-row">
                <button
                  type="button"
                  onClick={() => {
                    editor.loadLibrary(entry.id);
                    navigate("/board");
                  }}
                >
                  <b>{entry.name}</b>
                  <small>
                    {new Date(entry.updatedAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {entry.savedBy ? ` · ${roleLabel(entry.savedBy)}` : ""}
                  </small>
                </button>
                <button type="button" className="text-btn danger" onClick={() => editor.deleteLibrary(entry.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="text-btn danger"
            onClick={() => {
              if (window.confirm(`Remove player profile for ${client.name}?`)) {
                editor.deleteClient(client.id);
                navigate("/clients");
              }
            }}
          >
            Delete Player Profile
          </button>
        </section>
      </main>
    </div>
  );
}

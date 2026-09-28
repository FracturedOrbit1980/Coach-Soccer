import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RadarChart } from "../components/RadarChart";
import { Mark } from "../components/Mark";
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

  if (!client) {
    return (
      <div className="clients-page">
        <main className="clients-wrap">
          <h1>Client not on this browser</h1>
          <Link to="/clients">Back to clients</Link>
        </main>
      </div>
    );
  }

  const selected = client.reviews.find((review) => review.id === reviewId) ?? client.reviews[0];
  const selectedIndex = client.reviews.findIndex((review) => review.id === selected?.id);
  const previous = compare && selectedIndex >= 0 ? client.reviews[selectedIndex + 1] : undefined;
  const sessions = editor.library.filter((entry) => entry.clientId === client.id || entry.session.clientId === client.id);
  const activeId = client.id;

  function setScore(competencyId: string, value: number) {
    if (!selected) return;
    editor.updateReview(activeId, selected.id, {
      scores: { ...selected.scores, [competencyId]: value },
    });
  }

  return (
    <div className="clients-page">
      <header className="nav">
        <Link to="/" className="brand">
          <Mark />
          <span>
            <strong>SFA Tactics</strong>
            <small>{roleLabel(editor.staffRole)}</small>
          </span>
        </Link>
        <nav>
          <Link to="/clients" className="nav-keep">Clients</Link>
          <Link to="/board" className="nav-keep">Board</Link>
        </nav>
      </header>
      <main className="profile-layout">
        <section className="radar-card">
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
              Show the earlier review as a dashed line
            </label>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                editor.addReview(client.id);
                setReviewId(null);
              }}
            >
              New review
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
        </section>
        <section className="profile-side">
          <div className="stack">
            <label className="field">
              <span>Name</span>
              <input value={client.name} onChange={(event) => editor.updateClient(client.id, { name: event.target.value })} />
            </label>
            <div className="split">
              <label className="field">
                <span>Age</span>
                <input value={client.age} onChange={(event) => editor.updateClient(client.id, { age: event.target.value })} />
              </label>
              <label className="field">
                <span>Position</span>
                <input value={client.position} onChange={(event) => editor.updateClient(client.id, { position: event.target.value })} />
              </label>
            </div>
            <label className="field">
              <span>Club</span>
              <input value={client.club} onChange={(event) => editor.updateClient(client.id, { club: event.target.value })} />
            </label>
            <label className="field">
              <span>Notes</span>
              <textarea rows={3} value={client.notes} onChange={(event) => editor.updateClient(client.id, { notes: event.target.value })} />
            </label>
          </div>
          <div className="stack">
            <div className="row-between">
              <h2>Reviews</h2>
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
                  <span>Review date</span>
                  <input type="date" value={selected.date} onChange={(event) => editor.updateReview(client.id, selected.id, { date: event.target.value })} />
                </label>
                <label className="field">
                  <span>What changed</span>
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
          <div className="stack">
            <h2>Chart axes</h2>
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
              <input value={axis} onChange={(event) => setAxis(event.target.value)} placeholder="Add a competency" />
              <button className="text-btn" type="submit">Add</button>
            </form>
          </div>
          <div className="stack">
            <div className="row-between">
              <h2>Training sessions</h2>
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  editor.newSessionForClient(client.id);
                  navigate("/board");
                }}
              >
                New session
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
              Save the open board to {client.name}
            </button>
            {sessions.length === 0 && <p className="hint">No sessions saved under this name yet.</p>}
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
              if (window.confirm(`Remove ${client.name} from this browser?`)) {
                editor.deleteClient(client.id);
                navigate("/clients");
              }
            }}
          >
            Delete client
          </button>
        </section>
      </main>
    </div>
  );
}

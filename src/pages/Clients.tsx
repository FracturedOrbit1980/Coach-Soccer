import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mark } from "../components/Mark";
import { roleLabel } from "../lib/clients";
import { useEditor } from "../store/editor";
import type { StaffRole } from "../types";

export function ClientsPage() {
  const editor = useEditor();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [club, setClub] = useState("");
  const [position, setPosition] = useState("");
  const [dominantFoot, setDominantFoot] = useState<"Right" | "Left" | "Both">("Right");

  function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      editor.setNotice("Give the player a name before creating a profile.");
      return;
    }
    const id = editor.createClient({ name, age, club, position, dominantFoot });
    navigate(`/clients/${id}`);
  }

  return (
    <div className="clients-page">
      <header className="nav">
        <Link to="/" className="brand">
          <Mark />
          <span>
            <strong>Sportfica</strong>
            <small>Player Development</small>
          </span>
        </Link>
        <nav>
          <Link to="/board" className="nav-keep">Board</Link>
          <Link to="/squad" className="nav-keep">Squad</Link>
          <Link to="/clients" className="nav-keep">Player Profiles</Link>
        </nav>
      </header>
      <main className="clients-wrap">
        <div className="clients-intro">
          <p className="eyebrow">Individual Development & Competency Tracking</p>
          <h1>Player Profiles</h1>
          <p>
            Build individual player profiles distinct from team tactical setups. Track 1-person ball mastery (dribbling, turning, moves to beat, juggling), log developmental insights, and save targeted training sessions under each player's name.
          </p>
          <div className="tier-switch" role="group" aria-label="Who is viewing">
            {(["coach", "assistant"] as StaffRole[]).map((role) => (
              <button key={role} type="button" aria-pressed={editor.staffRole === role} onClick={() => editor.setStaffRole(role)}>
                {roleLabel(role)} Mode
              </button>
            ))}
          </div>
          <p className="hint">
            Signed in on this browser as {roleLabel(editor.staffRole)}. Individual player profiles are separate from team squad sheets.
          </p>
        </div>

        <form className="client-form" onSubmit={onCreate}>
          <h2>New Player Profile</h2>
          <label className="field">
            <span>Player Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Alex Reid" />
          </label>
          <div className="split">
            <label className="field">
              <span>Age / Category</span>
              <input value={age} onChange={(event) => setAge(event.target.value)} placeholder="e.g. U14 / 2012" />
            </label>
            <label className="field">
              <span>Primary Position</span>
              <input value={position} onChange={(event) => setPosition(event.target.value)} placeholder="e.g. Midfield / 8" />
            </label>
          </div>
          <div className="split">
            <label className="field">
              <span>Club / Academy</span>
              <input value={club} onChange={(event) => setClub(event.target.value)} placeholder="e.g. Sportfica Academy" />
            </label>
            <label className="field">
              <span>Dominant Foot</span>
              <select value={dominantFoot} onChange={(e) => setDominantFoot(e.target.value as "Right" | "Left" | "Both")}>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both (Ambidextrous)</option>
              </select>
            </label>
          </div>
          <button className="btn primary" type="submit">Create Player Profile</button>
        </form>

        <section className="client-list">
          {editor.clients.length === 0 && (
            <p className="hint">No player profiles created yet. Create a player profile above to start tracking individual development and ball mastery.</p>
          )}
          {editor.clients.map((client) => {
            const sessions = editor.library.filter((entry) => entry.clientId === client.id || entry.session.clientId === client.id);
            const latest = client.reviews[0];
            const completedCount = client.individualDevelopment?.completedSkillIds?.length ?? 0;
            return (
              <Link key={client.id} to={`/clients/${client.id}`} className="client-card">
                <div className="row-between">
                  <strong>{client.name}</strong>
                  {client.dominantFoot && <span className="pill-badge">{client.dominantFoot} foot</span>}
                </div>
                <span>{[client.age && `Age: ${client.age}`, client.club, client.position].filter(Boolean).join(" · ") || "Profile started"}</span>
                <small>
                  {sessions.length} training session{sessions.length === 1 ? "" : "s"} · {client.reviews.length} competency review{client.reviews.length === 1 ? "" : "s"}
                  {completedCount > 0 ? ` · ${completedCount} mastery skills logged` : ""}
                  {latest ? ` · Last: ${latest.date}` : ""}
                </small>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}

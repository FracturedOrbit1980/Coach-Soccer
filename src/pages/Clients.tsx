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

  function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      editor.setNotice("Give the client a name before saving.");
      return;
    }
    const id = editor.createClient({ name, age, club, position });
    navigate(`/clients/${id}`);
  }

  return (
    <div className="clients-page">
      <header className="nav">
        <Link to="/" className="brand">
          <Mark />
          <span>
            <strong>Sportfica</strong>
            <small>Coaching module</small>
          </span>
        </Link>
        <nav>
          <Link to="/board" className="nav-keep">Board</Link>
          <Link to="/squad" className="nav-keep">Squad</Link>
          <Link to="/clients" className="nav-keep">Clients</Link>
        </nav>
      </header>
      <main className="clients-wrap">
        <div className="clients-intro">
          <p className="eyebrow">Phase 1 · Coach and assistant coach</p>
          <h1>Client profiles</h1>
          <p>
            Build a profile for each player you coach. Save their training sessions under that name, and record a competency chart each time they develop.
          </p>
          <div className="tier-switch" role="group" aria-label="Who is working">
            {(["coach", "assistant"] as StaffRole[]).map((role) => (
              <button key={role} type="button" aria-pressed={editor.staffRole === role} onClick={() => editor.setStaffRole(role)}>
                {roleLabel(role)}
              </button>
            ))}
          </div>
          <p className="hint">You are signed in on this browser as {roleLabel(editor.staffRole)}. Player logins come later.</p>
        </div>
        <form className="client-form" onSubmit={onCreate}>
          <h2>New client</h2>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Player name" />
          </label>
          <div className="split">
            <label className="field">
              <span>Age</span>
              <input value={age} onChange={(event) => setAge(event.target.value)} placeholder="20" />
            </label>
            <label className="field">
              <span>Position</span>
              <input value={position} onChange={(event) => setPosition(event.target.value)} placeholder="Midfield" />
            </label>
          </div>
          <label className="field">
            <span>Club</span>
            <input value={club} onChange={(event) => setClub(event.target.value)} placeholder="Club or squad" />
          </label>
          <button className="btn primary" type="submit">Save client</button>
        </form>
        <section className="client-list">
          {editor.clients.length === 0 && <p className="hint">No clients yet. The first save stays on this browser.</p>}
          {editor.clients.map((client) => {
            const sessions = editor.library.filter((entry) => entry.clientId === client.id || entry.session.clientId === client.id);
            const latest = client.reviews[0];
            return (
              <Link key={client.id} to={`/clients/${client.id}`} className="client-card">
                <strong>{client.name}</strong>
                <span>{[client.age && `Age ${client.age}`, client.club, client.position].filter(Boolean).join(" · ") || "Profile started"}</span>
                <small>{sessions.length} saved session{sessions.length === 1 ? "" : "s"} · {client.reviews.length} review{client.reviews.length === 1 ? "" : "s"}{latest ? ` · ${latest.date}` : ""}</small>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}

import { Download, FolderOpen, PanelRight, Redo2, Save, Share2, Undo2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FORMATS, SCAFFOLDS } from "../data/scaffolding";
import { downloadSession, shareUrl } from "../lib/share";
import { normalizeSession } from "../lib/session";
import { validate } from "../lib/validate";
import { useEditor } from "../store/editor";
import { Mark } from "./Mark";

export function TopBar() {
  const editor = useEditor();
  const report = validate(editor.session);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleArmed = useRef(false);
  const [menu, setMenu] = useState<"file" | "library" | "help" | null>(null);
  const ratio = report.score / report.max;

  async function onShare() {
    try {
      const url = await shareUrl(editor.session);
      await navigator.clipboard.writeText(url);
      editor.setNotice("Share link copied. It opens this session on the published site.");
    } catch (error) {
      editor.setNotice(error instanceof Error ? error.message : "Could not copy a share link.");
    }
    setMenu(null);
  }

  async function onImport(file: File) {
    try {
      const data: unknown = JSON.parse(await file.text());
      const session = normalizeSession(data);
      if (!session) {
        editor.setNotice("That file is not a session from this board.");
        return;
      }
      editor.replaceSession(session);
    } catch {
      editor.setNotice("Could not read that JSON file.");
    }
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <Mark size={26} />
        <span>
          <strong>Sportfika</strong>
          <small>Tactics board</small>
        </span>
      </Link>
      <input
        className="title-input"
        aria-label="Session title"
        value={editor.session.title}
        onChange={(event) => {
          const history = !titleArmed.current;
          titleArmed.current = true;
          editor.patchSession({ title: event.target.value }, history);
        }}
        onBlur={() => {
          titleArmed.current = false;
        }}
      />
      <div className="tier-switch" role="group" aria-label="Game format">
        {FORMATS.map((tier) => (
          <button key={tier} type="button" aria-pressed={editor.session.tier === tier} onClick={() => editor.setTier(tier)}>
            {tier}s
          </button>
        ))}
      </div>
      <button
        type="button"
        className={`method-pill ${ratio === 1 ? "done" : ratio > 0.7 ? "mid" : ""}`}
        onClick={() => {
          editor.setInspectorTab("method");
          editor.setPanelOpen(true);
        }}
      >
        Method {report.score}/{report.max}
      </button>
      <select
        className="client-select"
        aria-label="Save this session under"
        value={editor.session.clientId ?? ""}
        onChange={(event) => editor.assignClient(event.target.value || null)}
      >
        <option value="">No client</option>
        {editor.clients.map((client) => (
          <option key={client.id} value={client.id}>{client.name}</option>
        ))}
      </select>
      <div className="top-actions">
        <button type="button" className="labelled" onClick={editor.saveLibrary}>
          <Save size={15} /> Save
        </button>
        <button type="button" aria-label="Undo" disabled={!editor.canUndo} onClick={editor.undo}>
          <Undo2 size={16} />
        </button>
        <button type="button" aria-label="Redo" disabled={!editor.canRedo} onClick={editor.redo}>
          <Redo2 size={16} />
        </button>
        <button type="button" className="labelled" onClick={onShare}>
          <Share2 size={15} /> Share
        </button>
        <button type="button" className="labelled" onClick={() => setMenu(menu === "file" ? null : "file")}>
          File
        </button>
        <Link to="/squad" className="labelled">Squad</Link>
        <Link to="/clients" className="labelled">Clients</Link>
        <button type="button" aria-label="Library" onClick={() => setMenu(menu === "library" ? null : "library")}>
          <FolderOpen size={16} />
        </button>
        <button type="button" className="panel-toggle" onClick={() => editor.setPanelOpen(!editor.panelOpen)}>
          <PanelRight size={16} /> Details
        </button>
      </div>
      {menu && <button type="button" className="menu-back" aria-label="Close menu" onClick={() => setMenu(null)} />}
      {menu === "file" && (
        <div className="menu" role="menu">
          <button type="button" onClick={() => { downloadSession(editor.session); setMenu(null); }}>
            <Download size={14} /> Export JSON
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}>
            <Upload size={14} /> Import JSON
          </button>
          <Link to="/sheet" onClick={() => setMenu(null)}>
            Session sheet
          </Link>
          <Link to="/squad" onClick={() => setMenu(null)}>
            Season team sheet
          </Link>
          <button type="button" onClick={() => { editor.newSession(); setMenu(null); }}>
            New blank session
          </button>
          {FORMATS.map((tier) => (
            <button key={tier} type="button" onClick={() => { editor.loadSample(tier); setMenu(null); }}>
              Load {SCAFFOLDS[tier].name} sample
            </button>
          ))}
          <button type="button" onClick={() => setMenu("help")}>
            Shortcuts
          </button>
        </div>
      )}
      {menu === "help" && (
        <div className="menu help" role="dialog" aria-label="Shortcuts">
          <p><kbd>Space</kbd> play or pause</p>
          <p><kbd>Delete</kbd> remove the selection</p>
          <p><kbd>Arrows</kbd> nudge a player</p>
          <p><kbd>Ctrl</kbd> <kbd>Z</kbd> undo</p>
          <p><kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Z</kbd> redo</p>
        </div>
      )}
      {menu === "library" && (
        <div className="menu library" role="dialog" aria-label="Saved sessions">
          <div className="row-between">
            <strong>On this browser</strong>
            <button type="button" className="text-btn" onClick={editor.saveLibrary}>
              Save current
            </button>
            <button type="button" className="text-btn" onClick={editor.saveCopy}>
              Save a copy
            </button>
          </div>
          {editor.library.length === 0 && <p className="hint">Nothing saved yet. The live board is kept automatically.</p>}
          {editor.library.map((entry) => (
            <div key={entry.id} className="library-row">
              <button type="button" onClick={() => { editor.loadLibrary(entry.id); setMenu(null); }}>
                <b>{entry.name}</b>
                <small>
                  {editor.clients.find((client) => client.id === (entry.clientId ?? entry.session.clientId))?.name ?? "No client"} · {SCAFFOLDS[entry.tier].name} · {new Date(entry.updatedAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </small>
              </button>
              <button type="button" className="text-btn danger" onClick={() => editor.deleteLibrary(entry.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onImport(file);
          event.target.value = "";
          setMenu(null);
        }}
      />
    </header>
  );
}

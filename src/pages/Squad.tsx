import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Mark } from "../components/Mark";
import { useEditor } from "../store/editor";

const POSITIONS = ["GK", "RB", "LB", "RCB", "LCB", "CB", "DM", "CM", "AM", "RW", "LW", "ST"];

export function SquadPage() {
  const editor = useEditor();
  const season = editor.activeSeason;
  const numbers = season.players.map((player) => player.number);
  const duplicate = numbers.some((number, index) => numbers.indexOf(number) !== index);

  return (
    <div className="clients-page">
      <header className="nav">
        <Link to="/" className="brand">
          <Mark />
          <span>
            <strong>SFA Tactics</strong>
            <small>Season squad</small>
          </span>
        </Link>
        <nav>
          <Link to="/board" className="nav-keep">Board</Link>
          <Link to="/clients" className="nav-keep">Clients</Link>
          <Link to="/squad" className="nav-keep">Squad</Link>
        </nav>
      </header>
      <main className="clients-wrap">
        <div className="clients-intro">
          <p className="eyebrow">Season team sheet</p>
          <h1>Numbers that stay with the drill.</h1>
          <p>
            Write the squad once for the season. Home mannequins on the board take those shirt numbers and names when you drop a shape, place a player, or apply the sheet to the picture in front of you.
          </p>
        </div>
        <div className="squad-layout">
          <section className="client-form squad-editor">
            <div className="split">
              <label className="field">
                <span>Sheet</span>
                <input
                  value={season.name}
                  aria-label="Team sheet name"
                  onChange={(event) => editor.updateSeason(season.id, { name: event.target.value })}
                />
              </label>
              <label className="field">
                <span>Season</span>
                <input
                  value={season.season}
                  aria-label="Season"
                  placeholder="2026/27"
                  onChange={(event) => editor.updateSeason(season.id, { season: event.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <span>Club</span>
              <input
                value={season.club}
                aria-label="Club"
                placeholder="Club or age group"
                onChange={(event) => editor.updateSeason(season.id, { club: event.target.value })}
              />
            </label>
            <div className="squad-list">
              {season.players.length === 0 && <p className="hint">No players yet. Add a row, or load the sample squad and replace the names.</p>}
              {season.players.map((player) => (
                <div className="squad-row" key={player.id}>
                  <input
                    aria-label={`Shirt number for ${player.name || "player"}`}
                    inputMode="numeric"
                    value={String(player.number)}
                    onChange={(event) => {
                      const number = Number(event.target.value);
                      if (Number.isFinite(number)) editor.updateSquadPlayer(season.id, player.id, { number });
                    }}
                  />
                  <input
                    aria-label="Player name"
                    value={player.name}
                    placeholder="Player name"
                    onChange={(event) => editor.updateSquadPlayer(season.id, player.id, { name: event.target.value })}
                  />
                  <input
                    className="pos"
                    aria-label="Position"
                    value={player.position}
                    placeholder="Position"
                    list="squad-positions"
                    onChange={(event) => editor.updateSquadPlayer(season.id, player.id, { position: event.target.value })}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Remove ${player.name || "player"}`}
                    onClick={() => editor.removeSquadPlayer(season.id, player.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <datalist id="squad-positions">
              {POSITIONS.map((position) => (
                <option key={position} value={position} />
              ))}
            </datalist>
            {duplicate && <p className="hint">Two players share a shirt number. Drills use the first match.</p>}
            <div className="squad-actions">
              <button type="button" className="btn primary" onClick={() => editor.addSquadPlayer(season.id)}>
                Add player
              </button>
              {season.players.length === 0 && (
                <button type="button" className="btn ghost" onClick={() => editor.loadSampleSquad(season.id)}>
                  Load a sample squad
                </button>
              )}
              <Link className="btn ghost" to="/board">
                Use on the board
              </Link>
            </div>
          </section>
          <aside className="client-form season-switch">
            <h2>Seasons</h2>
            <p className="hint">The sheet marked in use is the one new home players and shapes read from.</p>
            {editor.seasons.map((item) => (
              <button
                key={item.id}
                type="button"
                className="season-card"
                aria-pressed={item.id === season.id}
                onClick={() => editor.setActiveSeason(item.id)}
              >
                <strong>{item.name || "Untitled sheet"}</strong>
                <span>
                  {item.season || "Season not set"}
                  {item.club ? ` · ${item.club}` : ""} · {item.players.length} players
                </span>
              </button>
            ))}
            <button type="button" className="btn ghost" onClick={editor.createSeason}>
              New season
            </button>
            {editor.seasons.length > 1 && (
              <button type="button" className="text-btn danger" onClick={() => editor.deleteSeason(season.id)}>
                Remove this sheet
              </button>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

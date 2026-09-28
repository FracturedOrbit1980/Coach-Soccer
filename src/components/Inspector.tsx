import { useState } from "react";
import { ChevronDown, ChevronUp, Play, Sparkles, Trash2, X } from "lucide-react";
import { BEHAVIOURS, FOCUS, INTERVENTION_STYLES, MOMENTS, PHASE_META, PILLARS, SCAFFOLDS, ZONES, AGE_GROUPS } from "../data/scaffolding";
import { DRILL_LIBRARY, findDrillById, getDrillsForFormat } from "../data/drills";
import { validate } from "../lib/validate";
import { useEditor } from "../store/editor";
import type { Format, InspectorTab, PhaseType, PlayerFocus } from "../types";
import { Field, StringList } from "./Field";

const TABS: { id: InspectorTab; label: string }[] = [
  { id: "session", label: "Session" },
  { id: "phase", label: "Phase" },
  { id: "method", label: "Method" },
  { id: "pillars", label: "Focus" },
];

export function Inspector() {
  const editor = useEditor();
  const { session, phase, frame } = editor;
  const scaffold = SCAFFOLDS[session.tier];
  const report = validate(session);
  const selected = frame.tokens.find((token) => token.id === editor.selectedId && editor.selectedKind === "token");
  const selectedStroke = frame.strokes.find((stroke) => stroke.id === editor.selectedId && editor.selectedKind === "stroke");
  const ages = AGE_GROUPS.includes(session.ageGroup) ? AGE_GROUPS : [session.ageGroup, ...AGE_GROUPS];

  const [drillId, setDrillId] = useState<string>("");
  const [variantIdx, setVariantIdx] = useState<number>(0);
  const [drillFormatScope, setDrillFormatScope] = useState<"current" | "all">("current");

  const availableDrills =
    drillFormatScope === "current"
      ? getDrillsForFormat(session.tier as Format)
      : DRILL_LIBRARY;
  const activeDrill = findDrillById(drillId);

  return (
    <aside className={`inspector ${editor.panelOpen ? "open" : ""}`}>
      <div className="inspector-head">
        <div>
          <p className="eyebrow">Methodology</p>
          <strong>
            {report.score}/{report.max} ready
          </strong>
        </div>
        <button type="button" className="icon-btn panel-close" onClick={() => editor.setPanelOpen(false)} aria-label="Close details">
          <X size={16} />
        </button>
      </div>
      {(selected || selectedStroke) && (
        <div className="selection">
          {selected && (selected.kind === "player" || selected.kind === "gk") && (
            <>
              <label className="field">
                <span>Team sheet</span>
                <select
                  aria-label="Player from the season sheet"
                  value={selected.squadPlayerId ?? ""}
                  onChange={(event) => {
                    const id = event.target.value;
                    if (!id) {
                      editor.patchToken(selected.id, { squadPlayerId: undefined }, true);
                      return;
                    }
                    const player = editor.activeSeason.players.find((item) => item.id === id);
                    if (!player) return;
                    editor.patchToken(
                      selected.id,
                      {
                        squadPlayerId: player.id,
                        number: player.number,
                        name: player.name,
                        role: selected.role || player.position,
                      },
                      true,
                    );
                  }}
                >
                  <option value="">Custom</option>
                  {editor.activeSeason.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.number} · {player.name || "Unnamed"}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Number"
                type="number"
                value={String(selected.number ?? "")}
                onChange={(value, history) =>
                  editor.patchToken(selected.id, { number: Number(value) || 0, squadPlayerId: undefined }, history)
                }
              />
              <Field
                label="Name"
                value={selected.name ?? ""}
                placeholder="From the squad"
                onChange={(value, history) => editor.patchToken(selected.id, { name: value, squadPlayerId: undefined }, history)}
              />
              <Field
                label="Role"
                value={selected.role ?? ""}
                placeholder="CB, 6, 9"
                onChange={(value, history) => editor.patchToken(selected.id, { role: value }, history)}
              />
            </>
          )}
          {selected?.kind === "goal" && (
            <label className="field">
              <span>Angle {Math.round(selected.rotation ?? 0)}°</span>
              <input
                type="range"
                min={0}
                max={359}
                aria-label="Mini goal angle"
                value={Math.round(selected.rotation ?? 0)}
                onChange={(event) => editor.patchToken(selected.id, { rotation: Number(event.target.value) }, false)}
              />
              <span className="squad-actions">
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => editor.patchToken(selected.id, { rotation: ((selected.rotation ?? 0) + 345) % 360 }, true)}
                >
                  −15°
                </button>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => editor.patchToken(selected.id, { rotation: ((selected.rotation ?? 0) + 15) % 360 }, true)}
                >
                  +15°
                </button>
              </span>
            </label>
          )}
          {selected?.kind === "marker" && (
            <Field
              label="Note"
              value={selected.label ?? ""}
              onChange={(value, history) => editor.patchToken(selected.id, { label: value }, history)}
            />
          )}
          {selectedStroke && (
            <p className="hint">
              {selectedStroke.team === "home" ? "Home" : "Opposition"} {selectedStroke.kind}
            </p>
          )}
          <button
            type="button"
            className="text-btn danger"
            onClick={() => editor.selectedId && editor.erase(editor.selectedId, selected ? "token" : "stroke")}
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      )}
      <div className="tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={editor.inspectorTab === tab.id}
            onClick={() => editor.setInspectorTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="inspector-body">
        {editor.inspectorTab === "session" && (
          <div className="stack">
            <div className="split">
              <Field label="Theme" value={session.theme} placeholder="e.g. Breaking lines" onChange={(value, history) => editor.patchSession({ theme: value }, history)} />
              <Field
                label="Duration (min)"
                type="number"
                value={String(session.duration)}
                onChange={(value, history) => editor.patchSession({ duration: Number(value) || 0 }, history)}
              />
            </div>
            <div className="split">
              <label className="field">
                <span>Age group</span>
                <select value={session.ageGroup} onChange={(event) => editor.patchSession({ ageGroup: event.target.value })}>
                  {ages.map((age) => (
                    <option key={age}>{age}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Moment</span>
                <select
                  value={session.moment}
                  onChange={(event) => editor.patchSession({ moment: event.target.value as typeof session.moment })}
                >
                  {MOMENTS.map((moment) => (
                    <option key={moment.id} value={moment.id}>
                      {moment.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Field
              label="Core principle"
              value={session.principle}
              multiline
              placeholder="The main objective for the team..."
              onChange={(value, history) => editor.patchSession({ principle: value }, history)}
            />
            <div className="five">
              <p className="field-label">5 Ws Breakdown</p>
              {(["what", "where", "who", "when", "why"] as const).map((key) => (
                <Field
                  key={key}
                  label={key[0].toUpperCase() + key.slice(1)}
                  value={session[key]}
                  placeholder={`${key.toUpperCase()} in the game`}
                  onChange={(value, history) => editor.patchSession({ [key]: value }, history)}
                />
              ))}
            </div>
            <div className="opponent">
              <p className="field-label">Opponent {session.tier === "11" ? "· 11-a-side shape & triggers" : ""}</p>
              <Field label="Shape" value={session.opponent.shape} placeholder="e.g. 4-3-3" onChange={(value, history) => editor.patchOpponent({ shape: value }, history)} />
              <Field label="Build-up & Weakness" value={session.opponent.buildUp} multiline placeholder="Opponent tendencies and spaces to exploit..." onChange={(value, history) => editor.patchOpponent({ buildUp: value }, history)} />
            </div>
            <p className="scaffold-note">{scaffold.summary}</p>
          </div>
        )}

        {editor.inspectorTab === "phase" && (
          <div className="stack">
            {/* Phase Switcher Dropdown */}
            <div className="phase-select-bar">
              <label className="field grow">
                <span>Phase ({session.phases.length})</span>
                <select
                  value={phase.id}
                  aria-label="Select active phase"
                  onChange={(event) => editor.setActivePhase(event.target.value)}
                >
                  {session.phases.map((item, index) => (
                    <option key={item.id} value={item.id}>
                      {index + 1}. {item.title || PHASE_META[item.type].label} ({item.minutes}′)
                    </option>
                  ))}
                </select>
              </label>
              <div className="icon-pair">
                <button type="button" aria-label="Move phase up" title="Move phase up" onClick={() => editor.movePhase(-1)}>
                  <ChevronUp size={16} />
                </button>
                <button type="button" aria-label="Move phase down" title="Move phase down" onClick={() => editor.movePhase(1)}>
                  <ChevronDown size={16} />
                </button>
                <button type="button" aria-label="Delete phase" title="Delete phase" onClick={() => editor.removePhase(phase.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Quick Drill Library Loader */}
            <div className="drill-library-box">
              <div className="row-between">
                <span className="field-label">
                  <Sparkles size={14} className="inline-icon" /> Drill Library & Variants
                </span>
                <div className="scope-toggle" role="group" aria-label="Drill format scope">
                  <button
                    type="button"
                    className="scope-btn"
                    aria-pressed={drillFormatScope === "current"}
                    onClick={() => setDrillFormatScope("current")}
                  >
                    {session.tier}s drills
                  </button>
                  <button
                    type="button"
                    className="scope-btn"
                    aria-pressed={drillFormatScope === "all"}
                    onClick={() => setDrillFormatScope("all")}
                  >
                    All formats
                  </button>
                </div>
              </div>

              <label className="field">
                <span>Select pre-built drill</span>
                <select
                  value={drillId}
                  aria-label="Drill library dropdown"
                  onChange={(event) => {
                    setDrillId(event.target.value);
                    setVariantIdx(0);
                  }}
                >
                  <option value="">Choose a drill to load...</option>
                  {(["Warm-up & Ball Mastery", "Rondo & Possession", "Functional & Positional", "Game & Transition"] as const).map(
                    (cat) => {
                      const drillsInCat = availableDrills.filter((d) => d.category === cat);
                      if (drillsInCat.length === 0) return null;
                      return (
                        <optgroup key={cat} label={cat}>
                          {drillsInCat.map((d) => (
                            <option key={d.id} value={d.id}>
                              [{d.format}s] {d.title} ({d.durationMinutes}′)
                            </option>
                          ))}
                        </optgroup>
                      );
                    },
                  )}
                </select>
              </label>

              {activeDrill && (
                <div className="drill-detail-card">
                  <div className="drill-meta-line">
                    <span className="pill-badge">{activeDrill.category}</span>
                    <span>
                      {activeDrill.pitchDimensions.lengthM}×{activeDrill.pitchDimensions.widthM}m · {activeDrill.durationMinutes}′
                    </span>
                  </div>
                  <p className="drill-desc">{activeDrill.organisation}</p>

                  <label className="field">
                    <span>Variant / Progression</span>
                    <select
                      value={variantIdx}
                      aria-label="Select drill variant"
                      onChange={(event) => setVariantIdx(Number(event.target.value) || 0)}
                    >
                      {activeDrill.variants.map((v, i) => (
                        <option key={v.id} value={i}>
                          Variant {i + 1}: {v.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="drill-actions">
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => editor.loadDrillIntoPhase(activeDrill.id, variantIdx)}
                    >
                      <Play size={13} /> Load to Current Phase
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => editor.addDrillAsPhase(activeDrill.id, variantIdx)}
                    >
                      + Add New Phase
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Phase Setup Details */}
            <div className="split">
              <Field label="Phase title" value={phase.title} onChange={(value, history) => editor.patchPhase({ title: value }, history)} />
              <label className="field">
                <span>+ Blank phase</span>
                <select
                  value=""
                  onChange={(event) => {
                    if (event.target.value) editor.addPhase(event.target.value as PhaseType);
                  }}
                >
                  <option value="">Add type...</option>
                  {scaffold.phaseTypes.map((type) => (
                    <option key={type} value={type}>
                      {PHASE_META[type].label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="split">
              <Field label="Minutes" type="number" value={String(phase.minutes)} onChange={(value, history) => editor.patchPhase({ minutes: Number(value) || 0 }, history)} />
              <Field label="Length m" type="number" value={String(phase.lengthM)} onChange={(value, history) => editor.patchPhase({ lengthM: Number(value) || 0 }, history)} />
              <Field label="Width m" type="number" value={String(phase.widthM)} onChange={(value, history) => editor.patchPhase({ widthM: Number(value) || 0 }, history)} />
            </div>

            <label className="field">
              <span>Pitch zone</span>
              <select value={phase.zone} onChange={(event) => editor.patchPhase({ zone: event.target.value as typeof phase.zone })}>
                {ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.label}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Organisation & Rules"
              value={phase.organisation}
              multiline
              placeholder={PHASE_META[phase.type].hint}
              onChange={(value, history) => editor.patchPhase({ organisation: value }, history)}
            />

            <StringList
              label="Coaching points"
              items={phase.coachingPoints}
              placeholder="Key teaching cues"
              onChange={(items, history) => editor.patchPhase({ coachingPoints: items }, history)}
            />

            <StringList
              label="Guided questions"
              items={phase.questions}
              placeholder="Prompt for player insight"
              onChange={(items, history) => editor.patchPhase({ questions: items }, history)}
            />

            {/* Prompts Dropdown instead of listed chips */}
            <label className="field">
              <span>Prompts for {scaffold.name}</span>
              <select
                value=""
                onChange={(event) => {
                  if (event.target.value && !phase.questions.includes(event.target.value)) {
                    editor.patchPhase({ questions: [...phase.questions, event.target.value] });
                  }
                }}
              >
                <option value="">Select prompt to add to questions...</option>
                {scaffold.questions.map((question) => (
                  <option key={question} value={question}>
                    {question}
                  </option>
                ))}
              </select>
            </label>

            <ul className="watchouts">
              {scaffold.watchouts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {editor.inspectorTab === "method" && (
          <div className="stack">
            <p className="hint">
              The check looks at the coach, the pitch, the player, and the game, plus what, where, who, when, and why. It does not grade the drawing.
            </p>
            {report.checks.map((check) => (
              <button key={check.id} type="button" className={check.ok ? "check ok" : "check"} onClick={() => editor.setInspectorTab(check.tab)}>
                <span>{check.ok ? "Ready" : "Add"}</span>
                <span>
                  <strong>{check.label}</strong>
                  <small>{check.detail}</small>
                </span>
              </button>
            ))}
          </div>
        )}

        {editor.inspectorTab === "pillars" && (
          <div className="stack">
            {PILLARS.map((pillar) => (
              <article key={pillar.id} className="pillar-mini">
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
              </article>
            ))}
            <div>
              <p className="field-label">Coach behaviours</p>
              <div className="chips">
                {BEHAVIOURS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={session.coachBehaviours.includes(item)}
                    onClick={() => {
                      const has = session.coachBehaviours.includes(item);
                      editor.patchSession({
                        coachBehaviours: has
                          ? session.coachBehaviours.filter((entry) => entry !== item)
                          : [...session.coachBehaviours, item],
                      });
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="field-label">Intervention</p>
              <div className="chips">
                {INTERVENTION_STYLES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={session.interventionStyles.includes(item)}
                    onClick={() => {
                      const has = session.interventionStyles.includes(item);
                      editor.patchSession({
                        interventionStyles: has
                          ? session.interventionStyles.filter((entry) => entry !== item)
                          : [...session.interventionStyles, item],
                      });
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="field-label">The player</p>
              <div className="chips">
                {FOCUS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={session.playerFocus.includes(item.id)}
                    onClick={() => {
                      const has = session.playerFocus.includes(item.id);
                      const playerFocus: PlayerFocus[] = has
                        ? session.playerFocus.filter((entry) => entry !== item.id)
                        : [...session.playerFocus, item.id];
                      editor.patchSession({ playerFocus });
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <Field
              label="Environment"
              value={session.environment}
              multiline
              placeholder="Area, numbers, and how the session should feel"
              onChange={(value, history) => editor.patchSession({ environment: value }, history)}
            />
            <div>
              <p className="field-label">{scaffold.name} focus</p>
              <ul className="watchouts">
                {scaffold.focus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

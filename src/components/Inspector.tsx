import { ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import { BEHAVIOURS, FOCUS, INTERVENTION_STYLES, MOMENTS, PHASE_META, PILLARS, SCAFFOLDS, ZONES, AGE_GROUPS } from "../data/scaffolding";
import { validate } from "../lib/validate";
import { useEditor } from "../store/editor";
import type { InspectorTab, PhaseType, PlayerFocus } from "../types";
import { Field, StringList } from "./Field";

const TABS: { id: InspectorTab; label: string }[] = [
  { id: "session", label: "Session" },
  { id: "phase", label: "Phase" },
  { id: "method", label: "Method" },
  { id: "pillars", label: "Pillars" },
];

export function Inspector() {
  const editor = useEditor();
  const { session, phase, frame } = editor;
  const scaffold = SCAFFOLDS[session.tier];
  const report = validate(session);
  const selected = frame.tokens.find((token) => token.id === editor.selectedId && editor.selectedKind === "token");
  const selectedStroke = frame.strokes.find((stroke) => stroke.id === editor.selectedId && editor.selectedKind === "stroke");
  const ages = AGE_GROUPS.includes(session.ageGroup) ? AGE_GROUPS : [session.ageGroup, ...AGE_GROUPS];

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
              <Field
                label="Number"
                type="number"
                value={String(selected.number ?? "")}
                onChange={(value, history) => editor.patchToken(selected.id, { number: Number(value) || 0 }, history)}
              />
              <Field
                label="Role"
                value={selected.role ?? ""}
                placeholder="CB, 6, 9"
                onChange={(value, history) => editor.patchToken(selected.id, { role: value }, history)}
              />
            </>
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
            <Field label="Theme" value={session.theme} onChange={(value, history) => editor.patchSession({ theme: value }, history)} />
            <label className="field">
              <span>Age group</span>
              <select value={session.ageGroup} onChange={(event) => editor.patchSession({ ageGroup: event.target.value })}>
                {ages.map((age) => (
                  <option key={age}>{age}</option>
                ))}
              </select>
            </label>
            <Field
              label="Duration (minutes)"
              type="number"
              value={String(session.duration)}
              onChange={(value, history) => editor.patchSession({ duration: Number(value) || 0 }, history)}
            />
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
            <Field
              label="Principle"
              value={session.principle}
              multiline
              onChange={(value, history) => editor.patchSession({ principle: value }, history)}
            />
            <div className="five">
              <p className="field-label">What, where, who, when, why</p>
              {(["what", "where", "who", "when", "why"] as const).map((key) => (
                <Field
                  key={key}
                  label={key[0].toUpperCase() + key.slice(1)}
                  value={session[key]}
                  multiline
                  onChange={(value, history) => editor.patchSession({ [key]: value }, history)}
                />
              ))}
            </div>
            <div className="opponent">
              <p className="field-label">Opponent model {session.tier === "A" ? "· required at UEFA A" : ""}</p>
              <Field label="Shape" value={session.opponent.shape} placeholder="4-3-3" onChange={(value, history) => editor.patchOpponent({ shape: value }, history)} />
              <Field label="Build-up" value={session.opponent.buildUp} multiline onChange={(value, history) => editor.patchOpponent({ buildUp: value }, history)} />
              <Field label="Press trigger" value={session.opponent.pressTrigger} multiline onChange={(value, history) => editor.patchOpponent({ pressTrigger: value }, history)} />
              <Field label="Weakness" value={session.opponent.weakness} multiline onChange={(value, history) => editor.patchOpponent({ weakness: value }, history)} />
            </div>
            <p className="scaffold-note">{scaffold.summary}</p>
          </div>
        )}

        {editor.inspectorTab === "phase" && (
          <div className="stack">
            <div className="phase-list">
              {session.phases.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === phase.id ? "phase-chip on" : "phase-chip"}
                  onClick={() => editor.setActivePhase(item.id)}
                >
                  <span>{index + 1}</span>
                  <span>{item.title || PHASE_META[item.type].label}</span>
                  <span>{item.minutes}′</span>
                </button>
              ))}
            </div>
            <div className="row-between">
              <label className="field grow">
                <span>Add phase</span>
                <select
                  value=""
                  onChange={(event) => {
                    if (event.target.value) editor.addPhase(event.target.value as PhaseType);
                  }}
                >
                  <option value="">Choose</option>
                  {scaffold.phaseTypes.map((type) => (
                    <option key={type} value={type}>
                      {PHASE_META[type].label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="icon-pair">
                <button type="button" aria-label="Move phase up" onClick={() => editor.movePhase(-1)}>
                  <ChevronUp size={16} />
                </button>
                <button type="button" aria-label="Move phase down" onClick={() => editor.movePhase(1)}>
                  <ChevronDown size={16} />
                </button>
                <button type="button" aria-label="Delete phase" onClick={() => editor.removePhase(phase.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <Field label="Phase title" value={phase.title} onChange={(value, history) => editor.patchPhase({ title: value }, history)} />
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
              label="Organisation"
              value={phase.organisation}
              multiline
              placeholder={PHASE_META[phase.type].hint}
              onChange={(value, history) => editor.patchPhase({ organisation: value }, history)}
            />
            <StringList
              label="Coaching points"
              items={phase.coachingPoints}
              placeholder="What you will say"
              onChange={(items, history) => editor.patchPhase({ coachingPoints: items }, history)}
            />
            <StringList
              label="Guided questions"
              items={phase.questions}
              placeholder="Ask, then wait"
              onChange={(items, history) => editor.patchPhase({ questions: items }, history)}
            />
            <div>
              <p className="field-label">Prompts for {scaffold.name}</p>
              <div className="chips">
                {scaffold.questions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => {
                      if (!phase.questions.includes(question)) {
                        editor.patchPhase({ questions: [...phase.questions, question] });
                      }
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
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
              The check follows the four pillars and the what / where / who / when / why picture. It does not grade the drawing.
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

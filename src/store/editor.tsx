import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { TEMPLATES } from "../data/competencies";
import { createSample } from "../data/samples";
import { SCAFFOLDS } from "../data/scaffolding";
import { axesToCompetencies, isClient, isStaffRole, makeClient, makeReview } from "../lib/clients";
import { tokensForFormation } from "../lib/geometry";
import { uid } from "../lib/id";
import { suggestPress } from "../lib/press";
import {
  blankPhase,
  blankSession,
  cloneFrame,
  cloneSession,
  isSession,
  leadPhase,
  nextNumber,
  now,
  playerCount,
  updateFrame,
  updatePhase,
} from "../lib/session";
import type {
  Client,
  Frame,
  InspectorTab,
  LibraryEntry,
  Opponent,
  Phase,
  PhaseType,
  PitchView,
  Point,
  Review,
  Session,
  StaffRole,
  StrokeKind,
  Team,
  Tier,
  Token,
  Tool,
} from "../types";

const STORAGE_KEY = "sfa-tactics-v1";

interface PersistShape {
  session: Session;
  library: LibraryEntry[];
  activePhaseId: string;
  activeFrameId: string;
  clients: Client[];
  staffRole: StaffRole;
}

interface EditorState {
  session: Session;
  library: LibraryEntry[];
  clients: Client[];
  staffRole: StaffRole;
  activePhaseId: string;
  activeFrameId: string;
  tool: Tool;
  pitchView: PitchView;
  selectedId: string | null;
  selectedKind: "token" | "stroke" | null;
  onion: boolean;
  grid: boolean;
  areaOverlay: boolean;
  drawTeam: Team;
  past: Session[];
  future: Session[];
  notice: string | null;
  inspectorTab: InspectorTab;
  panelOpen: boolean;
}

function loadPersisted(): PersistShape | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<PersistShape>;
    if (!isSession(data.session)) return null;
    const library = Array.isArray(data.library)
      ? data.library.filter((entry) => entry && isSession(entry.session))
      : [];
    const clients = Array.isArray(data.clients) ? data.clients.filter((entry) => isClient(entry)) : [];
    return {
      session: data.session,
      library,
      clients,
      staffRole: isStaffRole(data.staffRole) ? data.staffRole : "coach",
      activePhaseId: data.activePhaseId ?? data.session.phases[0].id,
      activeFrameId: data.activeFrameId ?? data.session.phases[0].frames[0].id,
    };
  } catch {
    return null;
  }
}

function initialState(): EditorState {
  const saved = loadPersisted();
  if (saved) {
    return {
      ...saved,
      clients: saved.clients,
      staffRole: saved.staffRole,
      tool: "select",
      pitchView: "full",
      selectedId: null,
      selectedKind: null,
      onion: true,
      grid: false,
      areaOverlay: true,
      drawTeam: "home",
      past: [],
      future: [],
      notice: null,
      inspectorTab: "phase",
      panelOpen: false,
    };
  }
  const session = createSample("B");
  const lead = leadPhase(session);
  return {
    session,
    library: [],
    clients: [],
    staffRole: "coach",
    activePhaseId: lead.phaseId,
    activeFrameId: lead.frameId,
    tool: "select",
    pitchView: "full",
    selectedId: null,
    selectedKind: null,
    onion: true,
    grid: false,
    areaOverlay: true,
    drawTeam: "home",
    past: [],
    future: [],
    notice: "UEFA B sample is on the board. Press space to play the press.",
    inspectorTab: "phase",
    panelOpen: false,
  };
}

function phaseOf(state: EditorState): Phase {
  return state.session.phases.find((phase) => phase.id === state.activePhaseId) ?? state.session.phases[0];
}

function frameOf(state: EditorState, phase: Phase): Frame {
  return phase.frames.find((frame) => frame.id === state.activeFrameId) ?? phase.frames[0];
}

function withHistory(state: EditorState, session: Session, extra: Partial<EditorState> = {}): EditorState {
  return {
    ...state,
    ...extra,
    session: { ...session, updatedAt: now() },
    past: [...state.past, state.session].slice(-50),
    future: [],
  };
}

function apply(state: EditorState, session: Session, history: boolean, extra: Partial<EditorState> = {}): EditorState {
  return history ? withHistory(state, session, extra) : { ...state, ...extra, session: { ...session, updatedAt: now() } };
}

interface EditorApi extends EditorState {
  phase: Phase;
  frame: Frame;
  canUndo: boolean;
  canRedo: boolean;
  setNotice: (notice: string | null) => void;
  setTool: (tool: Tool) => void;
  setPitchView: (pitchView: PitchView) => void;
  setDrawTeam: (drawTeam: Team) => void;
  toggleOnion: () => void;
  toggleGrid: () => void;
  toggleArea: () => void;
  select: (id: string | null, kind?: "token" | "stroke" | null) => void;
  checkpoint: () => void;
  undo: () => void;
  redo: () => void;
  patchSession: (partial: Partial<Session>, history?: boolean) => void;
  patchOpponent: (partial: Partial<Opponent>, history?: boolean) => void;
  setTier: (tier: Tier) => void;
  setInspectorTab: (inspectorTab: InspectorTab) => void;
  setPanelOpen: (panelOpen: boolean) => void;
  setActivePhase: (id: string) => void;
  addPhase: (type: PhaseType) => void;
  removePhase: (id: string) => void;
  movePhase: (direction: -1 | 1) => void;
  patchPhase: (partial: Partial<Phase>, history?: boolean) => void;
  setActiveFrame: (id: string) => void;
  addFrame: () => void;
  deleteFrame: () => void;
  patchFrame: (partial: Partial<Frame>, history?: boolean) => void;
  patchToken: (id: string, partial: Partial<Token>, history?: boolean) => void;
  placeAt: (point: Point) => void;
  addStroke: (kind: StrokeKind, points: Point[]) => void;
  erase: (id: string, kind: "token" | "stroke") => void;
  nudge: (dx: number, dy: number) => void;
  applyFormation: (team: Team, name: string) => void;
  suggest: () => void;
  clearStrokes: () => void;
  clearEquipment: () => void;
  clearFrame: () => void;
  loadSample: (tier: Tier) => void;
  newSession: (tier?: Tier) => void;
  replaceSession: (session: Session, notice?: string) => void;
  saveLibrary: () => void;
  saveCopy: () => void;
  loadLibrary: (id: string) => void;
  deleteLibrary: (id: string) => void;
  setStaffRole: (role: StaffRole) => void;
  createClient: (input: { name: string; age: string; club: string; position: string }) => string;
  updateClient: (id: string, partial: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addReview: (clientId: string) => void;
  updateReview: (clientId: string, reviewId: string, partial: Partial<Review>) => void;
  deleteReview: (clientId: string, reviewId: string) => void;
  renameCompetency: (clientId: string, competencyId: string, label: string) => void;
  addCompetency: (clientId: string, label: string) => void;
  removeCompetency: (clientId: string, competencyId: string) => void;
  applyTemplate: (clientId: string, templateId: string) => void;
  assignClient: (clientId: string | null) => void;
  newSessionForClient: (clientId: string) => void;
}

const EditorContext = createContext<EditorApi | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EditorState>(initialState);

  useEffect(() => {
    const phase = phaseOf(state);
    const frame = frameOf(state, phase);
    const payload: PersistShape = {
      session: state.session,
      library: state.library,
      clients: state.clients,
      staffRole: state.staffRole,
      activePhaseId: phase.id,
      activeFrameId: frame.id,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* The board still works if storage is full or blocked. */
    }
  }, [state]);

  useEffect(() => {
    if (!state.notice) return;
    const timer = window.setTimeout(() => setState((current) => ({ ...current, notice: null })), 3600);
    return () => window.clearTimeout(timer);
  }, [state.notice]);

  const api = useMemo<EditorApi>(() => {
    const phase = phaseOf(state);
    const frame = frameOf(state, phase);

    const editFrame = (fn: (current: Frame) => Frame, history = true, extra: Partial<EditorState> = {}) => {
      setState((current) => {
        const activePhase = phaseOf(current);
        const activeFrame = frameOf(current, activePhase);
        const session = updateFrame(current.session, activePhase.id, activeFrame.id, fn);
        return apply(current, session, history, extra);
      });
    };

    return {
      ...state,
      phase,
      frame,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      setNotice: (notice) => setState((current) => ({ ...current, notice })),
      setTool: (tool) => setState((current) => ({ ...current, tool })),
      setPitchView: (pitchView) => setState((current) => ({ ...current, pitchView })),
      setDrawTeam: (drawTeam) => setState((current) => ({ ...current, drawTeam })),
      toggleOnion: () => setState((current) => ({ ...current, onion: !current.onion })),
      toggleGrid: () => setState((current) => ({ ...current, grid: !current.grid })),
      toggleArea: () => setState((current) => ({ ...current, areaOverlay: !current.areaOverlay })),
      select: (id, kind = id ? "token" : null) =>
        setState((current) => ({ ...current, selectedId: id, selectedKind: kind })),
      checkpoint: () =>
        setState((current) => ({
          ...current,
          past: [...current.past, current.session].slice(-50),
          future: [],
        })),
      undo: () =>
        setState((current) => {
          const previous = current.past[current.past.length - 1];
          if (!previous) return current;
          return {
            ...current,
            session: previous,
            past: current.past.slice(0, -1),
            future: [current.session, ...current.future].slice(0, 50),
            selectedId: null,
          };
        }),
      redo: () =>
        setState((current) => {
          const next = current.future[0];
          if (!next) return current;
          return {
            ...current,
            session: next,
            past: [...current.past, current.session].slice(-50),
            future: current.future.slice(1),
            selectedId: null,
          };
        }),
      patchSession: (partial, history = true) =>
        setState((current) => apply(current, { ...current.session, ...partial }, history)),
      patchOpponent: (partial, history = true) =>
        setState((current) =>
          apply(current, { ...current.session, opponent: { ...current.session.opponent, ...partial } }, history),
        ),
      setTier: (tier) => setState((current) => withHistory(current, { ...current.session, tier })),
      setInspectorTab: (inspectorTab) => setState((current) => ({ ...current, inspectorTab })),
      setPanelOpen: (panelOpen) => setState((current) => ({ ...current, panelOpen })),
      setActivePhase: (id) =>
        setState((current) => {
          const next = current.session.phases.find((item) => item.id === id);
          if (!next) return current;
          return { ...current, activePhaseId: next.id, activeFrameId: next.frames[0].id, selectedId: null };
        }),
      addPhase: (type) =>
        setState((current) => {
          const created = blankPhase(type, current.session.tier);
          return withHistory(current, { ...current.session, phases: [...current.session.phases, created] }, {
            activePhaseId: created.id,
            activeFrameId: created.frames[0].id,
            selectedId: null,
            inspectorTab: "phase",
          });
        }),
      removePhase: (id) =>
        setState((current) => {
          if (current.session.phases.length < 2) {
            return { ...current, notice: "Keep at least one phase in the session." };
          }
          const phases = current.session.phases.filter((item) => item.id !== id);
          const next = phases[0];
          return withHistory(current, { ...current.session, phases }, {
            activePhaseId: next.id,
            activeFrameId: next.frames[0].id,
            selectedId: null,
          });
        }),
      movePhase: (direction) =>
        setState((current) => {
          const phases = [...current.session.phases];
          const index = phases.findIndex((item) => item.id === phaseOf(current).id);
          const target = index + direction;
          if (target < 0 || target >= phases.length) return current;
          const [item] = phases.splice(index, 1);
          phases.splice(target, 0, item);
          return withHistory(current, { ...current.session, phases });
        }),
      patchPhase: (partial, history = true) =>
        setState((current) => {
          const active = phaseOf(current);
          const session = updatePhase(current.session, active.id, (item) => ({ ...item, ...partial }));
          return apply(current, session, history);
        }),
      setActiveFrame: (id) => setState((current) => ({ ...current, activeFrameId: id, selectedId: null })),
      addFrame: () =>
        setState((current) => {
          const active = phaseOf(current);
          const source = frameOf(current, active);
          const created = cloneFrame(source);
          created.note = `Picture ${active.frames.length + 1}`;
          const session = updatePhase(current.session, active.id, (item) => ({
            ...item,
            frames: [...item.frames, created],
          }));
          return withHistory(current, session, { activeFrameId: created.id });
        }),
      deleteFrame: () =>
        setState((current) => {
          const active = phaseOf(current);
          if (active.frames.length < 2) {
            return { ...current, notice: "A phase keeps its opening picture." };
          }
          const frames = active.frames.filter((item) => item.id !== frameOf(current, active).id);
          const session = updatePhase(current.session, active.id, (item) => ({ ...item, frames }));
          return withHistory(current, session, { activeFrameId: frames[frames.length - 1].id, selectedId: null });
        }),
      patchFrame: (partial, history = true) => editFrame((item) => ({ ...item, ...partial }), history),
      patchToken: (id, partial, history = false) =>
        editFrame((item) => ({
          ...item,
          tokens: item.tokens.map((token) => (token.id === id ? { ...token, ...partial } : token)),
        }), history),
      placeAt: (point) =>
        setState((current) => {
          const active = phaseOf(current);
          const activeFrame = frameOf(current, active);
          const x = Math.min(98.5, Math.max(1.5, point.x));
          const y = Math.min(98.5, Math.max(1.5, point.y));
          let tokens = activeFrame.tokens;
          let notice = current.notice;
          let selectedId: string | null = current.selectedId;
          const tool = current.tool;

          const moveOrAdd = (match: (token: Token) => boolean, create: () => Token) => {
            const existing = tokens.find(match);
            if (existing) {
              tokens = tokens.map((token) => (token.id === existing.id ? { ...token, x, y } : token));
              selectedId = existing.id;
              return;
            }
            const created = create();
            tokens = [...tokens, created];
            selectedId = created.id;
          };

          if (tool === "ball") {
            moveOrAdd(
              (token) => token.kind === "ball",
              () => ({ id: uid(), kind: "ball", x, y }),
            );
          } else if (tool === "gk-home" || tool === "gk-away") {
            const team: Team = tool === "gk-home" ? "home" : "away";
            moveOrAdd(
              (token) => token.kind === "gk" && token.team === team,
              () => ({ id: uid(), kind: "gk", team, number: 1, role: "GK", x, y }),
            );
          } else if (tool === "home" || tool === "away") {
            const team: Team = tool === "home" ? "home" : "away";
            const count = playerCount(tokens, team);
            const max = SCAFFOLDS[current.session.tier].maxPlayers;
            if (count >= max) {
              notice = `${SCAFFOLDS[current.session.tier].name} usually stays at ${max} a side. The player was still added.`;
            }
            const created: Token = {
              id: uid(),
              kind: "player",
              team,
              number: nextNumber(tokens, team),
              role: "",
              x,
              y,
            };
            tokens = [...tokens, created];
            selectedId = created.id;
          } else if (tool === "marker") {
            const created: Token = { id: uid(), kind: "marker", label: "Trigger", team: current.drawTeam, x, y };
            tokens = [...tokens, created];
            selectedId = created.id;
          } else if (tool === "cone" || tool === "mannequin" || tool === "goal" || tool === "pole") {
            const created: Token = { id: uid(), kind: tool, x, y };
            tokens = [...tokens, created];
            selectedId = created.id;
          } else {
            return current;
          }

          const session = updateFrame(current.session, active.id, activeFrame.id, (item) => ({ ...item, tokens }));
          return withHistory(current, session, { selectedId, selectedKind: "token", notice });
        }),
      addStroke: (kind, points) => {
        if (points.length < 2) return;
        editFrame(
          (item) => ({
            ...item,
            strokes: [
              ...item.strokes,
              { id: uid(), kind, team: state.drawTeam, points },
            ],
          }),
          true,
          { selectedKind: "stroke" },
        );
      },
      erase: (id, kind) =>
        editFrame(
          (item) => ({
            ...item,
            tokens: kind === "token" ? item.tokens.filter((token) => token.id !== id) : item.tokens,
            strokes: kind === "stroke" ? item.strokes.filter((stroke) => stroke.id !== id) : item.strokes,
          }),
          true,
          { selectedId: null, selectedKind: null },
        ),
      nudge: (dx, dy) =>
        setState((current) => {
          if (!current.selectedId || current.selectedKind !== "token") return current;
          const active = phaseOf(current);
          const activeFrame = frameOf(current, active);
          const session = updateFrame(current.session, active.id, activeFrame.id, (item) => ({
            ...item,
            tokens: item.tokens.map((token) =>
              token.id === current.selectedId
                ? {
                    ...token,
                    x: Math.min(98.5, Math.max(1.5, token.x + dx)),
                    y: Math.min(98.5, Math.max(1.5, token.y + dy)),
                  }
                : token,
            ),
          }));
          return { ...current, session: { ...session, updatedAt: now() } };
        }),
      applyFormation: (team, name) =>
        editFrame((item) => ({
          ...item,
          tokens: [
            ...item.tokens.filter((token) => !(token.team === team && (token.kind === "player" || token.kind === "gk"))),
            ...tokensForFormation(team, name),
          ],
        })),
      suggest: () =>
        setState((current) => {
          const active = phaseOf(current);
          const source = frameOf(current, active);
          const result = suggestPress(source, current.session.tier);
          if (!result.ok) return { ...current, notice: result.summary };
          const created = cloneFrame(source);
          created.tokens = result.tokens;
          created.strokes = result.strokes;
          created.note = result.summary;
          const session = updatePhase(current.session, active.id, (item) => ({
            ...item,
            frames: [...item.frames, created],
          }));
          return withHistory(current, session, { activeFrameId: created.id, notice: result.summary });
        }),
      clearStrokes: () => editFrame((item) => ({ ...item, strokes: [] })),
      clearEquipment: () =>
        editFrame((item) => ({
          ...item,
          tokens: item.tokens.filter((token) => token.kind === "player" || token.kind === "gk" || token.kind === "ball"),
        })),
      clearFrame: () => editFrame((item) => ({ ...item, tokens: [], strokes: [] }), true, { selectedId: null }),
      loadSample: (tier) => {
        const session = createSample(tier);
        const lead = leadPhase(session);
        setState((current) => ({
          ...current,
          session,
          past: [],
          future: [],
          activePhaseId: lead.phaseId,
          activeFrameId: lead.frameId,
          selectedId: null,
          notice: `${session.title} is on the board.`,
          inspectorTab: "phase",
        }));
      },
      newSession: (tier) => {
        const session = blankSession(tier ?? state.session.tier);
        setState((current) => ({
          ...current,
          session,
          past: [],
          future: [],
          activePhaseId: session.phases[0].id,
          activeFrameId: session.phases[0].frames[0].id,
          selectedId: null,
          notice: "Blank session. The method check will show what still needs a sentence.",
          inspectorTab: "session",
          panelOpen: true,
        }));
      },
      replaceSession: (session, notice) => {
        const lead = leadPhase(session);
        setState((current) => ({
          ...current,
          session,
          past: [],
          future: [],
          activePhaseId: lead.phaseId,
          activeFrameId: lead.frameId,
          selectedId: null,
          notice: notice ?? `Loaded “${session.title}”.`,
        }));
      },
      saveLibrary: () =>
        setState((current) => {
          const snapshot = cloneSession({ ...current.session, updatedAt: now() });
          const client = current.clients.find((item) => item.id === snapshot.clientId);
          const entry: LibraryEntry = {
            id: snapshot.id,
            name: snapshot.title,
            tier: snapshot.tier,
            updatedAt: snapshot.updatedAt,
            session: snapshot,
            clientId: snapshot.clientId,
            savedBy: current.staffRole,
          };
          const exists = current.library.some((item) => item.id === entry.id);
          const who = client ? `${client.name}` : "this browser";
          return {
            ...current,
            library: exists
              ? current.library.map((item) => (item.id === entry.id ? entry : item))
              : [entry, ...current.library],
            notice: `Saved under ${who}.`,
          };
        }),
      saveCopy: () =>
        setState((current) => {
          const snapshot = cloneSession(current.session);
          snapshot.id = uid();
          snapshot.updatedAt = now();
          const entry: LibraryEntry = {
            id: snapshot.id,
            name: snapshot.title,
            tier: snapshot.tier,
            updatedAt: snapshot.updatedAt,
            session: snapshot,
            clientId: snapshot.clientId,
            savedBy: current.staffRole,
          };
          return {
            ...current,
            session: snapshot,
            past: [],
            future: [],
            library: [entry, ...current.library],
            notice: "Saved a copy. Further edits stay on this copy.",
          };
        }),
      loadLibrary: (id) =>
        setState((current) => {
          const entry = current.library.find((item) => item.id === id);
          if (!entry) return current;
          const session = cloneSession(entry.session);
          const lead = leadPhase(session);
          return {
            ...current,
            session,
            past: [],
            future: [],
            activePhaseId: lead.phaseId,
            activeFrameId: lead.frameId,
            selectedId: null,
            notice: `Loaded “${session.title}”.`,
          };
        }),
      deleteLibrary: (id) =>
        setState((current) => ({
          ...current,
          library: current.library.filter((item) => item.id !== id),
        })),
      setStaffRole: (staffRole) => setState((current) => ({ ...current, staffRole })),
      createClient: (input) => {
        const client = makeClient(input);
        setState((current) => ({
          ...current,
          clients: [client, ...current.clients],
          notice: `${client.name} is saved on this browser.`,
        }));
        return client.id;
      },
      updateClient: (id, partial) =>
        setState((current) => ({
          ...current,
          clients: current.clients.map((client) =>
            client.id === id ? { ...client, ...partial, updatedAt: now() } : client,
          ),
        })),
      deleteClient: (id) =>
        setState((current) => ({
          ...current,
          clients: current.clients.filter((client) => client.id !== id),
          session: current.session.clientId === id ? { ...current.session, clientId: undefined } : current.session,
          notice: "Client removed. Their saved sessions are still in the library.",
        })),
      addReview: (clientId) =>
        setState((current) => ({
          ...current,
          clients: current.clients.map((client) => {
            if (client.id !== clientId) return client;
            const latest = client.reviews[0];
            const review = makeReview(client.competencies, latest ? { ...latest.scores } : undefined, "Progress review");
            return { ...client, reviews: [review, ...client.reviews], updatedAt: now() };
          }),
          notice: "New review added. Adjust the scores to show what has changed.",
        })),
      updateReview: (clientId, reviewId, partial) =>
        setState((current) => ({
          ...current,
          clients: current.clients.map((client) => {
            if (client.id !== clientId) return client;
            return {
              ...client,
              updatedAt: now(),
              reviews: client.reviews.map((review) => (review.id === reviewId ? { ...review, ...partial } : review)),
            };
          }),
        })),
      deleteReview: (clientId, reviewId) =>
        setState((current) => ({
          ...current,
          clients: current.clients.map((client) => {
            if (client.id !== clientId || client.reviews.length < 2) return client;
            return { ...client, reviews: client.reviews.filter((review) => review.id !== reviewId), updatedAt: now() };
          }),
        })),
      renameCompetency: (clientId, competencyId, label) =>
        setState((current) => ({
          ...current,
          clients: current.clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  updatedAt: now(),
                  competencies: client.competencies.map((item) => (item.id === competencyId ? { ...item, label } : item)),
                }
              : client,
          ),
        })),
      addCompetency: (clientId, label) =>
        setState((current) => ({
          ...current,
          clients: current.clients.map((client) => {
            if (client.id !== clientId) return client;
            const competency = { id: uid(), label: label.trim() || "New competency" };
            return {
              ...client,
              updatedAt: now(),
              competencies: [...client.competencies, competency],
              reviews: client.reviews.map((review) => ({ ...review, scores: { ...review.scores, [competency.id]: 5 } })),
            };
          }),
        })),
      removeCompetency: (clientId, competencyId) =>
        setState((current) => ({
          ...current,
          clients: current.clients.map((client) => {
            if (client.id !== clientId || client.competencies.length <= 3) return client;
            return {
              ...client,
              updatedAt: now(),
              competencies: client.competencies.filter((item) => item.id !== competencyId),
            };
          }),
        })),
      applyTemplate: (clientId, templateId) =>
        setState((current) => {
          const template = TEMPLATES.find((item) => item.id === templateId);
          if (!template) return current;
          const competencies = axesToCompetencies(template.axes);
          return {
            ...current,
            notice: `${template.label} replaced the axes. Scores start again at 5.`,
            clients: current.clients.map((client) =>
              client.id === clientId
                ? { ...client, competencies, reviews: [makeReview(competencies)], updatedAt: now() }
                : client,
            ),
          };
        }),
      assignClient: (clientId) =>
        setState((current) => {
          const session = { ...current.session, clientId: clientId ?? undefined, updatedAt: now() };
          return {
            ...current,
            session,
            library: current.library.map((item) =>
              item.id === session.id ? { ...item, clientId: clientId ?? undefined, session: cloneSession(session) } : item,
            ),
          };
        }),
      newSessionForClient: (clientId) =>
        setState((current) => {
          const client = current.clients.find((item) => item.id === clientId);
          const session = blankSession(current.session.tier);
          session.clientId = clientId;
          if (client) session.title = `${client.name} session`;
          return {
            ...current,
            session,
            past: [],
            future: [],
            activePhaseId: session.phases[0].id,
            activeFrameId: session.phases[0].frames[0].id,
            selectedId: null,
            inspectorTab: "session",
            notice: client ? `New session for ${client.name}. Save it when the picture is ready.` : "New session.",
          };
        }),
    };
  }, [state]);

  return <EditorContext.Provider value={api}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorApi {
  const value = useContext(EditorContext);
  if (!value) throw new Error("useEditor must be used inside EditorProvider");
  return value;
}

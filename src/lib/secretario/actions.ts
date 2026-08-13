import type {
  Clase,
  Companerismo,
  ConsejoItem,
  Entrevista,
  EntrevistaEstado,
  Familia,
  LlamamientoConsideracion,
  LlamamientoEstado,
  Minuta,
  Rotacion,
  SecretarioData,
  Tarea,
} from "./types";
import { DEFAULT_CONSEJO_ITEMS } from "./defaults";
import { nowIso, nowTimeStr, todayDateStr } from "./format";

/* ---- Idioma ---- */
export function toggleLang(data: SecretarioData): SecretarioData {
  return { ...data, lang: data.lang === "es" ? "en" : "es" };
}

/* ---- Agenda ---- */
export function toggleAgendaItem(data: SecretarioData, i: number): SecretarioData {
  const agenda = data.agenda.map((it, idx) =>
    idx === i ? { ...it, done: !it.done } : it
  );
  return { ...data, agenda };
}
export function removeAgendaItem(data: SecretarioData, i: number): SecretarioData {
  return { ...data, agenda: data.agenda.filter((_, idx) => idx !== i) };
}
export function updateAgendaResp(
  data: SecretarioData,
  i: number,
  val: string
): SecretarioData {
  const agenda = data.agenda.map((it, idx) =>
    idx === i ? { ...it, resp: val } : it
  );
  return { ...data, agenda };
}
export function addAgendaItem(
  data: SecretarioData,
  text: string,
  resp: string
): SecretarioData {
  if (!text.trim()) return data;
  return {
    ...data,
    agenda: [...data.agenda, { text: text.trim(), done: false, resp: resp.trim() }],
  };
}
export function updateAgendaDate(data: SecretarioData, v: string): SecretarioData {
  return { ...data, agendaMeta: { ...data.agendaMeta, date: v } };
}
export function updateAgendaTime(data: SecretarioData, v: string): SecretarioData {
  return { ...data, agendaMeta: { ...data.agendaMeta, time: v } };
}
export function newMeeting(data: SecretarioData): SecretarioData {
  return {
    ...data,
    agendaHistory: [
      ...data.agendaHistory,
      {
        date: data.agendaMeta.date,
        time: data.agendaMeta.time,
        items: data.agenda.map((it) => ({ ...it })),
        archivedAt: nowIso(),
      },
    ],
    agenda: data.agenda.map((it) => ({ ...it, done: false, resp: "" })),
    agendaMeta: { date: todayDateStr(), time: nowTimeStr() },
  };
}

/* ---- Minutas ---- */
export function saveMinuta(data: SecretarioData, text: string): SecretarioData {
  if (!text.trim()) return data;
  const entry: Minuta = {
    date: nowIso(),
    text: text.trim(),
    history: [],
    editedAt: null,
    deleted: false,
    deletedAt: null,
  };
  return { ...data, minutas: [...data.minutas, entry] };
}
export function saveEditMinuta(
  data: SecretarioData,
  idx: number,
  newText: string
): SecretarioData {
  if (!newText.trim()) return data;
  const minutas = data.minutas.map((m, i) => {
    if (i !== idx) return m;
    return {
      ...m,
      history: [...m.history, { text: m.text, at: m.editedAt || m.date }],
      text: newText.trim(),
      editedAt: nowIso(),
    };
  });
  return { ...data, minutas };
}
export function deleteMinuta(data: SecretarioData, idx: number): SecretarioData {
  const minutas = data.minutas.map((m, i) =>
    i === idx ? { ...m, deleted: true, deletedAt: nowIso() } : m
  );
  return { ...data, minutas };
}
export function restoreMinuta(data: SecretarioData, idx: number): SecretarioData {
  const minutas = data.minutas.map((m, i) =>
    i === idx ? { ...m, deleted: false, deletedAt: null } : m
  );
  return { ...data, minutas };
}

/* ---- Tareas (asignaciones) ---- */
export function addTask(
  data: SecretarioData,
  who: string,
  what: string
): SecretarioData {
  if (!who.trim() || !what.trim()) return data;
  const entry: Tarea = {
    who: who.trim(),
    what: what.trim(),
    done: false,
    createdAt: nowIso(),
    history: [],
    editedAt: null,
    deleted: false,
    deletedAt: null,
  };
  return { ...data, tareas: [...data.tareas, entry] };
}
export function toggleTask(data: SecretarioData, i: number): SecretarioData {
  const tareas = data.tareas.map((x, idx) =>
    idx === i && !x.deleted ? { ...x, done: !x.done } : x
  );
  return { ...data, tareas };
}
export function saveEditTask(
  data: SecretarioData,
  i: number,
  who: string,
  what: string
): SecretarioData {
  if (!who.trim() || !what.trim()) return data;
  const tareas = data.tareas.map((task, idx) => {
    if (idx !== i) return task;
    return {
      ...task,
      history: [
        ...task.history,
        { who: task.who, what: task.what, at: task.editedAt || task.createdAt },
      ],
      who: who.trim(),
      what: what.trim(),
      editedAt: nowIso(),
    };
  });
  return { ...data, tareas };
}
export function deleteTask(data: SecretarioData, i: number): SecretarioData {
  const tareas = data.tareas.map((x, idx) =>
    idx === i ? { ...x, deleted: true, deletedAt: nowIso() } : x
  );
  return { ...data, tareas };
}
export function restoreTask(data: SecretarioData, i: number): SecretarioData {
  const tareas = data.tareas.map((x, idx) =>
    idx === i ? { ...x, deleted: false, deletedAt: null } : x
  );
  return { ...data, tareas };
}

/* ---- Ministración (compañerismos con familias/personas asignadas) ---- */
export function addComp(data: SecretarioData, names: string): SecretarioData {
  if (!names.trim()) return data;
  const entry: Companerismo = {
    names: names.trim(),
    asignaciones: [],
    createdAt: nowIso(),
    deleted: false,
    deletedAt: null,
  };
  return { ...data, ministracion: [...data.ministracion, entry] };
}
export function updateCompNames(
  data: SecretarioData,
  i: number,
  v: string
): SecretarioData {
  const ministracion = data.ministracion.map((c, idx) =>
    idx === i ? { ...c, names: v.trim() } : c
  );
  return { ...data, ministracion };
}
export function deleteComp(data: SecretarioData, i: number): SecretarioData {
  const ministracion = data.ministracion.map((c, idx) =>
    idx === i ? { ...c, deleted: true, deletedAt: nowIso() } : c
  );
  return { ...data, ministracion };
}
export function restoreComp(data: SecretarioData, i: number): SecretarioData {
  const ministracion = data.ministracion.map((c, idx) =>
    idx === i ? { ...c, deleted: false, deletedAt: null } : c
  );
  return { ...data, ministracion };
}
export function addFamily(
  data: SecretarioData,
  ci: number,
  family: string
): SecretarioData {
  if (!family.trim()) return data;
  const entry: Familia = {
    family: family.trim(),
    lastContact: null,
    createdAt: nowIso(),
    deleted: false,
    deletedAt: null,
  };
  const ministracion = data.ministracion.map((c, idx) =>
    idx === ci ? { ...c, asignaciones: [...c.asignaciones, entry] } : c
  );
  return { ...data, ministracion };
}
export function updateFamilyName(
  data: SecretarioData,
  ci: number,
  fi: number,
  v: string
): SecretarioData {
  const ministracion = data.ministracion.map((c, idx) => {
    if (idx !== ci) return c;
    const asignaciones = c.asignaciones.map((f, fidx) =>
      fidx === fi ? { ...f, family: v.trim() } : f
    );
    return { ...c, asignaciones };
  });
  return { ...data, ministracion };
}
export function markFamilyVisited(
  data: SecretarioData,
  ci: number,
  fi: number
): SecretarioData {
  const ministracion = data.ministracion.map((c, idx) => {
    if (idx !== ci) return c;
    const asignaciones = c.asignaciones.map((f, fidx) =>
      fidx === fi ? { ...f, lastContact: nowIso() } : f
    );
    return { ...c, asignaciones };
  });
  return { ...data, ministracion };
}
export function deleteFamily(
  data: SecretarioData,
  ci: number,
  fi: number
): SecretarioData {
  const ministracion = data.ministracion.map((c, idx) => {
    if (idx !== ci) return c;
    const asignaciones = c.asignaciones.map((f, fidx) =>
      fidx === fi ? { ...f, deleted: true, deletedAt: nowIso() } : f
    );
    return { ...c, asignaciones };
  });
  return { ...data, ministracion };
}
export function restoreFamily(
  data: SecretarioData,
  ci: number,
  fi: number
): SecretarioData {
  const ministracion = data.ministracion.map((c, idx) => {
    if (idx !== ci) return c;
    const asignaciones = c.asignaciones.map((f, fidx) =>
      fidx === fi ? { ...f, deleted: false, deletedAt: null } : f
    );
    return { ...c, asignaciones };
  });
  return { ...data, ministracion };
}
export function getAllActiveFamilies(
  data: SecretarioData
): { compNames: string; family: string; lastContact: string | null }[] {
  const out: { compNames: string; family: string; lastContact: string | null }[] = [];
  data.ministracion
    .filter((c) => !c.deleted)
    .forEach((c) => {
      c.asignaciones
        .filter((f) => !f.deleted)
        .forEach((f) => {
          out.push({ compNames: c.names, family: f.family, lastContact: f.lastContact });
        });
    });
  return out;
}

/* ---- Entrevistas (Secretario Ejecutivo) ---- */
export function addEntrevista(
  data: SecretarioData,
  nombre: string,
  motivo: string,
  fecha: string
): SecretarioData {
  if (!nombre.trim() || !motivo.trim()) return data;
  const entry: Entrevista = {
    nombre: nombre.trim(),
    motivo: motivo.trim(),
    fecha: fecha || "",
    estado: "pendiente",
    createdAt: nowIso(),
    history: [],
    editedAt: null,
    deleted: false,
    deletedAt: null,
  };
  return { ...data, entrevistas: [...data.entrevistas, entry] };
}
const ENTREVISTA_ORDER: EntrevistaEstado[] = ["pendiente", "agendada", "hecha"];
export function cycleEstadoEntrevista(data: SecretarioData, i: number): SecretarioData {
  const entrevistas = data.entrevistas.map((x, idx) => {
    if (idx !== i || x.deleted) return x;
    const cur = ENTREVISTA_ORDER.indexOf(x.estado);
    return { ...x, estado: ENTREVISTA_ORDER[(cur + 1) % ENTREVISTA_ORDER.length] };
  });
  return { ...data, entrevistas };
}
export function saveEditEntrevista(
  data: SecretarioData,
  i: number,
  nombre: string,
  motivo: string,
  fecha: string
): SecretarioData {
  if (!nombre.trim() || !motivo.trim()) return data;
  const entrevistas = data.entrevistas.map((x, idx) => {
    if (idx !== i) return x;
    return {
      ...x,
      history: [
        ...x.history,
        { nombre: x.nombre, motivo: x.motivo, at: x.editedAt || x.createdAt },
      ],
      nombre: nombre.trim(),
      motivo: motivo.trim(),
      fecha: fecha || "",
      editedAt: nowIso(),
    };
  });
  return { ...data, entrevistas };
}
export function deleteEntrevista(data: SecretarioData, i: number): SecretarioData {
  const entrevistas = data.entrevistas.map((x, idx) =>
    idx === i ? { ...x, deleted: true, deletedAt: nowIso() } : x
  );
  return { ...data, entrevistas };
}
export function restoreEntrevista(data: SecretarioData, i: number): SecretarioData {
  const entrevistas = data.entrevistas.map((x, idx) =>
    idx === i ? { ...x, deleted: false, deletedAt: null } : x
  );
  return { ...data, entrevistas };
}

/* ---- Consejo de barrio (Secretario de Obispado) ---- */
export function toggleConsejoItem(data: SecretarioData, i: number): SecretarioData {
  const items = data.consejo.current.items.map((it, idx) =>
    idx === i ? { ...it, done: !it.done } : it
  );
  return { ...data, consejo: { ...data.consejo, current: { ...data.consejo.current, items } } };
}
export function removeConsejoItem(data: SecretarioData, i: number): SecretarioData {
  const items = data.consejo.current.items.filter((_, idx) => idx !== i);
  return { ...data, consejo: { ...data.consejo, current: { ...data.consejo.current, items } } };
}
export function addConsejoItem(data: SecretarioData, text: string): SecretarioData {
  if (!text.trim()) return data;
  const items: ConsejoItem[] = [...data.consejo.current.items, { text: text.trim(), done: false }];
  return { ...data, consejo: { ...data.consejo, current: { ...data.consejo.current, items } } };
}
export function updateConsejoDate(data: SecretarioData, v: string): SecretarioData {
  return { ...data, consejo: { ...data.consejo, current: { ...data.consejo.current, date: v } } };
}
export function updateConsejoTime(data: SecretarioData, v: string): SecretarioData {
  return { ...data, consejo: { ...data.consejo, current: { ...data.consejo.current, time: v } } };
}
export function updateConsejoNotas(data: SecretarioData, v: string): SecretarioData {
  return { ...data, consejo: { ...data.consejo, current: { ...data.consejo.current, notas: v } } };
}
export function archiveConsejo(data: SecretarioData): SecretarioData {
  const cur = data.consejo.current;
  return {
    ...data,
    consejo: {
      history: [
        ...data.consejo.history,
        {
          date: cur.date,
          time: cur.time,
          items: cur.items.map((it) => ({ ...it })),
          notas: cur.notas,
          archivedAt: nowIso(),
        },
      ],
      current: {
        date: todayDateStr(),
        time: nowTimeStr(),
        items: cur.items.map((it) => ({ text: it.text, done: false })),
        notas: "",
      },
    },
  };
}
export function resetConsejoItemsForLang(data: SecretarioData): SecretarioData {
  if (data.consejo.current.items.length > 0) return data;
  return {
    ...data,
    consejo: {
      ...data.consejo,
      current: {
        ...data.consejo.current,
        items: DEFAULT_CONSEJO_ITEMS[data.lang].map((text) => ({ text, done: false })),
      },
    },
  };
}

/* ---- Clases y maestros (Escuela Dominical) ---- */
export function addClase(
  data: SecretarioData,
  clase: string,
  maestro: string
): SecretarioData {
  if (!clase.trim()) return data;
  const entry: Clase = {
    clase: clase.trim(),
    maestro: maestro.trim(),
    createdAt: nowIso(),
    history: [],
    editedAt: null,
    deleted: false,
    deletedAt: null,
  };
  return { ...data, clases: [...data.clases, entry] };
}
export function saveEditClase(
  data: SecretarioData,
  i: number,
  clase: string,
  maestro: string
): SecretarioData {
  if (!clase.trim()) return data;
  const clases = data.clases.map((c, idx) => {
    if (idx !== i) return c;
    return {
      ...c,
      history: [
        ...c.history,
        { clase: c.clase, maestro: c.maestro, at: c.editedAt || c.createdAt },
      ],
      clase: clase.trim(),
      maestro: maestro.trim(),
      editedAt: nowIso(),
    };
  });
  return { ...data, clases };
}
export function deleteClase(data: SecretarioData, i: number): SecretarioData {
  const clases = data.clases.map((c, idx) =>
    idx === i ? { ...c, deleted: true, deletedAt: nowIso() } : c
  );
  return { ...data, clases };
}
export function restoreClase(data: SecretarioData, i: number): SecretarioData {
  const clases = data.clases.map((c, idx) =>
    idx === i ? { ...c, deleted: false, deletedAt: null } : c
  );
  return { ...data, clases };
}

/* ---- Llamamientos en consideración ---- */
export function addLlamamiento(
  data: SecretarioData,
  persona: string,
  llamamiento: string
): SecretarioData {
  if (!persona.trim() || !llamamiento.trim()) return data;
  const entry: LlamamientoConsideracion = {
    persona: persona.trim(),
    llamamiento: llamamiento.trim(),
    estado: "orando",
    createdAt: nowIso(),
    history: [],
    editedAt: null,
    deleted: false,
    deletedAt: null,
  };
  return { ...data, llamamientos: [...data.llamamientos, entry] };
}
const LLAMAMIENTO_ORDER: LlamamientoEstado[] = ["orando", "propuesto", "extendido"];
export function cycleLlamamientoEstado(data: SecretarioData, i: number): SecretarioData {
  const llamamientos = data.llamamientos.map((x, idx) => {
    if (idx !== i || x.deleted) return x;
    const cur = LLAMAMIENTO_ORDER.indexOf(x.estado);
    return { ...x, estado: LLAMAMIENTO_ORDER[(cur + 1) % LLAMAMIENTO_ORDER.length] };
  });
  return { ...data, llamamientos };
}
export function saveEditLlamamiento(
  data: SecretarioData,
  i: number,
  persona: string,
  llamamiento: string
): SecretarioData {
  if (!persona.trim() || !llamamiento.trim()) return data;
  const llamamientos = data.llamamientos.map((x, idx) => {
    if (idx !== i) return x;
    return {
      ...x,
      history: [
        ...x.history,
        { persona: x.persona, llamamiento: x.llamamiento, at: x.editedAt || x.createdAt },
      ],
      persona: persona.trim(),
      llamamiento: llamamiento.trim(),
      editedAt: nowIso(),
    };
  });
  return { ...data, llamamientos };
}
export function deleteLlamamiento(data: SecretarioData, i: number): SecretarioData {
  const llamamientos = data.llamamientos.map((x, idx) =>
    idx === i ? { ...x, deleted: true, deletedAt: nowIso() } : x
  );
  return { ...data, llamamientos };
}
export function restoreLlamamiento(data: SecretarioData, i: number): SecretarioData {
  const llamamientos = data.llamamientos.map((x, idx) =>
    idx === i ? { ...x, deleted: false, deletedAt: null } : x
  );
  return { ...data, llamamientos };
}

/* ---- Rotaciones (asignaciones recurrentes) ---- */
export function addRotacion(
  data: SecretarioData,
  tarea: string,
  personasRaw: string
): SecretarioData {
  const personas = personasRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!tarea.trim() || !personas.length) return data;
  const entry: Rotacion = {
    tarea: tarea.trim(),
    personas,
    turnoActual: 0,
    turnHistory: [],
    createdAt: nowIso(),
    history: [],
    editedAt: null,
    deleted: false,
    deletedAt: null,
  };
  return { ...data, rotaciones: [...data.rotaciones, entry] };
}
export function avanzarTurno(data: SecretarioData, i: number): SecretarioData {
  const rotaciones = data.rotaciones.map((r, idx) => {
    if (idx !== i || r.deleted || !r.personas.length) return r;
    return {
      ...r,
      turnHistory: [
        ...r.turnHistory,
        { persona: r.personas[r.turnoActual], fecha: nowIso() },
      ],
      turnoActual: (r.turnoActual + 1) % r.personas.length,
    };
  });
  return { ...data, rotaciones };
}
export function saveEditRotacion(
  data: SecretarioData,
  i: number,
  tarea: string,
  personasRaw: string
): SecretarioData {
  const personas = personasRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!tarea.trim() || !personas.length) return data;
  const rotaciones = data.rotaciones.map((r, idx) => {
    if (idx !== i) return r;
    return {
      ...r,
      history: [
        ...r.history,
        { tarea: r.tarea, personas: r.personas, at: r.editedAt || r.createdAt },
      ],
      tarea: tarea.trim(),
      personas,
      turnoActual: r.turnoActual >= personas.length ? 0 : r.turnoActual,
      editedAt: nowIso(),
    };
  });
  return { ...data, rotaciones };
}
export function deleteRotacion(data: SecretarioData, i: number): SecretarioData {
  const rotaciones = data.rotaciones.map((r, idx) =>
    idx === i ? { ...r, deleted: true, deletedAt: nowIso() } : r
  );
  return { ...data, rotaciones };
}
export function restoreRotacion(data: SecretarioData, i: number): SecretarioData {
  const rotaciones = data.rotaciones.map((r, idx) =>
    idx === i ? { ...r, deleted: false, deletedAt: null } : r
  );
  return { ...data, rotaciones };
}

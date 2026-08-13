export type Lang = "es" | "en";

export type AgendaItem = { text: string; done: boolean; resp: string };
export type AgendaMeta = { date: string; time: string };
export type AgendaHistoryEntry = {
  date: string;
  time: string;
  items: AgendaItem[];
  archivedAt: string;
};

export type Trashable = {
  deleted: boolean;
  deletedAt: string | null;
};

export type Editable<H> = Trashable & {
  createdAt: string;
  editedAt: string | null;
  history: H[];
};

export type Minuta = Trashable & {
  date: string;
  text: string;
  editedAt: string | null;
  history: { text: string; at: string }[];
};

export type Tarea = Editable<{ who: string; what: string; at: string }> & {
  who: string;
  what: string;
  done: boolean;
};

export type Familia = Trashable & {
  family: string;
  lastContact: string | null;
  createdAt: string;
};

export type Companerismo = Trashable & {
  names: string;
  createdAt: string;
  asignaciones: Familia[];
};

export type EntrevistaEstado = "pendiente" | "agendada" | "hecha";
export type Entrevista = Editable<{
  nombre: string;
  motivo: string;
  at: string;
}> & {
  nombre: string;
  motivo: string;
  fecha: string;
  estado: EntrevistaEstado;
};

export type ConsejoItem = { text: string; done: boolean };
export type ConsejoActual = {
  date: string;
  time: string;
  items: ConsejoItem[];
  notas: string;
};
export type ConsejoHistoryEntry = {
  date: string;
  time: string;
  items: ConsejoItem[];
  notas: string;
  archivedAt: string;
};

export type Clase = Editable<{
  clase: string;
  maestro: string;
  at: string;
}> & {
  clase: string;
  maestro: string;
};

export type LlamamientoEstado = "orando" | "propuesto" | "extendido";
export type LlamamientoConsideracion = Editable<{
  persona: string;
  llamamiento: string;
  at: string;
}> & {
  persona: string;
  llamamiento: string;
  estado: LlamamientoEstado;
};

export type Rotacion = Editable<{
  tarea: string;
  personas: string[];
  at: string;
}> & {
  tarea: string;
  personas: string[];
  turnoActual: number;
  turnHistory: { persona: string; fecha: string }[];
};

export type SecretarioData = {
  lang: Lang;
  agenda: AgendaItem[];
  agendaMeta: AgendaMeta;
  agendaHistory: AgendaHistoryEntry[];
  minutas: Minuta[];
  tareas: Tarea[];
  ministracion: Companerismo[];
  entrevistas: Entrevista[];
  clases: Clase[];
  llamamientos: LlamamientoConsideracion[];
  rotaciones: Rotacion[];
  consejo: { current: ConsejoActual; history: ConsejoHistoryEntry[] };
};

export type SecretarioTab =
  | "hoy"
  | "agenda"
  | "minutas"
  | "tareas"
  | "llamamientos"
  | "rotaciones"
  | "ministracion"
  | "entrevistas"
  | "consejo"
  | "clases"
  | "reporte";

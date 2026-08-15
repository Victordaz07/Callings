import type { Lang, SecretarioData } from "./types";
import { nowTimeStr, todayDateStr } from "./format";

export const DEFAULT_AGENDA: Record<Lang, string[]> = {
  es: [
    "Oración de apertura",
    "Revisión de asignaciones anteriores",
    "Necesidades de ministración",
    "Bienestar y autosuficiencia",
    "Actividades y calendario",
    "Nuevos miembros y menos activos",
    "Oración de clausura",
  ],
  en: [
    "Opening prayer",
    "Review of previous assignments",
    "Ministering needs",
    "Welfare and self-reliance",
    "Activities and calendar",
    "New and less-active members",
    "Closing prayer",
  ],
};

export const DEFAULT_CONSEJO_ITEMS: Record<Lang, string[]> = {
  es: [
    "Obispado",
    "Cuórum de Élderes",
    "Sociedad de Socorro",
    "Escuela Dominical",
    "Mutual",
    "Primaria",
    "Secretario ejecutivo",
  ],
  en: [
    "Bishopric",
    "Elders Quorum",
    "Relief Society",
    "Sunday School",
    "Young Men/Young Women",
    "Primary",
    "Executive secretary",
  ],
};

export function defaultSecretarioData(lang: Lang = "es"): SecretarioData {
  return {
    lang,
    agenda: DEFAULT_AGENDA[lang].map((text) => ({ text, done: false, resp: "" })),
    agendaMeta: { date: todayDateStr(), time: nowTimeStr() },
    agendaHistory: [],
    minutas: [],
    tareas: [],
    ministracion: [],
    entrevistas: [],
    clases: [],
    llamamientos: [],
    rotaciones: [],
    consejo: {
      current: {
        date: todayDateStr(),
        time: nowTimeStr(),
        items: DEFAULT_CONSEJO_ITEMS[lang].map((text) => ({ text, done: false })),
        notas: "",
      },
      history: [],
    },
  };
}

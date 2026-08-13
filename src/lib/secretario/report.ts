import type { AgendaItem, AgendaMeta, Lang, SecretarioData } from "./types";
import { translate } from "./translations";
import { daysSince, fmtDateOnly } from "./format";
import { getAllActiveFamilies } from "./actions";

export function buildAgendaText(
  meta: AgendaMeta,
  items: AgendaItem[],
  lang: Lang
): string {
  const dateLabel =
    fmtDateOnly(meta.date, lang) + (meta.time ? ` · ${meta.time}` : "");
  const lines = [
    translate(lang, "agendaShareHeader"),
    `${translate(lang, "agendaShareDate")} ${dateLabel}`,
    "",
  ];
  items.forEach((it) => {
    const mark = it.done ? "✅" : "⬜";
    const resp = it.resp ? ` — ${translate(lang, "respPh")}: ${it.resp}` : "";
    lines.push(`${mark} ${it.text}${resp}`);
  });
  return lines.join("\n");
}

export function buildReportText(data: SecretarioData): string {
  const lang = data.lang;
  const t = (k: Parameters<typeof translate>[1]) => translate(lang, k);
  const now = new Date();
  const inMonth = (d: string) =>
    new Date(d).getMonth() === now.getMonth() &&
    new Date(d).getFullYear() === now.getFullYear();

  const activeTareas = data.tareas.filter((x) => !x.deleted);
  const activeMinFamilies = getAllActiveFamilies(data);
  const done = activeTareas.filter((x) => x.done);
  const pending = activeTareas.filter((x) => !x.done);
  const attn = activeMinFamilies.filter((f) => {
    const d = daysSince(f.lastContact);
    return d === null || d > 30;
  });
  const minutasMonth = data.minutas.filter((m) => !m.deleted && inMonth(m.date));

  const lines: string[] = [
    `${t("reportHeader")} — ${now.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" })}`,
    "",
    `${t("reportMinutas")} ${minutasMonth.length}`,
    "",
    `${t("reportTasksDone")} ${done.length ? "" : "—"}`,
    ...done.map((x) => `  ✓ ${x.who}: ${x.what}`),
    "",
    `${t("reportTasksPending")} ${pending.length ? "" : "—"}`,
    ...pending.map((x) => `  · ${x.who}: ${x.what}`),
    "",
  ];

  if (activeMinFamilies.length) {
    lines.push(
      `${t("reportMinAttn")} ${attn.length ? "" : "—"}`,
      ...attn.map((f) => `  ! ${f.compNames} → ${f.family}`),
      ""
    );
  }

  const activeEnt = data.entrevistas.filter((x) => !x.deleted && x.estado !== "hecha");
  if (data.entrevistas.some((x) => !x.deleted)) {
    lines.push(
      `${t("reportEntrevistas")} ${activeEnt.length ? "" : "—"}`,
      ...activeEnt.map(
        (x) => `  · ${x.nombre} — ${x.motivo}${x.fecha ? ` (${fmtDateOnly(x.fecha, lang)})` : ""}`
      ),
      ""
    );
  }

  const clasesSinMaestro = data.clases.filter(
    (c) => !c.deleted && !(c.maestro && c.maestro.trim())
  );
  if (data.clases.some((c) => !c.deleted)) {
    lines.push(
      `${t("reportClasesSinMaestro")} ${clasesSinMaestro.length ? "" : "—"}`,
      ...clasesSinMaestro.map((c) => `  · ${c.clase}`),
      ""
    );
  }

  if (data.consejo.history.length) {
    const last = data.consejo.history[data.consejo.history.length - 1];
    const presentCount = last.items.filter((it) => it.done).length;
    lines.push(
      `${t("reportConsejo")} ${fmtDateOnly(last.date, lang)} — ${presentCount}/${last.items.length} ${t("presentesOf")}`,
      ""
    );
  }

  const activeRot = data.rotaciones.filter((r) => !r.deleted);
  if (activeRot.length) {
    lines.push(
      t("reportRotaciones"),
      ...activeRot.map((r) => `  · ${r.tarea}: ${r.personas[r.turnoActual] || "—"}`),
      ""
    );
  }

  return lines.join("\n");
}

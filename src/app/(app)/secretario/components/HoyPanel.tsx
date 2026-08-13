"use client";

import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import { daysSince, fmtDateOnly } from "@/lib/secretario/format";
import { getAllActiveFamilies } from "@/lib/secretario/actions";
import type { CallingRole } from "@/lib/settings";
import type { SecretarioTab } from "@/lib/secretario/types";

const DAY_NAMES: Record<"es" | "en", string[]> = {
  es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

export function HoyPanel({ roles }: { roles: CallingRole[] }) {
  const t = useT();
  const lang = useLang();
  const data = useSecretarioStore((s) => s.data);
  const setTab = useSecretarioStore((s) => s.setTab);

  if (roles.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-deep-water to-water-mid p-[18px] text-linen">
        <h2 className="font-display text-xl font-semibold">{t("hoyTitle")}</h2>
        <p className="mt-1 text-sm opacity-90">{t("hoyNoRole")}</p>
      </div>
    );
  }

  const now = new Date();
  const dayName = DAY_NAMES[lang][now.getDay()];
  const dateLabel = now.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
  });

  const pendingTasks = data.tareas.filter((x) => !x.deleted && !x.done);
  const attnMin = roles.includes("cuorum_sds")
    ? getAllActiveFamilies(data).filter((f) => {
        const d = daysSince(f.lastContact);
        return d === null || d > 30;
      })
    : [];
  const activeEnt = roles.includes("ejecutivo")
    ? data.entrevistas.filter((x) => !x.deleted && x.estado !== "hecha")
    : [];
  const clasesSinMaestro = roles.includes("ed")
    ? data.clases.filter((c) => !c.deleted && !(c.maestro && c.maestro.trim()))
    : [];
  const activeLlam = data.llamamientos.filter((x) => !x.deleted);
  const activeRot = data.rotaciones.filter((r) => !r.deleted);
  const minutasMonth = data.minutas.filter(
    (m) => !m.deleted && new Date(m.date).getMonth() === now.getMonth() && new Date(m.date).getFullYear() === now.getFullYear()
  ).length;

  const totalUrgent = pendingTasks.length + attnMin.length + activeEnt.length + clasesSinMaestro.length;

  const statCards: { num: number; label: string; tone: "warn" | "ok" | ""; tab: SecretarioTab }[] = [
    { num: pendingTasks.length, label: t("statAsign"), tone: pendingTasks.length > 0 ? "warn" : "ok", tab: "tareas" },
  ];
  if (roles.includes("cuorum_sds"))
    statCards.push({ num: attnMin.length, label: t("statAlert"), tone: attnMin.length > 0 ? "warn" : "ok", tab: "ministracion" });
  if (roles.includes("ejecutivo"))
    statCards.push({ num: activeEnt.length, label: t("tabEntrevistas"), tone: activeEnt.length > 0 ? "warn" : "ok", tab: "entrevistas" });
  if (roles.includes("ed"))
    statCards.push({ num: clasesSinMaestro.length, label: t("sinMaestro"), tone: clasesSinMaestro.length > 0 ? "warn" : "ok", tab: "clases" });
  statCards.push({ num: activeLlam.length, label: t("tabLlamamientos"), tone: "", tab: "llamamientos" });
  statCards.push({ num: minutasMonth, label: t("statMin"), tone: "", tab: "minutas" });

  const sections: { title: string; items: { icon: string; text: React.ReactNode; sub?: string; tab: SecretarioTab }[] }[] = [];
  if (pendingTasks.length)
    sections.push({
      title: t("tareasTitle"),
      items: pendingTasks.slice(0, 5).map((x) => ({ icon: "📌", text: <><b>{x.who}</b>: {x.what}</>, tab: "tareas" as const })),
    });
  if (attnMin.length)
    sections.push({
      title: t("minTitle"),
      items: attnMin.slice(0, 5).map((f) => ({ icon: "🧭", text: <><b>{f.compNames}</b> → {f.family}</>, tab: "ministracion" as const })),
    });
  if (activeEnt.length)
    sections.push({
      title: t("tabEntrevistas"),
      items: activeEnt.slice(0, 5).map((x) => ({
        icon: "🗓️",
        text: <><b>{x.nombre}</b> — {x.motivo}</>,
        sub: x.fecha ? fmtDateOnly(x.fecha, lang) : undefined,
        tab: "entrevistas" as const,
      })),
    });
  if (clasesSinMaestro.length)
    sections.push({
      title: t("tabClases"),
      items: clasesSinMaestro.slice(0, 5).map((c) => ({ icon: "📚", text: <><b>{c.clase}</b> — {t("sinMaestro")}</>, tab: "clases" as const })),
    });

  const doneItems = data.agenda.filter((it) => it.done).length;
  const totalItems = data.agenda.length;
  const pct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

  const consejoLast = data.consejo.history.length ? data.consejo.history[data.consejo.history.length - 1] : null;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-deep-water to-water-mid p-[18px] text-linen">
        <div className="text-[11px] font-bold tracking-[0.06em] uppercase opacity-80">
          {dayName}, {dateLabel}
        </div>
        <h2 className="mt-1 font-display text-xl font-semibold text-white">{t("hoyTitle")}</h2>
        <p className="mt-0.5 text-[13px] opacity-90">
          {totalUrgent > 0
            ? lang === "es"
              ? `${totalUrgent} cosas requieren tu atención`
              : `${totalUrgent} things need your attention`
            : `${t("allCaughtUp")} 🎉`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {statCards.map((sc, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setTab(sc.tab)}
            className="rounded-xl border border-line-card bg-white p-3.5 text-left active:scale-[0.97]"
          >
            <div
              className={`font-display text-[1.9rem] leading-none font-bold ${sc.tone === "warn" ? "text-rojo" : sc.tone === "ok" ? "text-sage" : "text-deep-water"}`}
            >
              {sc.num}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-muted-2">{sc.label}</div>
          </button>
        ))}
      </div>

      {sections.length ? (
        <div className="rounded-[14px] border border-line-card bg-white p-3.5">
          {sections.map((s, i) => (
            <div key={i}>
              <div className={`text-[11px] font-bold tracking-[0.04em] text-dawn-coral uppercase ${i === 0 ? "" : "mt-3.5"}`}>
                {s.title}
              </div>
              {s.items.map((it, j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setTab(it.tab)}
                  className="flex w-full items-start gap-2.5 border-b border-dashed border-line-card py-2 text-left last:border-b-0"
                >
                  <span className="w-[22px] shrink-0 text-center text-base">{it.icon}</span>
                  <span className="min-w-0 flex-1 text-sm text-ink">
                    {it.text}
                    {it.sub ? <div className="mt-0.5 text-[11px] text-muted">{it.sub}</div> : null}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[14px] border border-line-card bg-white px-2.5 py-6 text-center">
          <div className="mb-1.5 text-2xl">✅</div>
          <div className="text-sm font-bold text-deep-water">{t("allCaughtUp")}</div>
          <div className="mt-1 text-[13px] text-muted-2">{t("allCaughtUpSub")}</div>
        </div>
      )}

      <div className="rounded-[14px] border border-line-card bg-white p-3.5">
        <div className="flex items-start justify-between gap-2.5">
          <div>
            <h2 className="text-[15px] font-semibold text-deep-water">{t("agendaTitle")}</h2>
            <p className="text-[13px] text-muted-2">
              {data.agendaMeta.date ? fmtDateOnly(data.agendaMeta.date, lang) : ""}
              {data.agendaMeta.time ? ` · ${data.agendaMeta.time}` : ""}
            </p>
          </div>
          <button type="button" onClick={() => setTab("agenda")} className="rounded-lg border border-line-card bg-white px-3 py-2 text-xs font-bold text-water-mid">
            {t("goTo")}
          </button>
        </div>
        {totalItems ? (
          <>
            <div className="mt-2 text-[13px] text-muted-2">
              {doneItems}/{totalItems} {t("hoyAgendaLine")} · {pct}%
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-md bg-linen-dim">
              <div className="h-full bg-living-teal transition-all" style={{ width: `${pct}%` }} />
            </div>
          </>
        ) : (
          <div className="pt-1.5 text-sm text-muted italic">{t("hoyNoAgenda")}</div>
        )}
      </div>

      {activeRot.length ? (
        <div className="rounded-[14px] border border-line-card bg-white p-3.5">
          <h2 className="text-[15px] font-semibold text-deep-water">{t("rotacionesTitle")}</h2>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {activeRot.map((r, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTab("rotaciones")}
                className="rounded-full border border-line-card bg-linen px-3 py-1.5 text-[13px] text-water-mid"
              >
                <b className="text-deep-water">{r.tarea}:</b> {r.personas[r.turnoActual] || "—"}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {roles.includes("obispado") ? (
        <div className="rounded-[14px] border border-line-card bg-white p-3.5">
          <div className="flex items-start justify-between gap-2.5">
            <h2 className="text-[15px] font-semibold text-deep-water">{t("consejoTitle")}</h2>
            <button type="button" onClick={() => setTab("consejo")} className="rounded-lg border border-line-card bg-white px-3 py-2 text-xs font-bold text-water-mid">
              {t("goTo")}
            </button>
          </div>
          {consejoLast ? (
            <div className="mt-1.5 text-sm">
              {fmtDateOnly(consejoLast.date, lang)} — {consejoLast.items.filter((it) => it.done).length}/{consejoLast.items.length} {t("presentesOf")}
            </div>
          ) : (
            <div className="pt-1.5 text-sm text-muted italic">{t("hoyConsejoEmpty")}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

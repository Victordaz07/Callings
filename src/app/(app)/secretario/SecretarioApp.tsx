"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import * as actions from "@/lib/secretario/actions";
import type { SecretarioData, SecretarioTab } from "@/lib/secretario/types";
import type { CallingRole } from "@/lib/settings";
import { persistSecretario } from "./data-actions";
import { HoyPanel } from "./components/HoyPanel";
import { AgendaPanel } from "./components/AgendaPanel";
import { MinutasPanel } from "./components/MinutasPanel";
import { TareasPanel } from "./components/TareasPanel";
import { MinistracionPanel } from "./components/MinistracionPanel";
import { EntrevistasPanel } from "./components/EntrevistasPanel";
import { ConsejoPanel } from "./components/ConsejoPanel";
import { ClasesPanel } from "./components/ClasesPanel";
import { LlamamientosPanel } from "./components/LlamamientosPanel";
import { RotacionesPanel } from "./components/RotacionesPanel";
import { ReportePanel } from "./components/ReportePanel";

const ROLE_TAB: Record<CallingRole, SecretarioTab> = {
  cuorum_sds: "ministracion",
  ejecutivo: "entrevistas",
  obispado: "consejo",
  ed: "clases",
};

const TAB_LABEL_KEY: Record<SecretarioTab, Parameters<ReturnType<typeof useT>>[0]> = {
  hoy: "tabHoy",
  agenda: "tabAgenda",
  minutas: "tabMinutas",
  tareas: "tabTareas",
  llamamientos: "tabLlamamientos",
  rotaciones: "tabRotaciones",
  ministracion: "tabMin",
  entrevistas: "tabEntrevistas",
  consejo: "tabConsejo",
  clases: "tabClases",
  reporte: "tabReporte",
};

export function SecretarioApp({
  initialData,
  roles,
}: {
  initialData: SecretarioData;
  roles: CallingRole[];
}) {
  const hydrate = useSecretarioStore((s) => s.hydrate);
  const hydrated = useSecretarioStore((s) => s.hydrated);
  const data = useSecretarioStore((s) => s.data);
  const apply = useSecretarioStore((s) => s.apply);
  const currentTab = useSecretarioStore((s) => s.currentTab);
  const setTab = useSecretarioStore((s) => s.setTab);
  const toast = useSecretarioStore((s) => s.toast);
  const t = useT();
  const lang = useLang();

  useEffect(() => {
    hydrate(initialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!hydrated) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persistSecretario(data).catch(() => {
        // el guardado se reintentará en el próximo cambio
      });
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, hydrated]);

  const tabs = useMemo<SecretarioTab[]>(() => {
    const specific = Array.from(new Set(roles.map((r) => ROLE_TAB[r]).filter(Boolean)));
    return ["hoy", "agenda", "minutas", "tareas", "llamamientos", "rotaciones", ...specific, "reporte"];
  }, [roles]);

  const activeTab = tabs.includes(currentTab) ? currentTab : "hoy";

  if (!hydrated) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted-2">…</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-water-mid px-5 pt-3.5 pb-3 text-linen">
        <div className="flex items-center gap-3 pb-3">
          <div className="flex-1">
            <div className="text-[11px] font-bold tracking-[0.14em] text-[#9BC7C4] uppercase">
              Secretario
            </div>
            <h1 className="font-display text-2xl font-medium leading-tight">{t(TAB_LABEL_KEY[activeTab])}</h1>
          </div>
          <button
            type="button"
            onClick={() => apply((d) => actions.toggleLang(d))}
            className="rounded-lg border border-white/25 bg-white/14 px-2.5 py-1.5 text-xs font-bold"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
        </div>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTab(tab)}
              className={`shrink-0 whitespace-nowrap rounded-full px-[15px] py-2 text-[13px] font-bold ${
                activeTab === tab
                  ? "bg-linen text-deep-water"
                  : "border border-white/24 bg-white/14 text-linen"
              }`}
            >
              {t(TAB_LABEL_KEY[tab])}
            </button>
          ))}
        </div>
      </header>

      <div className="rounded-b-none bg-mist/40 px-3.5 py-2 text-[12px] leading-relaxed text-water-mid">
        <b className="text-deep-water">{lang === "es" ? "Privacidad:" : "Privacy:"}</b> {t("privacy")}
      </div>

      <main className="flex-1 px-3.5 pt-2 pb-6">
        {activeTab === "hoy" ? <HoyPanel roles={roles} /> : null}
        {activeTab === "agenda" ? <AgendaPanel /> : null}
        {activeTab === "minutas" ? <MinutasPanel /> : null}
        {activeTab === "tareas" ? <TareasPanel /> : null}
        {activeTab === "ministracion" ? <MinistracionPanel /> : null}
        {activeTab === "entrevistas" ? <EntrevistasPanel /> : null}
        {activeTab === "consejo" ? <ConsejoPanel /> : null}
        {activeTab === "clases" ? <ClasesPanel /> : null}
        {activeTab === "llamamientos" ? <LlamamientosPanel /> : null}
        {activeTab === "rotaciones" ? <RotacionesPanel /> : null}
        {activeTab === "reporte" ? <ReportePanel /> : null}
      </main>

      {toast ? (
        <div className="fixed bottom-[86px] left-1/2 z-50 -translate-x-1/2 rounded-full bg-deep-water px-[18px] py-2.5 text-sm text-linen shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

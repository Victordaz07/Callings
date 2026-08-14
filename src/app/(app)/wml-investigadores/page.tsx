"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SemaforoDot } from "@/components/SemaforoDot";
import { daysSince } from "@/lib/daysSince";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Etapa = "contacto_inicial" | "lecciones" | "fecha_bautismo" | "bautizado";

type InvestigadorData = {
  iniciales: string;
  ensenantes: string;
  etapa: Etapa;
  fechaBautismoPropuesta: string;
  ultimoContacto: string | null;
  nota: string;
};

const ETAPA_ORDER: Etapa[] = ["contacto_inicial", "lecciones", "fecha_bautismo", "bautizado"];
const ETAPA_LABEL: Record<Etapa, string> = {
  contacto_inicial: "Contacto inicial",
  lecciones: "En lecciones",
  fecha_bautismo: "Fecha propuesta",
  bautizado: "Bautizado",
};
const ETAPA_TONE: Record<Etapa, string> = {
  contacto_inicial: "bg-badge-draft-bg text-badge-draft-text",
  lecciones: "bg-badge-progress-bg text-badge-progress-text",
  fecha_bautismo: "bg-badge-pending-bg text-badge-pending-text",
  bautizado: "bg-badge-done-bg text-badge-done-text",
};

export default function WmlInvestigadoresPage() {
  const mod = useSyncModule<InvestigadorData>(MODULES.WML_INVESTIGADORES);
  const [iniciales, setIniciales] = useState("");
  const [ensenantes, setEnsenantes] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!iniciales.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        iniciales: iniciales.trim(),
        ensenantes: ensenantes.trim(),
        etapa: "contacto_inicial",
        fechaBautismoPropuesta: "",
        ultimoContacto: null,
        nota: "",
      });
      setIniciales("");
      setEnsenantes("");
    } finally {
      setSaving(false);
    }
  };

  const cycleEtapa = (record: LocalRecord<InvestigadorData>) => {
    const idx = ETAPA_ORDER.indexOf(record.data.etapa);
    const next = ETAPA_ORDER[(idx + 1) % ETAPA_ORDER.length];
    void mod.save(record.recordKey, { ...record.data, etapa: next });
  };

  const markContacted = (record: LocalRecord<InvestigadorData>) => {
    void mod.save(record.recordKey, {
      ...record.data,
      ultimoContacto: new Date().toISOString(),
    });
  };

  const updateField = (
    record: LocalRecord<InvestigadorData>,
    field: keyof InvestigadorData,
    value: string
  ) => {
    void mod.save(record.recordKey, { ...record.data, [field]: value });
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="WML · Investigadores"
        subtitle="Personas en enseñanza — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nueva persona
          </h2>
          <p className="mt-1 text-[13px] text-muted-2">
            Usa iniciales — nunca el nombre completo del investigador.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Iniciales"
              placeholder="Ej. M.S."
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value)}
            />
            <TextField
              label="Quién enseña"
              placeholder="Ej. Élderes / Hna. Ruiz"
              value={ensenantes}
              onChange={(e) => setEnsenantes(e.target.value)}
            />
            <Button
              variant="accent"
              onClick={onAdd}
              disabled={saving || !iniciales.trim()}
            >
              {saving ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            En enseñanza ({mod.records.length})
          </h2>
          <button
            type="button"
            onClick={() => mod.refresh()}
            disabled={mod.syncing}
            className="text-xs font-bold text-water-mid disabled:opacity-60"
          >
            {mod.syncing ? "Sincronizando…" : "Sincronizar ahora"}
          </button>
        </div>

        {mod.records.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-muted italic">
              No hay nadie en enseñanza registrado todavía.
            </p>
          </Card>
        ) : (
          mod.records.map((r) => {
            const days = daysSince(r.data.ultimoContacto);
            const contactoLabel = r.data.ultimoContacto
              ? `${days} día${days === 1 ? "" : "s"} sin contacto`
              : "Sin registro de contacto";
            return (
              <Card key={r.recordKey} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <input
                      value={r.data.iniciales}
                      onChange={(e) => updateField(r, "iniciales", e.target.value)}
                      className="font-display w-full rounded-md bg-transparent text-base font-semibold text-deep-water focus:bg-linen focus:outline-none"
                    />
                    <input
                      value={r.data.ensenantes}
                      onChange={(e) => updateField(r, "ensenantes", e.target.value)}
                      placeholder="Quién enseña"
                      className="mt-0.5 w-full rounded-md bg-transparent text-[13px] text-muted-2 focus:bg-linen focus:outline-none"
                    />
                  </div>
                  <span
                    onClick={() => cycleEtapa(r)}
                    className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] uppercase ${ETAPA_TONE[r.data.etapa]}`}
                  >
                    {ETAPA_LABEL[r.data.etapa]}
                  </span>
                </div>

                {r.data.etapa === "fecha_bautismo" || r.data.etapa === "bautizado" ? (
                  <label className="mt-2.5 flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-muted-2 uppercase">
                      Fecha propuesta
                    </span>
                    <input
                      type="date"
                      value={r.data.fechaBautismoPropuesta}
                      onChange={(e) =>
                        updateField(r, "fechaBautismoPropuesta", e.target.value)
                      }
                      className="w-fit rounded-[7px] border border-line-card bg-linen px-2.5 py-1.5 text-sm"
                    />
                  </label>
                ) : null}

                <div className="mt-3 flex items-center gap-2.5 border-t border-dashed border-line-card pt-3">
                  <SemaforoDot lastContact={r.data.ultimoContacto} />
                  <span
                    className={`flex-1 text-[12.5px] ${days === null || days > 30 ? "font-bold text-rojo" : "text-muted-2"}`}
                  >
                    {contactoLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => markContacted(r)}
                    className="rounded-md border border-line-card bg-white px-2.5 py-1.5 text-[11px] font-bold text-water-mid"
                  >
                    Contactado hoy
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase ${r.pendingSync ? "text-amber" : "text-sage"}`}
                  >
                    {r.pendingSync ? "Sin sincronizar" : "Sincronizado"}
                  </span>
                  <button
                    type="button"
                    onClick={() => mod.remove(r.recordKey)}
                    className="text-xs font-bold text-rojo"
                  >
                    Eliminar
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
}

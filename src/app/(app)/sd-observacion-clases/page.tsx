"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Estado = "agendada" | "realizada";

type ObservacionData = {
  maestro: string;
  fecha: string;
  fortalezas: string;
  sugerencias: string;
  estado: Estado;
};

const ESTADO_ORDER: Estado[] = ["agendada", "realizada"];
const ESTADO_LABEL: Record<Estado, string> = {
  agendada: "Agendada",
  realizada: "Realizada",
};
const ESTADO_TONE: Record<Estado, string> = {
  agendada: "bg-badge-pending-bg text-badge-pending-text",
  realizada: "bg-badge-done-bg text-badge-done-text",
};

export default function SdObservacionClasesPage() {
  const mod = useSyncModule<ObservacionData>(MODULES.SD_OBSERVACION_CLASES);
  const [maestro, setMaestro] = useState("");
  const [fecha, setFecha] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!maestro.trim() || !fecha) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        maestro: maestro.trim(),
        fecha,
        fortalezas: "",
        sugerencias: "",
        estado: "agendada",
      });
      setMaestro("");
      setFecha("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<ObservacionData>, patch: Partial<ObservacionData>) => {
    void mod.update(record.recordKey, patch);
  };

  const cycleEstado = (record: LocalRecord<ObservacionData>) => {
    const idx = ESTADO_ORDER.indexOf(record.data.estado);
    update(record, { estado: ESTADO_ORDER[(idx + 1) % ESTADO_ORDER.length] });
  };

  const sorted = [...mod.records].sort((a, b) => a.data.fecha.localeCompare(b.data.fecha));

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="SD · Acompañamiento a Maestros"
        subtitle="Observación de clases — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nueva observación
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Maestro (iniciales)"
              placeholder="Ej. N.B."
              value={maestro}
              onChange={(e) => setMaestro(e.target.value)}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-muted-2">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-[52px] w-full rounded-xl border-[1.5px] border-line-card bg-white px-3.5 text-base"
              />
            </label>
            <Button variant="accent" onClick={onAdd} disabled={saving || !maestro.trim() || !fecha}>
              {saving ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Observaciones ({mod.records.length})
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

        {sorted.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-muted italic">No hay observaciones registradas todavía.</p>
          </Card>
        ) : (
          sorted.map((r) => (
            <Card key={r.recordKey} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-semibold text-deep-water">
                    {r.data.maestro}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted-2">{r.data.fecha}</div>
                </div>
                <span
                  onClick={() => cycleEstado(r)}
                  className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] uppercase ${ESTADO_TONE[r.data.estado]}`}
                >
                  {ESTADO_LABEL[r.data.estado]}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <TextField
                  label="Fortalezas"
                  placeholder="Opcional"
                  value={r.data.fortalezas}
                  onChange={(e) => update(r, { fortalezas: e.target.value })}
                  className="!h-11"
                />
                <TextField
                  label="Sugerencias"
                  placeholder="Opcional"
                  value={r.data.sugerencias}
                  onChange={(e) => update(r, { sugerencias: e.target.value })}
                  className="!h-11"
                />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-line-card pt-3">
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
          ))
        )}
      </main>
    </div>
  );
}

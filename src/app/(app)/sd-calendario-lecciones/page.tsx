"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Estado = "planificada" | "confirmada" | "impartida";

type LeccionData = {
  fecha: string;
  curso: string;
  leccion: string;
  estado: Estado;
};

const ESTADO_ORDER: Estado[] = ["planificada", "confirmada", "impartida"];
const ESTADO_LABEL: Record<Estado, string> = {
  planificada: "Planificada",
  confirmada: "Confirmada",
  impartida: "Impartida",
};
const ESTADO_TONE: Record<Estado, string> = {
  planificada: "bg-badge-draft-bg text-badge-draft-text",
  confirmada: "bg-badge-progress-bg text-badge-progress-text",
  impartida: "bg-badge-done-bg text-badge-done-text",
};

export default function SdCalendarioLeccionesPage() {
  const mod = useSyncModule<LeccionData>(MODULES.SD_CALENDARIO_LECCIONES);
  const [fecha, setFecha] = useState("");
  const [curso, setCurso] = useState("");
  const [leccion, setLeccion] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!fecha || !curso.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        fecha,
        curso: curso.trim(),
        leccion: leccion.trim(),
        estado: "planificada",
      });
      setFecha("");
      setCurso("");
      setLeccion("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<LeccionData>, patch: Partial<LeccionData>) => {
    void mod.update(record.recordKey, patch);
  };

  const cycleEstado = (record: LocalRecord<LeccionData>) => {
    const idx = ESTADO_ORDER.indexOf(record.data.estado);
    update(record, { estado: ESTADO_ORDER[(idx + 1) % ESTADO_ORDER.length] });
  };

  const sorted = [...mod.records].sort((a, b) => a.data.fecha.localeCompare(b.data.fecha));

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="SD · Calendario de Lecciones"
        subtitle="Qué lección toca cada domingo — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> anota la lección solo por
          número o nombre del manual — nunca copies el contenido con
          derechos de autor.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">Nueva lección</h2>
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-muted-2">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-[52px] w-full rounded-xl border-[1.5px] border-line-card bg-white px-3.5 text-base"
              />
            </label>
            <TextField
              label="Curso"
              placeholder="Ej. Ven, Sígueme"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
            />
            <TextField
              label="Lección (referencia)"
              placeholder="Ej. Semana del 25-31 de agosto"
              value={leccion}
              onChange={(e) => setLeccion(e.target.value)}
            />
            <Button variant="accent" onClick={onAdd} disabled={saving || !fecha || !curso.trim()}>
              {saving ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Lecciones ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay lecciones registradas todavía.</p>
          </Card>
        ) : (
          sorted.map((r) => (
            <Card key={r.recordKey} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-semibold text-deep-water">
                    {r.data.curso}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted-2">
                    {r.data.fecha}
                    {r.data.leccion ? ` · ${r.data.leccion}` : ""}
                  </div>
                </div>
                <span
                  onClick={() => cycleEstado(r)}
                  className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] uppercase ${ESTADO_TONE[r.data.estado]}`}
                >
                  {ESTADO_LABEL[r.data.estado]}
                </span>
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

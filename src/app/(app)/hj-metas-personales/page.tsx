"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Estado = "planificando" | "en_progreso" | "lograda";

type MetaData = {
  iniciales: string;
  meta: string;
  fechaObjetivo: string;
  estado: Estado;
  nota: string;
};

const ESTADO_ORDER: Estado[] = ["planificando", "en_progreso", "lograda"];
const ESTADO_LABEL: Record<Estado, string> = {
  planificando: "Planificando",
  en_progreso: "En progreso",
  lograda: "Lograda",
};
const ESTADO_TONE: Record<Estado, string> = {
  planificando: "bg-badge-draft-bg text-badge-draft-text",
  en_progreso: "bg-badge-progress-bg text-badge-progress-text",
  lograda: "bg-badge-done-bg text-badge-done-text",
};

export default function HjMetasPersonalesPage() {
  const mod = useSyncModule<MetaData>(MODULES.HJ_METAS_PERSONALES);
  const [iniciales, setIniciales] = useState("");
  const [meta, setMeta] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!iniciales.trim() || !meta.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        iniciales: iniciales.trim(),
        meta: meta.trim(),
        fechaObjetivo: "",
        estado: "planificando",
        nota: "",
      });
      setIniciales("");
      setMeta("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<MetaData>, patch: Partial<MetaData>) => {
    void mod.update(record.recordKey, patch);
  };

  const cycleEstado = (record: LocalRecord<MetaData>) => {
    const idx = ESTADO_ORDER.indexOf(record.data.estado);
    update(record, { estado: ESTADO_ORDER[(idx + 1) % ESTADO_ORDER.length] });
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="HJ · Metas Personales"
        subtitle="Seguimiento de metas — cifrado de extremo a extremo"
        tone="deep-water"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> usa solo iniciales.
          Describe metas personales genéricas (hábitos, servicio,
          desarrollo) — no registres fechas de ordenanzas ni datos oficiales
          del sacerdocio.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">Nueva meta</h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Iniciales"
              placeholder="Ej. T.M."
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value)}
            />
            <TextField
              label="Meta"
              placeholder="Ej. Leer el Libro de Mormón completo"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
            />
            <Button
              variant="accent"
              onClick={onAdd}
              disabled={saving || !iniciales.trim() || !meta.trim()}
            >
              {saving ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Metas ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay metas registradas todavía.</p>
          </Card>
        ) : (
          mod.records.map((r) => (
            <Card key={r.recordKey} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-semibold text-deep-water">
                    {r.data.iniciales}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted-2">{r.data.meta}</div>
                </div>
                <span
                  onClick={() => cycleEstado(r)}
                  className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] uppercase ${ESTADO_TONE[r.data.estado]}`}
                >
                  {ESTADO_LABEL[r.data.estado]}
                </span>
              </div>
              <label className="mt-2.5 flex flex-col gap-1">
                <span className="text-[11px] font-bold text-muted-2 uppercase">
                  Fecha objetivo
                </span>
                <input
                  type="date"
                  value={r.data.fechaObjetivo}
                  onChange={(e) => update(r, { fechaObjetivo: e.target.value })}
                  className="w-fit rounded-[7px] border border-line-card bg-linen px-2.5 py-1.5 text-sm"
                />
              </label>
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

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Nino = { iniciales: string; asistio: boolean };

type AsistenciaData = {
  clase: string;
  fecha: string;
  ninos: Nino[];
};

export default function PrimariaAsistenciaClasesPage() {
  const mod = useSyncModule<AsistenciaData>(MODULES.PRIMARIA_ASISTENCIA_CLASES);
  const [clase, setClase] = useState("");
  const [fecha, setFecha] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!clase.trim() || !fecha) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        clase: clase.trim(),
        fecha,
        ninos: [],
      });
      setClase("");
      setFecha("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<AsistenciaData>, patch: Partial<AsistenciaData>) => {
    void mod.update(record.recordKey, patch);
  };

  const sorted = [...mod.records].sort((a, b) => b.data.fecha.localeCompare(a.data.fecha));

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Primaria · Asistencia"
        subtitle="Asistencia por clase — cifrado de extremo a extremo"
        tone="deep-water"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> usa solo iniciales de los
          niños, nunca el nombre completo.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nueva clase
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Clase"
              placeholder="Ej. CTR 7"
              value={clase}
              onChange={(e) => setClase(e.target.value)}
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
            <Button variant="accent" onClick={onAdd} disabled={saving || !clase.trim() || !fecha}>
              {saving ? "Guardando…" : "Agregar clase"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Registros ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay registros todavía.</p>
          </Card>
        ) : (
          sorted.map((r) => <AsistenciaCard key={r.recordKey} record={r} onUpdate={update} onDelete={() => mod.remove(r.recordKey)} />)
        )}
      </main>
    </div>
  );
}

function AsistenciaCard({
  record,
  onUpdate,
  onDelete,
}: {
  record: LocalRecord<AsistenciaData>;
  onUpdate: (record: LocalRecord<AsistenciaData>, patch: Partial<AsistenciaData>) => void;
  onDelete: () => void;
}) {
  const [ninoInput, setNinoInput] = useState("");
  const d = record.data;
  const presentes = d.ninos.filter((n) => n.asistio).length;

  const addNino = () => {
    if (!ninoInput.trim()) return;
    onUpdate(record, { ninos: [...d.ninos, { iniciales: ninoInput.trim(), asistio: true }] });
    setNinoInput("");
  };

  const toggleNino = (idx: number) => {
    const ninos = d.ninos.map((n, nidx) => (nidx === idx ? { ...n, asistio: !n.asistio } : n));
    onUpdate(record, { ninos });
  };

  const removeNino = (idx: number) => {
    onUpdate(record, { ninos: d.ninos.filter((_, nidx) => nidx !== idx) });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-semibold text-deep-water">{d.clase}</div>
          <div className="mt-0.5 text-[13px] text-muted-2">{d.fecha}</div>
        </div>
        <span className="shrink-0 rounded-lg bg-badge-done-bg px-2.5 py-1.5 text-[11px] font-bold text-badge-done-text">
          {presentes}/{d.ninos.length}
        </span>
      </div>

      <div className="mt-3">
        {d.ninos.map((n, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 border-b border-dashed border-line-card py-2 last:border-b-0"
          >
            <input
              type="checkbox"
              checked={n.asistio}
              onChange={() => toggleNino(idx)}
              className="h-[19px] w-[19px] accent-sage"
            />
            <span className={`min-w-0 flex-1 text-sm ${n.asistio ? "text-ink" : "text-muted-2"}`}>
              {n.iniciales}
            </span>
            <span
              onClick={() => removeNino(idx)}
              className="cursor-pointer text-sm font-bold text-rojo opacity-60 hover:opacity-100"
            >
              ✕
            </span>
          </div>
        ))}
        <div className="mt-2 flex gap-1.5">
          <input
            value={ninoInput}
            onChange={(e) => setNinoInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNino()}
            placeholder="Iniciales"
            className="min-w-0 flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addNino}
            className="shrink-0 rounded-[7px] bg-living-teal px-4 text-lg text-white"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-dashed border-line-card pt-3">
        <span
          className={`text-[10px] font-bold uppercase ${record.pendingSync ? "text-amber" : "text-sage"}`}
        >
          {record.pendingSync ? "Sin sincronizar" : "Sincronizado"}
        </span>
        <button type="button" onClick={onDelete} className="text-xs font-bold text-rojo">
          Eliminar
        </button>
      </div>
    </Card>
  );
}

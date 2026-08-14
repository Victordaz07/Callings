"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Estado = "planificando" | "confirmado" | "realizado";
type Participante = { iniciales: string };

type ProyectoData = {
  nombre: string;
  fecha: string;
  descripcion: string;
  estado: Estado;
  participantes: Participante[];
  nota: string;
};

const ESTADO_ORDER: Estado[] = ["planificando", "confirmado", "realizado"];
const ESTADO_LABEL: Record<Estado, string> = {
  planificando: "Planificando",
  confirmado: "Confirmado",
  realizado: "Realizado",
};
const ESTADO_TONE: Record<Estado, string> = {
  planificando: "bg-badge-draft-bg text-badge-draft-text",
  confirmado: "bg-badge-progress-bg text-badge-progress-text",
  realizado: "bg-badge-done-bg text-badge-done-text",
};

export default function MjServicioProyectoPage() {
  const mod = useSyncModule<ProyectoData>(MODULES.MJ_SERVICIO_PROYECTO);
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        nombre: nombre.trim(),
        fecha,
        descripcion: descripcion.trim(),
        estado: "planificando",
        participantes: [],
        nota: "",
      });
      setNombre("");
      setFecha("");
      setDescripcion("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<ProyectoData>, patch: Partial<ProyectoData>) => {
    void mod.update(record.recordKey, patch);
  };

  const cycleEstado = (record: LocalRecord<ProyectoData>) => {
    const idx = ESTADO_ORDER.indexOf(record.data.estado);
    update(record, { estado: ESTADO_ORDER[(idx + 1) % ESTADO_ORDER.length] });
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="MJ · Proyectos de Servicio"
        subtitle="Coordinación de servicio — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">Nuevo proyecto</h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Nombre"
              placeholder="Ej. Canasta para familia necesitada"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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
            <TextField
              label="Descripción"
              placeholder="Opcional"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <Button variant="accent" onClick={onAdd} disabled={saving || !nombre.trim()}>
              {saving ? "Guardando…" : "Agregar proyecto"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Proyectos ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay proyectos registrados todavía.</p>
          </Card>
        ) : (
          mod.records.map((r) => (
            <ProyectoCard
              key={r.recordKey}
              record={r}
              onUpdate={update}
              onCycleEstado={cycleEstado}
              onDelete={() => mod.remove(r.recordKey)}
            />
          ))
        )}
      </main>
    </div>
  );
}

function ProyectoCard({
  record,
  onUpdate,
  onCycleEstado,
  onDelete,
}: {
  record: LocalRecord<ProyectoData>;
  onUpdate: (record: LocalRecord<ProyectoData>, patch: Partial<ProyectoData>) => void;
  onCycleEstado: (record: LocalRecord<ProyectoData>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pIniciales, setPIniciales] = useState("");
  const d = record.data;

  const addParticipante = () => {
    if (!pIniciales.trim()) return;
    onUpdate(record, { participantes: [...d.participantes, { iniciales: pIniciales.trim() }] });
    setPIniciales("");
  };

  const removeParticipante = (idx: number) => {
    onUpdate(record, { participantes: d.participantes.filter((_, pidx) => pidx !== idx) });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-semibold text-deep-water">{d.nombre}</div>
          {d.descripcion ? (
            <div className="mt-0.5 text-[13px] text-muted-2">{d.descripcion}</div>
          ) : null}
        </div>
        <span
          onClick={() => onCycleEstado(record)}
          className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] uppercase ${ESTADO_TONE[d.estado]}`}
        >
          {ESTADO_LABEL[d.estado]}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-xs font-bold text-water-mid"
      >
        {expanded ? "▲" : "▼"} Participantes ({d.participantes.length})
      </button>

      {expanded ? (
        <div className="mt-2">
          {d.participantes.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 border-b border-dashed border-line-card py-2 last:border-b-0"
            >
              <span className="min-w-0 flex-1 text-sm text-ink">{p.iniciales}</span>
              <span
                onClick={() => removeParticipante(idx)}
                className="cursor-pointer text-sm font-bold text-rojo opacity-60 hover:opacity-100"
              >
                ✕
              </span>
            </div>
          ))}
          <div className="mt-2 flex gap-1.5">
            <input
              value={pIniciales}
              onChange={(e) => setPIniciales(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addParticipante()}
              placeholder="Iniciales"
              className="min-w-0 flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addParticipante}
              className="shrink-0 rounded-[7px] bg-living-teal px-4 text-lg text-white"
            >
              +
            </button>
          </div>
        </div>
      ) : null}

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

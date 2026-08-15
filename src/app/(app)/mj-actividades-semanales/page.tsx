"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Estado = "planificando" | "confirmado" | "realizado" | "cancelado";
type Asistente = { iniciales: string; asistio: boolean };

type ActividadData = {
  fecha: string;
  tema: string;
  lugar: string;
  responsable: string;
  estado: Estado;
  asistentes: Asistente[];
  nota: string;
};

const ESTADO_ORDER: Estado[] = ["planificando", "confirmado", "realizado", "cancelado"];
const ESTADO_LABEL: Record<Estado, string> = {
  planificando: "Planificando",
  confirmado: "Confirmado",
  realizado: "Realizado",
  cancelado: "Cancelado",
};
const ESTADO_TONE: Record<Estado, string> = {
  planificando: "bg-badge-draft-bg text-badge-draft-text",
  confirmado: "bg-badge-progress-bg text-badge-progress-text",
  realizado: "bg-badge-done-bg text-badge-done-text",
  cancelado: "bg-badge-overdue-bg text-badge-overdue-text",
};

function fmtFecha(fecha: string) {
  if (!fecha) return "Sin fecha";
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MjActividadesSemanalesPage() {
  const mod = useSyncModule<ActividadData>(MODULES.MJ_ACTIVIDADES_SEMANALES);
  const [fecha, setFecha] = useState("");
  const [tema, setTema] = useState("");
  const [lugar, setLugar] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!fecha || !tema.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        fecha,
        tema: tema.trim(),
        lugar: lugar.trim(),
        responsable: "",
        estado: "planificando",
        asistentes: [],
        nota: "",
      });
      setFecha("");
      setTema("");
      setLugar("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<ActividadData>, patch: Partial<ActividadData>) => {
    void mod.update(record.recordKey, patch);
  };

  const cycleEstado = (record: LocalRecord<ActividadData>) => {
    const idx = ESTADO_ORDER.indexOf(record.data.estado);
    update(record, { estado: ESTADO_ORDER[(idx + 1) % ESTADO_ORDER.length] });
  };

  const sorted = [...mod.records].sort((a, b) => a.data.fecha.localeCompare(b.data.fecha));

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="MJ · Actividades Semanales"
        subtitle="Planificador de Mujeres Jóvenes — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nueva actividad
          </h2>
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
              label="Tema"
              placeholder="Ej. Noche de manualidades"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            />
            <TextField
              label="Lugar"
              placeholder="Ej. Cultural hall"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
            />
            <Button variant="accent" onClick={onAdd} disabled={saving || !fecha || !tema.trim()}>
              {saving ? "Guardando…" : "Agregar actividad"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Actividades ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay actividades registradas todavía.</p>
          </Card>
        ) : (
          sorted.map((r) => (
            <ActividadCard
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

function ActividadCard({
  record,
  onUpdate,
  onCycleEstado,
  onDelete,
}: {
  record: LocalRecord<ActividadData>;
  onUpdate: (record: LocalRecord<ActividadData>, patch: Partial<ActividadData>) => void;
  onCycleEstado: (record: LocalRecord<ActividadData>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [asistenteInput, setAsistenteInput] = useState("");
  const d = record.data;

  const addAsistente = () => {
    if (!asistenteInput.trim()) return;
    onUpdate(record, {
      asistentes: [...d.asistentes, { iniciales: asistenteInput.trim(), asistio: false }],
    });
    setAsistenteInput("");
  };

  const toggleAsistente = (idx: number) => {
    const asistentes = d.asistentes.map((a, aidx) =>
      aidx === idx ? { ...a, asistio: !a.asistio } : a
    );
    onUpdate(record, { asistentes });
  };

  const removeAsistente = (idx: number) => {
    onUpdate(record, { asistentes: d.asistentes.filter((_, aidx) => aidx !== idx) });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-semibold text-deep-water">{d.tema}</div>
          <div className="mt-0.5 text-[13px] text-muted-2">
            {fmtFecha(d.fecha)}
            {d.lugar ? ` · ${d.lugar}` : ""}
          </div>
        </div>
        <span
          onClick={() => onCycleEstado(record)}
          className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] uppercase ${ESTADO_TONE[d.estado]}`}
        >
          {ESTADO_LABEL[d.estado]}
        </span>
      </div>

      <TextField
        label="Responsable (iniciales)"
        placeholder="Ej. S.N."
        value={d.responsable}
        onChange={(e) => onUpdate(record, { responsable: e.target.value })}
        className="!h-11 mt-3"
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-xs font-bold text-water-mid"
      >
        {expanded ? "▲" : "▼"} Asistentes ({d.asistentes.length})
      </button>

      {expanded ? (
        <div className="mt-2">
          {d.asistentes.map((a, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 border-b border-dashed border-line-card py-2 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={a.asistio}
                onChange={() => toggleAsistente(idx)}
                className="h-[19px] w-[19px] accent-sage"
              />
              <span className={`min-w-0 flex-1 text-sm ${a.asistio ? "text-ink" : "text-muted-2"}`}>
                {a.iniciales}
              </span>
              <span
                onClick={() => removeAsistente(idx)}
                className="cursor-pointer text-sm font-bold text-rojo opacity-60 hover:opacity-100"
              >
                ✕
              </span>
            </div>
          ))}
          <div className="mt-2 flex gap-1.5">
            <input
              value={asistenteInput}
              onChange={(e) => setAsistenteInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAsistente()}
              placeholder="Iniciales"
              className="min-w-0 flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addAsistente}
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

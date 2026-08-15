"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Tipo = "comida" | "transporte" | "visita" | "mudanza" | "otro";
type Estado = "solicitado" | "coordinando" | "en_curso" | "completado";

type Voluntario = { iniciales: string; tarea: string; confirmado: boolean };

type NecesidadData = {
  iniciales: string;
  tipo: Tipo;
  detalle: string;
  estado: Estado;
  fechaInicio: string;
  fechaFin: string;
  voluntarios: Voluntario[];
  nota: string;
};

const TIPO_ORDER: Tipo[] = ["comida", "transporte", "visita", "mudanza", "otro"];
const TIPO_LABEL: Record<Tipo, string> = {
  comida: "Comida",
  transporte: "Transporte",
  visita: "Visita",
  mudanza: "Mudanza",
  otro: "Otro",
};

const ESTADO_ORDER: Estado[] = ["solicitado", "coordinando", "en_curso", "completado"];
const ESTADO_LABEL: Record<Estado, string> = {
  solicitado: "Solicitado",
  coordinando: "Coordinando",
  en_curso: "En curso",
  completado: "Completado",
};
const ESTADO_TONE: Record<Estado, string> = {
  solicitado: "bg-badge-draft-bg text-badge-draft-text",
  coordinando: "bg-badge-pending-bg text-badge-pending-text",
  en_curso: "bg-badge-progress-bg text-badge-progress-text",
  completado: "bg-badge-done-bg text-badge-done-text",
};

export default function SocorroServicioPage() {
  const mod = useSyncModule<NecesidadData>(MODULES.SOCORRO_SERVICIO);
  const [iniciales, setIniciales] = useState("");
  const [tipo, setTipo] = useState<Tipo>("comida");
  const [detalle, setDetalle] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!iniciales.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        iniciales: iniciales.trim(),
        tipo,
        detalle: detalle.trim(),
        estado: "solicitado",
        fechaInicio: "",
        fechaFin: "",
        voluntarios: [],
        nota: "",
      });
      setIniciales("");
      setTipo("comida");
      setDetalle("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<NecesidadData>, patch: Partial<NecesidadData>) => {
    void mod.update(record.recordKey, patch);
  };

  const cycleEstado = (record: LocalRecord<NecesidadData>) => {
    const idx = ESTADO_ORDER.indexOf(record.data.estado);
    update(record, { estado: ESTADO_ORDER[(idx + 1) % ESTADO_ORDER.length] });
  };

  const cycleTipo = (record: LocalRecord<NecesidadData>) => {
    const idx = TIPO_ORDER.indexOf(record.data.tipo);
    update(record, { tipo: TIPO_ORDER[(idx + 1) % TIPO_ORDER.length] });
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Socorro y Servicio"
        subtitle="Coordinación de servicio compasivo — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> usa solo iniciales, nunca
          el nombre completo. Registra solo la logística del servicio
          (qué se necesita, quién ayuda, cuándo) — nunca detalles médicos,
          financieros ni de asistencia del obispado.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nueva necesidad
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Iniciales"
              placeholder="Ej. C.V."
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value)}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-muted-2">Tipo de ayuda</span>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Tipo)}
                className="h-[52px] rounded-xl border-[1.5px] border-line-card bg-white px-3.5 text-base text-ink"
              >
                {TIPO_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>
            <TextField
              label="Detalle (opcional, sin datos médicos)"
              placeholder="Ej. Primeras dos semanas después del bebé"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
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
            Necesidades ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay necesidades registradas todavía.</p>
          </Card>
        ) : (
          mod.records.map((r) => (
            <NecesidadCard
              key={r.recordKey}
              record={r}
              onUpdate={update}
              onCycleEstado={cycleEstado}
              onCycleTipo={cycleTipo}
              onDelete={() => mod.remove(r.recordKey)}
            />
          ))
        )}
      </main>
    </div>
  );
}

function NecesidadCard({
  record,
  onUpdate,
  onCycleEstado,
  onCycleTipo,
  onDelete,
}: {
  record: LocalRecord<NecesidadData>;
  onUpdate: (record: LocalRecord<NecesidadData>, patch: Partial<NecesidadData>) => void;
  onCycleEstado: (record: LocalRecord<NecesidadData>) => void;
  onCycleTipo: (record: LocalRecord<NecesidadData>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [volIniciales, setVolIniciales] = useState("");
  const [volTarea, setVolTarea] = useState("");
  const d = record.data;

  const addVoluntario = () => {
    if (!volIniciales.trim()) return;
    onUpdate(record, {
      voluntarios: [
        ...d.voluntarios,
        { iniciales: volIniciales.trim(), tarea: volTarea.trim(), confirmado: false },
      ],
    });
    setVolIniciales("");
    setVolTarea("");
  };

  const toggleVoluntario = (idx: number) => {
    const voluntarios = d.voluntarios.map((v, vidx) =>
      vidx === idx ? { ...v, confirmado: !v.confirmado } : v
    );
    onUpdate(record, { voluntarios });
  };

  const removeVoluntario = (idx: number) => {
    onUpdate(record, { voluntarios: d.voluntarios.filter((_, vidx) => vidx !== idx) });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-semibold text-deep-water">
            {d.iniciales}
          </div>
          {d.detalle ? (
            <div className="mt-0.5 text-[13px] text-muted-2">{d.detalle}</div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            onClick={() => onCycleEstado(record)}
            className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] uppercase ${ESTADO_TONE[d.estado]}`}
          >
            {ESTADO_LABEL[d.estado]}
          </span>
          <span
            onClick={() => onCycleTipo(record)}
            className="cursor-pointer rounded-lg bg-linen px-2.5 py-1 text-[11px] font-bold text-muted-2"
          >
            {TIPO_LABEL[d.tipo]}
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-bold text-muted-2">Desde</span>
          <input
            type="date"
            value={d.fechaInicio}
            onChange={(e) => onUpdate(record, { fechaInicio: e.target.value })}
            className="h-11 w-full rounded-xl border-[1.5px] border-line-card bg-white px-2.5 text-sm"
          />
        </label>
        <label className="min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-bold text-muted-2">Hasta</span>
          <input
            type="date"
            value={d.fechaFin}
            onChange={(e) => onUpdate(record, { fechaFin: e.target.value })}
            className="h-11 w-full rounded-xl border-[1.5px] border-line-card bg-white px-2.5 text-sm"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-xs font-bold text-water-mid"
      >
        {expanded ? "▲" : "▼"} Voluntarios ({d.voluntarios.length})
      </button>

      {expanded ? (
        <div className="mt-2">
          {d.voluntarios.map((v, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 border-b border-dashed border-line-card py-2 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={v.confirmado}
                onChange={() => toggleVoluntario(idx)}
                className="h-[19px] w-[19px] accent-sage"
              />
              <span className={`min-w-0 flex-1 text-sm ${v.confirmado ? "text-ink" : "text-muted-2"}`}>
                <b>{v.iniciales}</b>
                {v.tarea ? ` · ${v.tarea}` : ""}
              </span>
              <span
                onClick={() => removeVoluntario(idx)}
                className="cursor-pointer text-sm font-bold text-rojo opacity-60 hover:opacity-100"
              >
                ✕
              </span>
            </div>
          ))}
          <div className="mt-2 flex gap-1.5">
            <input
              value={volIniciales}
              onChange={(e) => setVolIniciales(e.target.value)}
              placeholder="Iniciales"
              className="min-w-0 flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2 text-sm"
            />
            <input
              value={volTarea}
              onChange={(e) => setVolTarea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addVoluntario()}
              placeholder="Tarea (ej. martes)"
              className="min-w-0 flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addVoluntario}
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

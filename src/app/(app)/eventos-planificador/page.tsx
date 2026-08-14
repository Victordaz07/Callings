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

type Inscrito = { iniciales: string; confirmado: boolean };

type EventoData = {
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  presupuesto: string;
  responsables: string;
  notas: string;
  estado: Estado;
  inscritos: Inscrito[];
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

export default function EventosPlanificadorPage() {
  const mod = useSyncModule<EventoData>(MODULES.EVENTOS_PLANIFICADOR);
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [lugar, setLugar] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!nombre.trim() || !fecha) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        nombre: nombre.trim(),
        fecha,
        hora: "",
        lugar: lugar.trim(),
        presupuesto: "",
        responsables: "",
        notas: "",
        estado: "planificando",
        inscritos: [],
      });
      setNombre("");
      setFecha("");
      setLugar("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<EventoData>, patch: Partial<EventoData>) => {
    void mod.save(record.recordKey, { ...record.data, ...patch });
  };

  const cycleEstado = (record: LocalRecord<EventoData>) => {
    const idx = ESTADO_ORDER.indexOf(record.data.estado);
    update(record, { estado: ESTADO_ORDER[(idx + 1) % ESTADO_ORDER.length] });
  };

  const sorted = [...mod.records].sort((a, b) => a.data.fecha.localeCompare(b.data.fecha));

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Planificador de Eventos"
        subtitle="Calendario, presupuesto e inscripción — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nuevo evento
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Nombre del evento"
              placeholder="Ej. Noche de talentos del barrio"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <div className="flex gap-3">
              <label className="flex-1">
                <span className="mb-1.5 block text-xs font-bold text-muted-2">Fecha</span>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="h-[52px] w-full rounded-xl border-[1.5px] border-line-card bg-white px-3.5 text-base"
                />
              </label>
            </div>
            <TextField
              label="Lugar"
              placeholder="Ej. Cultural hall"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
            />
            <Button
              variant="accent"
              onClick={onAdd}
              disabled={saving || !nombre.trim() || !fecha}
            >
              {saving ? "Guardando…" : "Agregar evento"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Eventos ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay eventos todavía.</p>
          </Card>
        ) : (
          sorted.map((r) => <EventoCard key={r.recordKey} record={r} onUpdate={update} onCycleEstado={cycleEstado} onDelete={() => mod.remove(r.recordKey)} />)
        )}
      </main>
    </div>
  );
}

function EventoCard({
  record,
  onUpdate,
  onCycleEstado,
  onDelete,
}: {
  record: LocalRecord<EventoData>;
  onUpdate: (record: LocalRecord<EventoData>, patch: Partial<EventoData>) => void;
  onCycleEstado: (record: LocalRecord<EventoData>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [inscritoInput, setInscritoInput] = useState("");
  const d = record.data;

  const addInscrito = () => {
    if (!inscritoInput.trim()) return;
    onUpdate(record, {
      inscritos: [...d.inscritos, { iniciales: inscritoInput.trim(), confirmado: false }],
    });
    setInscritoInput("");
  };

  const toggleInscrito = (idx: number) => {
    const inscritos = d.inscritos.map((i, iidx) =>
      iidx === idx ? { ...i, confirmado: !i.confirmado } : i
    );
    onUpdate(record, { inscritos });
  };

  const removeInscrito = (idx: number) => {
    onUpdate(record, { inscritos: d.inscritos.filter((_, iidx) => iidx !== idx) });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-semibold text-deep-water">
            {d.nombre}
          </div>
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

      <div className="mt-3 flex gap-2">
        <TextField
          label="Presupuesto"
          placeholder="Ej. $1500"
          value={d.presupuesto}
          onChange={(e) => onUpdate(record, { presupuesto: e.target.value })}
          className="!h-11"
          wrapperClassName="min-w-0 flex-1"
        />
        <TextField
          label="Responsables"
          placeholder="Ej. Hna. Gómez, Hno. Ruiz"
          value={d.responsables}
          onChange={(e) => onUpdate(record, { responsables: e.target.value })}
          className="!h-11"
          wrapperClassName="min-w-0 flex-1"
        />
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-xs font-bold text-water-mid"
      >
        {expanded ? "▲" : "▼"} Inscritos ({d.inscritos.length})
      </button>

      {expanded ? (
        <div className="mt-2">
          {d.inscritos.map((i, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 border-b border-dashed border-line-card py-2 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={i.confirmado}
                onChange={() => toggleInscrito(idx)}
                className="h-[19px] w-[19px] accent-sage"
              />
              <span className={`flex-1 text-sm ${i.confirmado ? "text-ink" : "text-muted-2"}`}>
                {i.iniciales}
              </span>
              <span
                onClick={() => removeInscrito(idx)}
                className="cursor-pointer text-sm font-bold text-rojo opacity-60 hover:opacity-100"
              >
                ✕
              </span>
            </div>
          ))}
          <div className="mt-2 flex gap-1.5">
            <input
              value={inscritoInput}
              onChange={(e) => setInscritoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addInscrito()}
              placeholder="Iniciales"
              className="min-w-[100px] flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addInscrito}
              className="rounded-[7px] bg-living-teal px-4 text-lg text-white"
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

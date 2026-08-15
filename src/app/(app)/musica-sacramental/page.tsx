"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Estado = "planificado" | "confirmado" | "realizado";

type ProgramaData = {
  fecha: string;
  himnoApertura: string;
  himnoIntermedio: string;
  himnoClausura: string;
  numeroEspecialIniciales: string;
  numeroEspecialDescripcion: string;
  organista: string;
  estado: Estado;
  nota: string;
};

const ESTADO_ORDER: Estado[] = ["planificado", "confirmado", "realizado"];
const ESTADO_LABEL: Record<Estado, string> = {
  planificado: "Planificado",
  confirmado: "Confirmado",
  realizado: "Realizado",
};
const ESTADO_TONE: Record<Estado, string> = {
  planificado: "bg-badge-draft-bg text-badge-draft-text",
  confirmado: "bg-badge-progress-bg text-badge-progress-text",
  realizado: "bg-badge-done-bg text-badge-done-text",
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

export default function MusicaSacramentalPage() {
  const mod = useSyncModule<ProgramaData>(MODULES.MUSICA_SACRAMENTAL);
  const [fecha, setFecha] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!fecha) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        fecha,
        himnoApertura: "",
        himnoIntermedio: "",
        himnoClausura: "",
        numeroEspecialIniciales: "",
        numeroEspecialDescripcion: "",
        organista: "",
        estado: "planificado",
        nota: "",
      });
      setFecha("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<ProgramaData>, patch: Partial<ProgramaData>) => {
    void mod.update(record.recordKey, patch);
  };

  const cycleEstado = (record: LocalRecord<ProgramaData>) => {
    const idx = ESTADO_ORDER.indexOf(record.data.estado);
    update(record, { estado: ESTADO_ORDER[(idx + 1) % ESTADO_ORDER.length] });
  };

  const sorted = [...mod.records].sort((a, b) => a.data.fecha.localeCompare(b.data.fecha));

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Música Sacramental"
        subtitle="Programa musical por reunión — cifrado de extremo a extremo"
        tone="deep-water"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> registra himnos solo por
          número (nunca la letra, por derechos de autor) y personas solo por
          iniciales.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nueva reunión
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
            <Button variant="accent" onClick={onAdd} disabled={saving || !fecha}>
              {saving ? "Guardando…" : "Agregar reunión"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Programas ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay reuniones registradas todavía.</p>
          </Card>
        ) : (
          sorted.map((r) => (
            <ProgramaCard
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

function ProgramaCard({
  record,
  onUpdate,
  onCycleEstado,
  onDelete,
}: {
  record: LocalRecord<ProgramaData>;
  onUpdate: (record: LocalRecord<ProgramaData>, patch: Partial<ProgramaData>) => void;
  onCycleEstado: (record: LocalRecord<ProgramaData>) => void;
  onDelete: () => void;
}) {
  const d = record.data;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="font-display text-base font-semibold text-deep-water">
          {fmtFecha(d.fecha)}
        </div>
        <span
          onClick={() => onCycleEstado(record)}
          className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] uppercase ${ESTADO_TONE[d.estado]}`}
        >
          {ESTADO_LABEL[d.estado]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <TextField
          label="Apertura #"
          placeholder="Ej. 2"
          value={d.himnoApertura}
          onChange={(e) => onUpdate(record, { himnoApertura: e.target.value })}
          className="!h-11"
          wrapperClassName="min-w-0"
        />
        <TextField
          label="Intermedio #"
          placeholder="Ej. 129"
          value={d.himnoIntermedio}
          onChange={(e) => onUpdate(record, { himnoIntermedio: e.target.value })}
          className="!h-11"
          wrapperClassName="min-w-0"
        />
        <TextField
          label="Clausura #"
          placeholder="Ej. 219"
          value={d.himnoClausura}
          onChange={(e) => onUpdate(record, { himnoClausura: e.target.value })}
          className="!h-11"
          wrapperClassName="min-w-0"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <TextField
          label="Núm. especial (iniciales)"
          placeholder="Ej. A.R."
          value={d.numeroEspecialIniciales}
          onChange={(e) => onUpdate(record, { numeroEspecialIniciales: e.target.value })}
          className="!h-11"
          wrapperClassName="min-w-0 flex-1"
        />
        <TextField
          label="Organista (iniciales)"
          placeholder="Ej. B.C."
          value={d.organista}
          onChange={(e) => onUpdate(record, { organista: e.target.value })}
          className="!h-11"
          wrapperClassName="min-w-0 flex-1"
        />
      </div>

      <TextField
        label="Descripción del número especial"
        placeholder="Ej. Solo de piano"
        value={d.numeroEspecialDescripcion}
        onChange={(e) => onUpdate(record, { numeroEspecialDescripcion: e.target.value })}
        className="!h-11 mt-3"
      />

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

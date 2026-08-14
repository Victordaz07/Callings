"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Etapa =
  | "orando"
  | "aprobado_consejo"
  | "entrevista_agendada"
  | "extendido"
  | "sostenido"
  | "apartado";

type LlamamientoData = {
  iniciales: string;
  llamamiento: string;
  organizacion: string;
  etapa: Etapa;
  fechaEntrevista: string;
  releva: string;
  nota: string;
};

const ETAPA_ORDER: Etapa[] = [
  "orando",
  "aprobado_consejo",
  "entrevista_agendada",
  "extendido",
  "sostenido",
  "apartado",
];
const ETAPA_LABEL: Record<Etapa, string> = {
  orando: "Orando",
  aprobado_consejo: "Aprobado en consejo",
  entrevista_agendada: "Entrevista agendada",
  extendido: "Extendido",
  sostenido: "Sostenido",
  apartado: "Apartado",
};
const ETAPA_TONE: Record<Etapa, string> = {
  orando: "bg-badge-draft-bg text-badge-draft-text",
  aprobado_consejo: "bg-badge-pending-bg text-badge-pending-text",
  entrevista_agendada: "bg-badge-progress-bg text-badge-progress-text",
  extendido: "bg-badge-progress-bg text-badge-progress-text",
  sostenido: "bg-badge-done-bg text-badge-done-text",
  apartado: "bg-badge-done-bg text-badge-done-text",
};

export default function ObispadoLlamamientosPage() {
  const mod = useSyncModule<LlamamientoData>(MODULES.OBISPADO_LLAMAMIENTOS);
  const [iniciales, setIniciales] = useState("");
  const [llamamiento, setLlamamiento] = useState("");
  const [organizacion, setOrganizacion] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!iniciales.trim() || !llamamiento.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        iniciales: iniciales.trim(),
        llamamiento: llamamiento.trim(),
        organizacion: organizacion.trim(),
        etapa: "orando",
        fechaEntrevista: "",
        releva: "",
        nota: "",
      });
      setIniciales("");
      setLlamamiento("");
      setOrganizacion("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<LlamamientoData>, patch: Partial<LlamamientoData>) => {
    void mod.save(record.recordKey, { ...record.data, ...patch });
  };

  const cycleEtapa = (record: LocalRecord<LlamamientoData>) => {
    const idx = ETAPA_ORDER.indexOf(record.data.etapa);
    update(record, { etapa: ETAPA_ORDER[(idx + 1) % ETAPA_ORDER.length] });
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Obispado · Llamamientos"
        subtitle="Consideraciones en oración — cifrado de extremo a extremo"
        tone="deep-water"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> usa solo iniciales, nunca el
          nombre completo. Esta lista es un apoyo personal de oración y
          seguimiento — no reemplaza ni duplica el registro oficial (LCR).
          No incluyas información de recomendación para el templo, finanzas
          ni acciones disciplinarias.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nueva consideración
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Iniciales"
              placeholder="Ej. J.M."
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value)}
            />
            <TextField
              label="Llamamiento"
              placeholder="Ej. Maestro(a) de Doctrina del Evangelio"
              value={llamamiento}
              onChange={(e) => setLlamamiento(e.target.value)}
            />
            <TextField
              label="Organización"
              placeholder="Ej. Escuela Dominical"
              value={organizacion}
              onChange={(e) => setOrganizacion(e.target.value)}
            />
            <Button
              variant="accent"
              onClick={onAdd}
              disabled={saving || !iniciales.trim() || !llamamiento.trim()}
            >
              {saving ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Consideraciones ({mod.records.length})
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
              No hay consideraciones registradas todavía.
            </p>
          </Card>
        ) : (
          mod.records.map((r) => (
            <LlamamientoCard
              key={r.recordKey}
              record={r}
              onUpdate={update}
              onCycleEtapa={cycleEtapa}
              onDelete={() => mod.remove(r.recordKey)}
            />
          ))
        )}
      </main>
    </div>
  );
}

function LlamamientoCard({
  record,
  onUpdate,
  onCycleEtapa,
  onDelete,
}: {
  record: LocalRecord<LlamamientoData>;
  onUpdate: (record: LocalRecord<LlamamientoData>, patch: Partial<LlamamientoData>) => void;
  onCycleEtapa: (record: LocalRecord<LlamamientoData>) => void;
  onDelete: () => void;
}) {
  const d = record.data;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-semibold text-deep-water">
            {d.iniciales} — {d.llamamiento}
          </div>
          {d.organizacion ? (
            <div className="mt-0.5 text-[13px] text-muted-2">{d.organizacion}</div>
          ) : null}
        </div>
        <span
          onClick={() => onCycleEtapa(record)}
          className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] uppercase ${ETAPA_TONE[d.etapa]}`}
        >
          {ETAPA_LABEL[d.etapa]}
        </span>
      </div>

      {d.etapa === "entrevista_agendada" ||
      d.etapa === "extendido" ||
      d.etapa === "sostenido" ||
      d.etapa === "apartado" ? (
        <label className="mt-2.5 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-muted-2 uppercase">
            Fecha de entrevista
          </span>
          <input
            type="date"
            value={d.fechaEntrevista}
            onChange={(e) => onUpdate(record, { fechaEntrevista: e.target.value })}
            className="w-fit rounded-[7px] border border-line-card bg-linen px-2.5 py-1.5 text-sm"
          />
        </label>
      ) : null}

      <div className="mt-3 flex gap-2">
        <TextField
          label="Releva a (iniciales)"
          placeholder="Opcional"
          value={d.releva}
          onChange={(e) => onUpdate(record, { releva: e.target.value })}
          className="!h-11"
          wrapperClassName="min-w-0 flex-1"
        />
        <TextField
          label="Nota"
          placeholder="Opcional"
          value={d.nota}
          onChange={(e) => onUpdate(record, { nota: e.target.value })}
          className="!h-11"
          wrapperClassName="min-w-0 flex-1"
        />
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

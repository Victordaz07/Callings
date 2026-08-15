"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Participante = { iniciales: string; permisoRecibido: boolean };

type CampamentoData = {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  responsables: string;
  participantes: Participante[];
  nota: string;
};

function fmtFecha(fecha: string) {
  if (!fecha) return "";
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function HjCampamentoPage() {
  const mod = useSyncModule<CampamentoData>(MODULES.HJ_CAMPAMENTO);
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!nombre.trim() || !fechaInicio) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        nombre: nombre.trim(),
        fechaInicio,
        fechaFin,
        lugar: "",
        responsables: "",
        participantes: [],
        nota: "",
      });
      setNombre("");
      setFechaInicio("");
      setFechaFin("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<CampamentoData>, patch: Partial<CampamentoData>) => {
    void mod.update(record.recordKey, patch);
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="HJ · Campamento"
        subtitle="Actividades de varios días — cifrado de extremo a extremo"
        tone="deep-water"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> usa iniciales. &quot;Permiso
          recibido&quot; es solo una marca de sí/no — el formulario firmado se
          guarda en papel, nunca aquí. Sin datos médicos.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nuevo campamento
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Nombre"
              placeholder="Ej. Campamento de verano"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <div className="flex gap-2">
              <label className="min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-bold text-muted-2">Desde</span>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="h-[52px] w-full rounded-xl border-[1.5px] border-line-card bg-white px-2.5 text-sm"
                />
              </label>
              <label className="min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-bold text-muted-2">Hasta</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="h-[52px] w-full rounded-xl border-[1.5px] border-line-card bg-white px-2.5 text-sm"
                />
              </label>
            </div>
            <Button variant="accent" onClick={onAdd} disabled={saving || !nombre.trim() || !fechaInicio}>
              {saving ? "Guardando…" : "Agregar campamento"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Campamentos ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay campamentos registrados todavía.</p>
          </Card>
        ) : (
          mod.records.map((r) => (
            <CampamentoCard key={r.recordKey} record={r} onUpdate={update} onDelete={() => mod.remove(r.recordKey)} />
          ))
        )}
      </main>
    </div>
  );
}

function CampamentoCard({
  record,
  onUpdate,
  onDelete,
}: {
  record: LocalRecord<CampamentoData>;
  onUpdate: (record: LocalRecord<CampamentoData>, patch: Partial<CampamentoData>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pIniciales, setPIniciales] = useState("");
  const d = record.data;

  const addParticipante = () => {
    if (!pIniciales.trim()) return;
    onUpdate(record, {
      participantes: [...d.participantes, { iniciales: pIniciales.trim(), permisoRecibido: false }],
    });
    setPIniciales("");
  };

  const togglePermiso = (idx: number) => {
    const participantes = d.participantes.map((p, pidx) =>
      pidx === idx ? { ...p, permisoRecibido: !p.permisoRecibido } : p
    );
    onUpdate(record, { participantes });
  };

  const removeParticipante = (idx: number) => {
    onUpdate(record, { participantes: d.participantes.filter((_, pidx) => pidx !== idx) });
  };

  const permisosFaltantes = d.participantes.filter((p) => !p.permisoRecibido).length;

  return (
    <Card className="p-4">
      <div className="min-w-0 flex-1">
        <div className="font-display text-base font-semibold text-deep-water">{d.nombre}</div>
        <div className="mt-0.5 text-[13px] text-muted-2">
          {fmtFecha(d.fechaInicio)}
          {d.fechaFin ? ` – ${fmtFecha(d.fechaFin)}` : ""}
          {d.lugar ? ` · ${d.lugar}` : ""}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <TextField
          label="Lugar"
          placeholder="Opcional"
          value={d.lugar}
          onChange={(e) => onUpdate(record, { lugar: e.target.value })}
          className="!h-11"
          wrapperClassName="min-w-0 flex-1"
        />
        <TextField
          label="Responsables"
          placeholder="Ej. G.P., H.R."
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
        {expanded ? "▲" : "▼"} Participantes ({d.participantes.length})
        {permisosFaltantes > 0 ? (
          <span className="ml-1.5 text-rojo">· {permisosFaltantes} sin permiso</span>
        ) : null}
      </button>

      {expanded ? (
        <div className="mt-2">
          {d.participantes.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 border-b border-dashed border-line-card py-2 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={p.permisoRecibido}
                onChange={() => togglePermiso(idx)}
                className="h-[19px] w-[19px] accent-sage"
              />
              <span className="min-w-0 flex-1 text-sm text-ink">{p.iniciales}</span>
              <span className="text-[10px] font-bold uppercase text-muted-2">
                {p.permisoRecibido ? "Permiso ok" : "Falta permiso"}
              </span>
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

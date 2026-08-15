"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type Tipo = "primera_cita" | "seguimiento";
type Estado = "agendada" | "realizada" | "cancelada";

type CitaData = {
  iniciales: string;
  fecha: string;
  tipo: Tipo;
  estado: Estado;
  nota: string;
};

const TIPO_LABEL: Record<Tipo, string> = {
  primera_cita: "Primera cita",
  seguimiento: "Seguimiento",
};
const ESTADO_ORDER: Estado[] = ["agendada", "realizada", "cancelada"];
const ESTADO_LABEL: Record<Estado, string> = {
  agendada: "Agendada",
  realizada: "Realizada",
  cancelada: "Cancelada",
};
const ESTADO_TONE: Record<Estado, string> = {
  agendada: "bg-badge-pending-bg text-badge-pending-text",
  realizada: "bg-badge-done-bg text-badge-done-text",
  cancelada: "bg-badge-overdue-bg text-badge-overdue-text",
};

export default function HistoriaFamiliarTemploPage() {
  const mod = useSyncModule<CitaData>(MODULES.HISTORIA_FAMILIAR_TEMPLO);
  const [iniciales, setIniciales] = useState("");
  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState<Tipo>("primera_cita");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!iniciales.trim() || !fecha) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        iniciales: iniciales.trim(),
        fecha,
        tipo,
        estado: "agendada",
        nota: "",
      });
      setIniciales("");
      setFecha("");
      setTipo("primera_cita");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<CitaData>, patch: Partial<CitaData>) => {
    void mod.update(record.recordKey, patch);
  };

  const cycleEstado = (record: LocalRecord<CitaData>) => {
    const idx = ESTADO_ORDER.indexOf(record.data.estado);
    update(record, { estado: ESTADO_ORDER[(idx + 1) % ESTADO_ORDER.length] });
  };

  const sorted = [...mod.records].sort((a, b) => a.data.fecha.localeCompare(b.data.fecha));

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Historia Familiar y Templo"
        subtitle="Citas de consultoría — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> usa solo iniciales. Nunca
          registres datos genealógicos identificables de terceros ni
          información de recomendación para el templo.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nueva cita
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Iniciales"
              placeholder="Ej. D.H."
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value)}
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
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-muted-2">Tipo</span>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Tipo)}
                className="h-[52px] rounded-xl border-[1.5px] border-line-card bg-white px-3.5 text-base text-ink"
              >
                <option value="primera_cita">Primera cita</option>
                <option value="seguimiento">Seguimiento</option>
              </select>
            </label>
            <Button
              variant="accent"
              onClick={onAdd}
              disabled={saving || !iniciales.trim() || !fecha}
            >
              {saving ? "Guardando…" : "Agregar cita"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Citas ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay citas registradas todavía.</p>
          </Card>
        ) : (
          sorted.map((r) => (
            <Card key={r.recordKey} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-semibold text-deep-water">
                    {r.data.iniciales}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted-2">
                    {r.data.fecha} · {TIPO_LABEL[r.data.tipo]}
                  </div>
                </div>
                <span
                  onClick={() => cycleEstado(r)}
                  className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] uppercase ${ESTADO_TONE[r.data.estado]}`}
                >
                  {ESTADO_LABEL[r.data.estado]}
                </span>
              </div>
              <TextField
                label="Nota"
                placeholder="Opcional"
                value={r.data.nota}
                onChange={(e) => update(r, { nota: e.target.value })}
                className="!h-11 mt-3"
              />
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

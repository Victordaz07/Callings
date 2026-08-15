"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";

type AsistenciaData = {
  clase: string;
  fecha: string;
  conteo: number;
};

export default function SdAsistenciaGeneralPage() {
  const mod = useSyncModule<AsistenciaData>(MODULES.SD_ASISTENCIA_GENERAL);
  const [clase, setClase] = useState("");
  const [fecha, setFecha] = useState("");
  const [conteo, setConteo] = useState(0);
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!clase.trim() || !fecha) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        clase: clase.trim(),
        fecha,
        conteo,
      });
      setClase("");
      setFecha("");
      setConteo(0);
    } finally {
      setSaving(false);
    }
  };

  const sorted = [...mod.records].sort((a, b) => b.data.fecha.localeCompare(a.data.fecha));

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="SD · Asistencia General"
        subtitle="Conteo agregado por clase — cifrado de extremo a extremo"
        tone="deep-water"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> registra solo el número
          total de asistentes, sin nombres individuales.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">Nuevo registro</h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Clase"
              placeholder="Ej. Adultos jóvenes"
              value={clase}
              onChange={(e) => setClase(e.target.value)}
            />
            <div className="flex gap-2">
              <label className="min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-bold text-muted-2">Fecha</span>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="h-[52px] w-full rounded-xl border-[1.5px] border-line-card bg-white px-2.5 text-sm"
                />
              </label>
              <label className="min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-bold text-muted-2">Asistentes</span>
                <input
                  type="number"
                  min={0}
                  value={conteo}
                  onChange={(e) => setConteo(Number(e.target.value))}
                  className="h-[52px] w-full rounded-xl border-[1.5px] border-line-card bg-white px-2.5 text-sm"
                />
              </label>
            </div>
            <Button variant="accent" onClick={onAdd} disabled={saving || !clase.trim() || !fecha}>
              {saving ? "Guardando…" : "Agregar registro"}
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
          sorted.map((r) => (
            <Card key={r.recordKey} className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-semibold text-deep-water">
                  {r.data.clase}
                </div>
                <div className="mt-0.5 text-[13px] text-muted-2">{r.data.fecha}</div>
              </div>
              <span className="shrink-0 rounded-lg bg-badge-done-bg px-2.5 py-1.5 text-[11px] font-bold text-badge-done-text">
                {r.data.conteo}
              </span>
              <button
                type="button"
                onClick={() => mod.remove(r.recordKey)}
                className="ml-2 shrink-0 text-xs font-bold text-rojo"
              >
                Eliminar
              </button>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}

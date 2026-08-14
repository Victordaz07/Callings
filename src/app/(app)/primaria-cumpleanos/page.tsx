"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";

type CumpleanosData = {
  iniciales: string;
  clase: string;
  mes: number;
  dia: number;
};

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function PrimariaCumpleanosPage() {
  const mod = useSyncModule<CumpleanosData>(MODULES.PRIMARIA_CUMPLEANOS);
  const [iniciales, setIniciales] = useState("");
  const [clase, setClase] = useState("");
  const [mes, setMes] = useState(1);
  const [dia, setDia] = useState(1);
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!iniciales.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        iniciales: iniciales.trim(),
        clase: clase.trim(),
        mes,
        dia,
      });
      setIniciales("");
      setClase("");
    } finally {
      setSaving(false);
    }
  };

  const sorted = [...mod.records].sort((a, b) => a.data.mes - b.data.mes || a.data.dia - b.data.dia);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Primaria · Cumpleaños"
        subtitle="Recordatorios por mes — cifrado de extremo a extremo"
        tone="deep-water"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> guarda solo iniciales y
          mes/día — nunca el año de nacimiento ni el nombre completo del
          niño.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">Nuevo cumpleaños</h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Iniciales"
              placeholder="Ej. R.M."
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value)}
            />
            <TextField
              label="Clase"
              placeholder="Ej. Lobatos"
              value={clase}
              onChange={(e) => setClase(e.target.value)}
            />
            <div className="flex gap-2">
              <label className="min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-bold text-muted-2">Mes</span>
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="h-[52px] w-full rounded-xl border-[1.5px] border-line-card bg-white px-2.5 text-sm text-ink"
                >
                  {MESES.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-bold text-muted-2">Día</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dia}
                  onChange={(e) => setDia(Number(e.target.value))}
                  className="h-[52px] w-full rounded-xl border-[1.5px] border-line-card bg-white px-2.5 text-sm"
                />
              </label>
            </div>
            <Button variant="accent" onClick={onAdd} disabled={saving || !iniciales.trim()}>
              {saving ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Cumpleaños ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay cumpleaños registrados todavía.</p>
          </Card>
        ) : (
          sorted.map((r) => (
            <Card key={r.recordKey} className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-semibold text-deep-water">
                  {r.data.iniciales}
                </div>
                <div className="mt-0.5 text-[13px] text-muted-2">
                  {r.data.dia} de {MESES[r.data.mes - 1]}
                  {r.data.clase ? ` · ${r.data.clase}` : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => mod.remove(r.recordKey)}
                className="shrink-0 text-xs font-bold text-rojo"
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

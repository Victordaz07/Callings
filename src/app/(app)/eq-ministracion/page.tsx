"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";

type MinistracionData = { iniciales: string; nota: string };

export default function EqMinistracionPage() {
  const mod = useSyncModule<MinistracionData>(MODULES.EQ_MINISTRACION);
  const [iniciales, setIniciales] = useState("");
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!iniciales.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        iniciales: iniciales.trim(),
        nota: nota.trim(),
      });
      setIniciales("");
      setNota("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="EQ · Ministración"
        subtitle="Prueba de concepto — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nuevo registro
          </h2>
          <p className="mt-1 text-[13px] text-muted-2">
            Usa iniciales o un apodo — nunca el nombre completo de un
            miembro o investigador.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Iniciales o apodo"
              placeholder="Ej. J.P."
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value)}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-muted-2">Nota</span>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ej. necesita visita esta semana"
                className="min-h-[80px] rounded-xl border-[1.5px] border-line-card bg-white p-3 text-base text-ink placeholder:text-muted focus:border-living-teal focus:outline-none"
              />
            </label>
            <Button
              variant="accent"
              onClick={onSave}
              disabled={saving || !iniciales.trim()}
            >
              {saving ? "Guardando…" : "Guardar"}
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

        {mod.records.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-muted italic">No hay registros todavía.</p>
          </Card>
        ) : (
          mod.records.map((r) => (
            <Card key={r.recordKey} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold text-deep-water">
                    {r.data.iniciales}
                  </div>
                  {r.data.nota ? (
                    <p className="mt-1 text-sm text-ink">{r.data.nota}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
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
              </div>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}

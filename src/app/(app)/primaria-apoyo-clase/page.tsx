"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";

type ApoyoData = {
  iniciales: string;
  clase: string;
  estrategia: string;
};

export default function PrimariaApoyoClasePage() {
  const mod = useSyncModule<ApoyoData>(MODULES.PRIMARIA_APOYO_CLASE);
  const [iniciales, setIniciales] = useState("");
  const [clase, setClase] = useState("");
  const [estrategia, setEstrategia] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!iniciales.trim() || !estrategia.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        iniciales: iniciales.trim(),
        clase: clase.trim(),
        estrategia: estrategia.trim(),
      });
      setIniciales("");
      setClase("");
      setEstrategia("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Primaria · Apoyo en Clase"
        subtitle="Estrategias de enseñanza — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> usa iniciales y describe
          solo estrategias prácticas de enseñanza que la familia ya
          compartió (ej. &quot;instrucciones cortas y repetidas&quot;) — nunca
          diagnósticos médicos ni términos clínicos.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">Nueva nota</h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Iniciales"
              placeholder="Ej. J.L."
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value)}
            />
            <TextField
              label="Clase"
              placeholder="Ej. Estrellitas"
              value={clase}
              onChange={(e) => setClase(e.target.value)}
            />
            <TextField
              label="Estrategia de apoyo"
              placeholder="Ej. Prefiere sentarse cerca del maestro"
              value={estrategia}
              onChange={(e) => setEstrategia(e.target.value)}
            />
            <Button
              variant="accent"
              onClick={onAdd}
              disabled={saving || !iniciales.trim() || !estrategia.trim()}
            >
              {saving ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Notas ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay notas registradas todavía.</p>
          </Card>
        ) : (
          mod.records.map((r) => (
            <Card key={r.recordKey} className="p-4">
              <div className="font-display text-base font-semibold text-deep-water">
                {r.data.iniciales}
                {r.data.clase ? ` · ${r.data.clase}` : ""}
              </div>
              <div className="mt-1 text-sm text-ink">{r.data.estrategia}</div>
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

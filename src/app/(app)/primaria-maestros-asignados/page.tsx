"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";

type AsignacionData = {
  clase: string;
  maestro: string;
  suplente: string;
  nota: string;
};

export default function PrimariaMaestrosAsignadosPage() {
  const mod = useSyncModule<AsignacionData>(MODULES.PRIMARIA_MAESTROS_ASIGNADOS);
  const [clase, setClase] = useState("");
  const [maestro, setMaestro] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!clase.trim() || !maestro.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        clase: clase.trim(),
        maestro: maestro.trim(),
        suplente: "",
        nota: "",
      });
      setClase("");
      setMaestro("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Primaria · Maestros Asignados"
        subtitle="Directorio de maestros por clase — cifrado de extremo a extremo"
        tone="deep-water"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> usa iniciales de los
          maestros, no el nombre completo.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">Nueva asignación</h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Clase"
              placeholder="Ej. Abejitas"
              value={clase}
              onChange={(e) => setClase(e.target.value)}
            />
            <TextField
              label="Maestro (iniciales)"
              placeholder="Ej. F.Q."
              value={maestro}
              onChange={(e) => setMaestro(e.target.value)}
            />
            <Button variant="accent" onClick={onAdd} disabled={saving || !clase.trim() || !maestro.trim()}>
              {saving ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold tracking-wide text-muted-2 uppercase">
            Asignaciones ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay asignaciones registradas todavía.</p>
          </Card>
        ) : (
          mod.records.map((r) => (
            <Card key={r.recordKey} className="p-4">
              <div className="font-display text-base font-semibold text-deep-water">
                {r.data.clase}
              </div>
              <div className="mt-0.5 text-[13px] text-muted-2">Maestro: {r.data.maestro}</div>
              <TextField
                label="Suplente (iniciales)"
                placeholder="Opcional"
                value={r.data.suplente}
                onChange={(e) => void mod.update(r.recordKey, { suplente: e.target.value })}
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

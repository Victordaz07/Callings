"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";

type AsignacionData = {
  curso: string;
  clase: string;
  maestro: string;
  nota: string;
};

export default function SdMaestrosAsignadosPage() {
  const mod = useSyncModule<AsignacionData>(MODULES.SD_MAESTROS_ASIGNADOS);
  const [curso, setCurso] = useState("");
  const [clase, setClase] = useState("");
  const [maestro, setMaestro] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!curso.trim() || !maestro.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        curso: curso.trim(),
        clase: clase.trim(),
        maestro: maestro.trim(),
        nota: "",
      });
      setCurso("");
      setClase("");
      setMaestro("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="SD · Maestros Asignados"
        subtitle="Asignación por curso — cifrado de extremo a extremo"
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
              label="Curso"
              placeholder="Ej. Doctrina y Convenios"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
            />
            <TextField
              label="Clase (opcional)"
              placeholder="Ej. Adultos jóvenes"
              value={clase}
              onChange={(e) => setClase(e.target.value)}
            />
            <TextField
              label="Maestro (iniciales)"
              placeholder="Ej. W.S."
              value={maestro}
              onChange={(e) => setMaestro(e.target.value)}
            />
            <Button variant="accent" onClick={onAdd} disabled={saving || !curso.trim() || !maestro.trim()}>
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
            <Card key={r.recordKey} className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-semibold text-deep-water">
                  {r.data.curso}
                </div>
                <div className="mt-0.5 text-[13px] text-muted-2">
                  {r.data.clase ? `${r.data.clase} · ` : ""}Maestro: {r.data.maestro}
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

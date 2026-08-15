"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type TareaData = {
  tarea: string;
  completada: boolean;
  fechaCompletada: string | null;
  nota: string;
};

const TAREAS_SUGERIDAS = [
  "Reunión de traspaso con quien tenía el llamamiento antes",
  "Revisar el manual del llamamiento (por número, no copiarlo)",
  "Conocer a los miembros de mi organización",
  "Configurar el calendario de actividades",
  "Primera reunión con el obispado",
];

export default function OnboardingLiderPage() {
  const mod = useSyncModule<TareaData>(MODULES.ONBOARDING_LIDER);
  const [tarea, setTarea] = useState("");
  const [saving, setSaving] = useState(false);

  const addTarea = async (texto: string) => {
    if (!texto.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        tarea: texto.trim(),
        completada: false,
        fechaCompletada: null,
        nota: "",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleCompletada = (record: LocalRecord<TareaData>) => {
    void mod.save(record.recordKey, {
      ...record.data,
      completada: !record.data.completada,
      fechaCompletada: !record.data.completada ? new Date().toISOString() : null,
    });
  };

  const sugeridasFaltantes = TAREAS_SUGERIDAS.filter(
    (s) => !mod.records.some((r) => r.data.tarea === s)
  );

  const pendientes = mod.records.filter((r) => !r.data.completada);
  const completadas = mod.records.filter((r) => r.data.completada);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Incorporación de Líder"
        subtitle="Checklist de arranque para tu llamamiento — cifrado de extremo a extremo"
        tone="water-mid"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        {sugeridasFaltantes.length > 0 ? (
          <Card className="p-4">
            <h2 className="font-display text-lg font-semibold text-deep-water">
              Tareas sugeridas
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {sugeridasFaltantes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addTarea(s)}
                  disabled={saving}
                  className="rounded-lg border border-dashed border-line-card bg-linen px-3 py-2.5 text-left text-sm text-deep-water"
                >
                  + {s}
                </button>
              ))}
            </div>
          </Card>
        ) : null}

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Agregar tarea propia
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Tarea"
              placeholder="Ej. Aprender a usar el calendario del barrio"
              value={tarea}
              onChange={(e) => setTarea(e.target.value)}
            />
            <Button
              variant="accent"
              onClick={async () => {
                await addTarea(tarea);
                setTarea("");
              }}
              disabled={saving || !tarea.trim()}
            >
              {saving ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </Card>

        <h2 className="px-0.5 text-xs font-bold tracking-wide text-muted-2 uppercase">
          Pendientes ({pendientes.length})
        </h2>
        {pendientes.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-muted italic">Sin tareas pendientes.</p>
          </Card>
        ) : (
          pendientes.map((r) => (
            <TareaRow key={r.recordKey} record={r} onToggle={() => toggleCompletada(r)} onDelete={() => mod.remove(r.recordKey)} />
          ))
        )}

        {completadas.length > 0 ? (
          <>
            <h2 className="px-0.5 text-xs font-bold tracking-wide text-muted-2 uppercase">
              Completadas ({completadas.length})
            </h2>
            {completadas.map((r) => (
              <TareaRow key={r.recordKey} record={r} onToggle={() => toggleCompletada(r)} onDelete={() => mod.remove(r.recordKey)} />
            ))}
          </>
        ) : null}
      </main>
    </div>
  );
}

function TareaRow({
  record,
  onToggle,
  onDelete,
}: {
  record: LocalRecord<TareaData>;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-3.5">
      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={record.data.completada}
          onChange={onToggle}
          className="h-[19px] w-[19px] shrink-0 accent-sage"
        />
        <span
          className={`min-w-0 flex-1 text-sm ${record.data.completada ? "text-muted-2 line-through" : "text-ink"}`}
        >
          {record.data.tarea}
        </span>
        <button type="button" onClick={onDelete} className="shrink-0 text-xs font-bold text-rojo">
          Eliminar
        </button>
      </div>
    </Card>
  );
}

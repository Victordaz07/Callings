"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useSyncModule } from "@/lib/useSyncModule";
import { MODULES } from "@/lib/modules";
import type { LocalRecord } from "@/lib/localRecords";

type ContactoData = {
  iniciales: string;
  organizacion: string;
  llamamiento: string;
  telefono: string;
  correo: string;
  nota: string;
};

export default function DirectorioLiderazgoPage() {
  const mod = useSyncModule<ContactoData>(MODULES.DIRECTORIO_LIDERAZGO);
  const [iniciales, setIniciales] = useState("");
  const [organizacion, setOrganizacion] = useState("");
  const [llamamiento, setLlamamiento] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!iniciales.trim() || !llamamiento.trim()) return;
    setSaving(true);
    try {
      await mod.save(crypto.randomUUID(), {
        iniciales: iniciales.trim(),
        organizacion: organizacion.trim(),
        llamamiento: llamamiento.trim(),
        telefono: "",
        correo: "",
        nota: "",
      });
      setIniciales("");
      setOrganizacion("");
      setLlamamiento("");
    } finally {
      setSaving(false);
    }
  };

  const update = (record: LocalRecord<ContactoData>, patch: Partial<ContactoData>) => {
    void mod.update(record.recordKey, patch);
  };

  const sorted = [...mod.records].sort((a, b) =>
    a.data.organizacion.localeCompare(b.data.organizacion)
  );

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Directorio de Liderazgo"
        subtitle="A quién contactar por organización — cifrado de extremo a extremo"
        tone="deep-water"
      />
      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <div className="rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
          <b className="text-rojo">Privacidad:</b> usa iniciales, no el
          nombre completo. El teléfono/correo son opcionales y quedan
          cifrados igual que el resto de tus datos.
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-deep-water">
            Nuevo contacto
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <TextField
              label="Iniciales"
              placeholder="Ej. L.V."
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value)}
            />
            <TextField
              label="Organización"
              placeholder="Ej. Primaria"
              value={organizacion}
              onChange={(e) => setOrganizacion(e.target.value)}
            />
            <TextField
              label="Llamamiento"
              placeholder="Ej. Presidenta"
              value={llamamiento}
              onChange={(e) => setLlamamiento(e.target.value)}
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
            Contactos ({mod.records.length})
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
            <p className="text-sm text-muted italic">No hay contactos registrados todavía.</p>
          </Card>
        ) : (
          sorted.map((r) => (
            <Card key={r.recordKey} className="p-4">
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-semibold text-deep-water">
                  {r.data.iniciales} — {r.data.llamamiento}
                </div>
                <div className="mt-0.5 text-[13px] text-muted-2">{r.data.organizacion}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <TextField
                  label="Teléfono"
                  placeholder="Opcional"
                  value={r.data.telefono}
                  onChange={(e) => update(r, { telefono: e.target.value })}
                  className="!h-11"
                  wrapperClassName="min-w-0 flex-1"
                />
                <TextField
                  label="Correo"
                  placeholder="Opcional"
                  value={r.data.correo}
                  onChange={(e) => update(r, { correo: e.target.value })}
                  className="!h-11"
                  wrapperClassName="min-w-0 flex-1"
                />
              </div>
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

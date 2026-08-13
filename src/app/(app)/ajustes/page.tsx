import { auth, signOut } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/PageHeader";
import { Card, SectionLabel } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { RolesToggleList } from "./RolesToggleList";
import { saveUnitSettingsAction } from "./actions";

export default async function AjustesPage() {
  const session = await auth();
  const userId = session!.user!.email!;
  const settings = await getSettings(userId);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Ajustes"
        subtitle="Se usan en Secretario, Gather y BautizApp."
      />

      <main className="flex flex-1 flex-col gap-5 px-[22px] pt-5">
        <form action={saveUnitSettingsAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <SectionLabel>Unidad</SectionLabel>
            <Card className="flex flex-col gap-3 p-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-muted-2">
                  Barrio o rama
                </span>
                <select
                  name="unidad"
                  defaultValue={settings.unidad}
                  className="h-[52px] rounded-xl border-[1.5px] border-line-card bg-white px-3.5 text-base text-ink focus:border-living-teal focus:outline-none"
                >
                  <option value="barrio">Barrio</option>
                  <option value="rama">Rama</option>
                </select>
              </label>
              <TextField
                label="Nombre"
                name="nombreUnidad"
                defaultValue={settings.nombreUnidad}
                placeholder="Ej. Las Palmas"
              />
              <TextField
                label="Estaca o distrito"
                name="estacaDistrito"
                defaultValue={settings.estacaDistrito}
                placeholder="Ej. Estaca Valle Verde"
              />
              <TextField
                label="Misión"
                name="mision"
                defaultValue={settings.mision}
                placeholder="Opcional"
              />
            </Card>
          </div>

          <div className="flex flex-col gap-2.5">
            <SectionLabel>Liderazgo</SectionLabel>
            <Card className="flex flex-col gap-3 p-4">
              <TextField
                label="Obispo / presidente"
                name="obispoPresidente"
                defaultValue={settings.obispoPresidente}
              />
              <TextField
                label="Líder misional de barrio"
                name="liderMisional"
                defaultValue={settings.liderMisional}
              />
            </Card>
          </div>

          <Button type="submit" variant="accent" className="w-full">
            Guardar ajustes
          </Button>
        </form>

        <div className="flex flex-col gap-2.5">
          <SectionLabel>Mis llamamientos</SectionLabel>
          <RolesToggleList activeRoles={settings.roles} />
          <p className="px-1 text-[12.5px] leading-relaxed text-muted-2">
            Los llamamientos activos deciden qué secciones aparecen en
            Secretario.
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full py-3 text-center text-sm font-bold text-rojo"
          >
            Cerrar sesión
          </button>
        </form>
      </main>
    </div>
  );
}

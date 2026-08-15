import Link from "next/link";
import { auth } from "@/lib/auth";
import { getSettings, CALLING_ROLES } from "@/lib/settings";
import { Card } from "@/components/ui/Card";

const TOOLS = [
  {
    href: "/secretario",
    accent: "bg-water-mid",
    title: "Secretario",
    desc: "Agenda, minutas, asignaciones, ministración y más.",
    status: "Fase 2 · en construcción",
  },
  {
    href: "/gather",
    accent: "bg-living-teal",
    title: "Gather",
    desc: "Seguimiento de personas en enseñanza — líder misional.",
    status: "Fase 3 · por integrar",
  },
  {
    href: "/bautizapp",
    accent: "bg-dawn-coral",
    title: "BautizApp",
    desc: "Generador de programas e invitaciones de bautismo.",
    status: "Fase 3 · por integrar",
  },
];

export default async function InicioPage() {
  const session = await auth();
  const userId = session!.user!.email!;
  const settings = await getSettings(userId);

  const unitLabel = settings.nombreUnidad
    ? `${settings.unidad === "barrio" ? "Barrio" : "Rama"} ${settings.nombreUnidad}`
    : "Configura tu unidad en Ajustes";

  const activeRoleLabels = CALLING_ROLES.filter((r) =>
    settings.roles.includes(r.key)
  ).map((r) => r.label);

  return (
    <div className="flex flex-1 flex-col">
      <header className="relative overflow-hidden bg-deep-water px-[22px] pt-3.5 pb-5 text-linen">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -top-9 -right-14 opacity-20"
        >
          <circle cx="100" cy="100" r="28" fill="none" stroke="#DCEAE8" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="#DCEAE8" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="72" fill="none" stroke="#DCEAE8" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="94" fill="none" stroke="#DCEAE8" strokeWidth="1.5" />
        </svg>
        <div className="relative flex flex-col gap-3.5">
          <div>
            <div className="text-[13px] font-bold tracking-[0.12em] text-[#7FB8B4] uppercase">
              {unitLabel}
            </div>
            <h1 className="mt-1.5 font-display text-[29px] leading-[1.15] font-medium">
              Centro de Servicio
            </h1>
          </div>
          {activeRoleLabels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeRoleLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[rgba(220,234,232,0.28)] bg-[rgba(220,234,232,0.16)] px-[11px] py-1.5 text-xs font-semibold"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <Link
              href="/ajustes"
              className="w-fit rounded-full border border-[rgba(220,234,232,0.28)] bg-[rgba(220,234,232,0.16)] px-[11px] py-1.5 text-xs font-semibold"
            >
              Elige tus llamamientos en Ajustes →
            </Link>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-[22px] pt-5">
        <Card className="flex flex-col gap-3 p-[18px] pb-3.5 shadow-[0_2px_0_rgba(14,59,67,0.04)]">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[19px] font-semibold text-deep-water">
              Hoy
            </span>
          </div>
          <p className="text-sm text-muted-2">
            Aún no hay reuniones ni asignaciones activas — se activarán cuando
            completes el módulo Secretario.
          </p>
        </Card>

        <div className="flex flex-col gap-3">
          <span className="px-0.5 text-xs font-bold tracking-[0.14em] text-muted-2 uppercase">
            Tus herramientas
          </span>
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="relative flex items-center gap-3.5 overflow-hidden p-4 pl-[18px]">
                <span
                  className={`absolute inset-y-0 left-0 w-[5px] ${tool.accent}`}
                />
                <div className="flex flex-1 flex-col gap-1 pl-1">
                  <span className="font-display text-lg font-semibold text-deep-water">
                    {tool.title}
                  </span>
                  <span className="text-[13px] text-muted-2">{tool.desc}</span>
                  <span className="mt-1 w-fit rounded-md bg-amber-light px-2 py-0.5 text-[11px] font-bold text-amber uppercase">
                    {tool.status}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

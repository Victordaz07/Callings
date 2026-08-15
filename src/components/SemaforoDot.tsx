import { daysSince } from "@/lib/daysSince";

/**
 * Punto de semáforo reutilizable: verde si hubo contacto dentro del
 * umbral, rojo si pasó el umbral o nunca hubo contacto. Mismo patrón
 * visual que ya usa Ministración en el módulo Secretario.
 */
export function SemaforoDot({
  lastContact,
  thresholdDays = 30,
  className = "",
}: {
  lastContact: string | null;
  thresholdDays?: number;
  className?: string;
}) {
  const days = daysSince(lastContact);
  const alert = days === null || days > thresholdDays;
  return (
    <div
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${alert ? "bg-rojo" : "bg-sage"} ${className}`}
    />
  );
}

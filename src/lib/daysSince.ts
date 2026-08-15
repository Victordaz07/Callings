/**
 * Utilidad compartida entre módulos de seguimiento (ministración, WML
 * investigadores, y los que sigan) — días transcurridos desde una fecha
 * ISO, o null si nunca hubo contacto.
 */
export function daysSince(dateIso: string | null): number | null {
  if (!dateIso) return null;
  return Math.floor((Date.now() - new Date(dateIso).getTime()) / 86400000);
}

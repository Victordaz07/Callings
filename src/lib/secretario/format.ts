import type { Lang } from "./types";

export function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function nowTimeStr(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function daysSince(d: string | null): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

export function fmtDate(d: string, lang: Lang): string {
  return new Date(d).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateOnly(dstr: string | null | undefined, lang: Lang): string {
  if (!dstr) return "—";
  const [y, m, d] = dstr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(
    lang === "es" ? "es-ES" : "en-US",
    { day: "numeric", month: "short", year: "numeric" }
  );
}

export function nowIso(): string {
  return new Date().toISOString();
}

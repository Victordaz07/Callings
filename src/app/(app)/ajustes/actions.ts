"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  CALLING_ROLES,
  getSettings,
  saveSettings,
  type CallingRole,
} from "@/lib/settings";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autenticado");
  return session.user.email;
}

export async function toggleRoleAction(role: CallingRole) {
  const userId = await requireUserId();
  const isValidRole = CALLING_ROLES.some((r) => r.key === role);
  if (!isValidRole) throw new Error("Llamamiento inválido");

  const settings = await getSettings(userId);
  const has = settings.roles.includes(role);
  const roles = has
    ? settings.roles.filter((r) => r !== role)
    : [...settings.roles, role];

  await saveSettings(userId, { ...settings, roles });
  revalidatePath("/ajustes");
  revalidatePath("/");
}

export async function saveUnitSettingsAction(formData: FormData) {
  const userId = await requireUserId();
  const settings = await getSettings(userId);

  const unidad = formData.get("unidad") === "rama" ? "rama" : "barrio";
  const nombreUnidad = String(formData.get("nombreUnidad") ?? "").trim();
  const estacaDistrito = String(formData.get("estacaDistrito") ?? "").trim();
  const mision = String(formData.get("mision") ?? "").trim();
  const obispoPresidente = String(
    formData.get("obispoPresidente") ?? ""
  ).trim();
  const liderMisional = String(formData.get("liderMisional") ?? "").trim();

  await saveSettings(userId, {
    ...settings,
    unidad,
    nombreUnidad,
    estacaDistrito,
    mision,
    obispoPresidente,
    liderMisional,
  });

  revalidatePath("/ajustes");
  revalidatePath("/");
}

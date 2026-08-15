import { getValue, setValue } from "@/lib/storage";

export const SETTINGS_KEY = "shared-settings";

export type CallingRole = "cuorum_sds" | "ejecutivo" | "obispado" | "ed";

export const CALLING_ROLES: { key: CallingRole; label: string }[] = [
  { key: "cuorum_sds", label: "Secretario de Cuórum / Sociedad de Socorro" },
  { key: "ejecutivo", label: "Secretario Ejecutivo" },
  { key: "obispado", label: "Secretario de Obispado" },
  { key: "ed", label: "Escuela Dominical" },
];

export type SharedSettings = {
  unidad: "barrio" | "rama";
  nombreUnidad: string;
  estacaDistrito: string;
  mision: string;
  obispoPresidente: string;
  liderMisional: string;
  roles: CallingRole[];
};

export const DEFAULT_SETTINGS: SharedSettings = {
  unidad: "barrio",
  nombreUnidad: "",
  estacaDistrito: "",
  mision: "",
  obispoPresidente: "",
  liderMisional: "",
  roles: [],
};

export async function getSettings(userId: string): Promise<SharedSettings> {
  const stored = await getValue<Partial<SharedSettings>>(userId, SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(
  userId: string,
  settings: SharedSettings
): Promise<void> {
  await setValue(userId, SETTINGS_KEY, settings);
}

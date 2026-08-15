"use server";

import { auth } from "@/lib/auth";
import { getValue, setValue } from "@/lib/storage";
import { defaultSecretarioData } from "@/lib/secretario/defaults";
import type { SecretarioData } from "@/lib/secretario/types";

const SECRETARIO_KEY = "secretario-data";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autenticado");
  return session.user.email;
}

export async function loadSecretario(): Promise<SecretarioData> {
  const userId = await requireUserId();
  const stored = await getValue<SecretarioData>(userId, SECRETARIO_KEY);
  return stored ?? defaultSecretarioData();
}

export async function persistSecretario(data: SecretarioData): Promise<void> {
  const userId = await requireUserId();
  await setValue(userId, SECRETARIO_KEY, data);
}

"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function signup(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) return "Completa correo y contraseña.";
  if (password.length < 8)
    return "La contraseña debe tener al menos 8 caracteres.";
  if (password !== confirmPassword) return "Las contraseñas no coinciden.";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return "Ya existe una cuenta con ese correo.";

  const passwordHash = await bcrypt.hash(password, 12);
  const kdfSalt = crypto.randomBytes(16).toString("base64");

  await prisma.user.create({ data: { email, passwordHash, kdfSalt } });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Tu cuenta se creó, pero no pudimos iniciar sesión automáticamente. Entra manualmente.";
    }
    throw error;
  }
}

"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      passcode: formData.get("passcode"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Correo o código de acceso incorrectos.";
    }
    throw error;
  }
}

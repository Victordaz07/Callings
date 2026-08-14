"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function acceptConsent(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { consentedAt: new Date() },
  });
}

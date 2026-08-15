import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Regla crítica de este endpoint: nunca lee, parsea, ni valida el
 * contenido de `ciphertext`. Es ciego al contenido por diseño — solo
 * autentica al dueño del userId y mueve bytes. Cualquier validación de
 * "forma" de los datos (nombres, iniciales, etc.) vive en el cliente,
 * antes de cifrar.
 */

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(`records:${userId}`);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");
  const sinceParam = searchParams.get("since");

  if (!moduleId) {
    return NextResponse.json({ error: "moduleId requerido" }, { status: 400 });
  }

  let since: Date | undefined;
  if (sinceParam) {
    since = new Date(sinceParam);
    if (Number.isNaN(since.getTime())) {
      return NextResponse.json({ error: "since inválido" }, { status: 400 });
    }
  }

  const records = await prisma.record.findMany({
    where: {
      userId,
      moduleId,
      ...(since ? { updatedAt: { gt: since } } : {}),
    },
    orderBy: { updatedAt: "asc" },
  });

  return NextResponse.json({ records });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(`records:${userId}`);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const moduleId = body?.moduleId;
  const recordKey = body?.recordKey;
  const ciphertext = body?.ciphertext;
  const iv = body?.iv;

  if (
    typeof moduleId !== "string" ||
    !moduleId ||
    typeof recordKey !== "string" ||
    !recordKey ||
    typeof ciphertext !== "string" ||
    !ciphertext ||
    typeof iv !== "string" ||
    !iv
  ) {
    return NextResponse.json(
      { error: "Campos requeridos: moduleId, recordKey, ciphertext, iv" },
      { status: 400 }
    );
  }

  const record = await prisma.record.upsert({
    where: {
      userId_moduleId_recordKey: { userId, moduleId, recordKey },
    },
    create: { userId, moduleId, recordKey, ciphertext, iv },
    update: { ciphertext, iv, deleted: false },
  });

  return NextResponse.json({ record });
}

export async function DELETE(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(`records:${userId}`);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const moduleId = body?.moduleId;
  const recordKey = body?.recordKey;

  if (typeof moduleId !== "string" || !moduleId || typeof recordKey !== "string" || !recordKey) {
    return NextResponse.json(
      { error: "Campos requeridos: moduleId, recordKey" },
      { status: 400 }
    );
  }

  try {
    const record = await prisma.record.update({
      where: {
        userId_moduleId_recordKey: { userId, moduleId, recordKey },
      },
      data: { deleted: true },
    });
    return NextResponse.json({ record });
  } catch {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }
}

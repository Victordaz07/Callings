import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/BottomNav";
import { ConsentGate } from "@/components/ConsentGate";
import { EncryptionKeyProvider } from "@/components/EncryptionKeyProvider";
import { UnlockGate } from "@/components/UnlockGate";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const kdfSalt = session!.user!.kdfSalt;

  // Se consulta directo en Prisma (no en el JWT de la sesión) para que el
  // gate reaccione al toque, sin esperar a que expire/rote el token.
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { consentedAt: true },
  });

  return (
    <ConsentGate initialConsented={!!user?.consentedAt}>
      <EncryptionKeyProvider kdfSalt={kdfSalt}>
        <UnlockGate>
          <div className="mx-auto flex min-h-svh max-w-[540px] flex-col pb-[calc(96px+env(safe-area-inset-bottom))]">
            {children}
            <BottomNav />
          </div>
        </UnlockGate>
      </EncryptionKeyProvider>
    </ConsentGate>
  );
}

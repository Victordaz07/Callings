import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { EncryptionKeyProvider } from "@/components/EncryptionKeyProvider";
import { UnlockGate } from "@/components/UnlockGate";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const kdfSalt = session!.user!.kdfSalt;

  return (
    <EncryptionKeyProvider kdfSalt={kdfSalt}>
      <UnlockGate>
        <div className="mx-auto flex min-h-svh max-w-[540px] flex-col pb-[calc(96px+env(safe-area-inset-bottom))]">
          {children}
          <BottomNav />
        </div>
      </UnlockGate>
    </EncryptionKeyProvider>
  );
}

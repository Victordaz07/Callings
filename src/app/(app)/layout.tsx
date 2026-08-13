import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-[540px] flex-col pb-[calc(78px+env(safe-area-inset-bottom))]">
      {children}
      <BottomNav />
    </div>
  );
}

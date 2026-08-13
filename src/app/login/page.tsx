import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="relative overflow-hidden bg-deep-water px-6 pt-16 pb-14 text-linen">
        <svg
          width="240"
          height="240"
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -top-16 -right-16 opacity-20"
        >
          <circle cx="100" cy="100" r="28" fill="none" stroke="#DCEAE8" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="#DCEAE8" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="72" fill="none" stroke="#DCEAE8" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="94" fill="none" stroke="#DCEAE8" strokeWidth="1.5" />
        </svg>
        <div className="relative">
          <h1 className="font-display text-3xl font-medium">
            Centro de Servicio
          </h1>
          <p className="mt-2 text-sm text-mist/90">
            Secretario · Gather · BautizApp
          </p>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-10">
        <LoginForm />
      </main>
    </div>
  );
}

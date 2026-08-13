export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-2 bg-linen px-6 text-center">
      <p className="text-3xl">📡</p>
      <h1 className="font-display text-xl font-semibold text-deep-water">
        Sin conexión
      </h1>
      <p className="max-w-xs text-sm text-ink/70">
        No se pudo cargar esta pantalla porque no tienes internet. Tus datos
        guardados no se pierden — vuelve a intentarlo cuando te reconectes.
      </p>
    </main>
  );
}

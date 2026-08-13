"use client";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-[30px] w-[50px] shrink-0 items-center rounded-full p-[3px] transition-colors ${
        checked ? "justify-end bg-living-teal" : "justify-start bg-mist"
      }`}
    >
      <span
        className={`h-6 w-6 rounded-full bg-white ${checked ? "" : "shadow-[0_1px_3px_rgba(14,59,67,0.2)]"}`}
      />
    </button>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ICON_STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.8 };

const TABS: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/",
    label: "Inicio",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...ICON_STROKE}>
        <rect x="4" y="9" width="16" height="12" rx="2" />
        <path d="M3 10l9-6 9 6" />
      </svg>
    ),
  },
  {
    href: "/secretario",
    label: "Secretario",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...ICON_STROKE}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 13h8M8 17h4" />
      </svg>
    ),
  },
  {
    href: "/gather",
    label: "Gather",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...ICON_STROKE}>
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
  },
  {
    href: "/bautizapp",
    label: "Bautizos",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...ICON_STROKE}>
        <path d="M12 3c4 5 6 7.5 6 10a6 6 0 0 1-12 0c0-2.5 2-5 6-10z" />
      </svg>
    ),
  },
  {
    href: "/ajustes",
    label: "Ajustes",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...ICON_STROKE}>
        <path d="M4 8h16M4 16h16" />
        <circle cx="10" cy="8" r="2.4" fill="var(--color-linen)" />
        <circle cx="15" cy="16" r="2.4" fill="var(--color-linen)" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-0.5 border-t border-line-card bg-white px-2 pt-2.5 pb-[max(26px,env(safe-area-inset-bottom))]">
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex min-h-11 flex-col items-center gap-[5px] py-2 ${
              active ? "text-deep-water" : "text-muted"
            }`}
          >
            {tab.icon}
            <span className={`text-[11px] ${active ? "font-bold" : "font-semibold"}`}>
              {tab.label}
            </span>
            <span
              className={`h-[3px] w-[18px] rounded-full ${
                active ? "bg-dawn-coral" : "bg-transparent"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}

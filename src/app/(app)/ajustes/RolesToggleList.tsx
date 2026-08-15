"use client";

import { useTransition } from "react";
import { CardRow, CardRows } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { CALLING_ROLES, type CallingRole } from "@/lib/settings";
import { toggleRoleAction } from "./actions";

export function RolesToggleList({ activeRoles }: { activeRoles: CallingRole[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <CardRows>
      {CALLING_ROLES.map(({ key, label }) => {
        const checked = activeRoles.includes(key);
        return (
          <CardRow key={key}>
            <span
              className={`flex-1 text-base font-semibold ${checked ? "text-ink" : "text-muted-2"}`}
            >
              {label}
            </span>
            <Toggle
              checked={checked}
              label={label}
              onChange={() => {
                if (isPending) return;
                startTransition(() => {
                  toggleRoleAction(key);
                });
              }}
            />
          </CardRow>
        );
      })}
    </CardRows>
  );
}

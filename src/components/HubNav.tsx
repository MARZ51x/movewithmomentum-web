"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";

const TABS: { href: string; label: string; roles?: Role[] }[] = [
  { href: "/app", label: "Community Collab" },
  { href: "/app/insights", label: "Neighborhood Insights" },
  { href: "/app/toolkit", label: "Agent Toolkit", roles: ["agent"] },
];

export function HubNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const tabs = TABS.filter((t) => !t.roles || t.roles.includes(role));

  return (
    <nav className="flex items-center gap-1">
      {tabs.map((t) => {
        const active = t.href === "/app" ? pathname === "/app" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              active
                ? "text-primary bg-primary/10"
                : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

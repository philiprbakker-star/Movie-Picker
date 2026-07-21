"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/films", label: "Films" },
  { href: "/series", label: "Series" },
  { href: "/suggestions", label: "Suggesties" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 mb-6">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              active
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

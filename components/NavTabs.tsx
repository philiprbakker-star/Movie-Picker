"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/films", label: "Movies" },
  { href: "/series", label: "Series" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white border-b border-black/5">
      <div className="w-full px-4 sm:px-8 flex items-center gap-8 h-16">
        <span className="font-bold text-lg text-[#0f0726]">🎬 Movie Picker</span>
        <nav className="flex gap-2">
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                  active
                    ? "bg-[#eef2ff] text-[#4f46e5]"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

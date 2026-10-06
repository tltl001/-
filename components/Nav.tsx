"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "대시보드" },
  { href: "/foods", label: "음식 DB" },
  { href: "/meals", label: "식단 기록" },
  { href: "/goals", label: "목표 설정" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active ? "bg-emerald-700 text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

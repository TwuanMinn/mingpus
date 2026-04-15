'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileItems = [
  { href: "/", icon: "dashboard", label: "Dash" },
  { href: "/practice", icon: "auto_stories", label: "Practice" },
  { href: "/quiz", icon: "quiz", label: "Quiz" },
  { href: "/strokes", icon: "draw", label: "Draw" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.05)] flex justify-around items-center p-4 z-50">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 ${isActive ? "text-[#4648d4]" : "text-slate-500"}`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

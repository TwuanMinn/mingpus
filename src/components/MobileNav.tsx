'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileItems = [
  { href: "/", icon: "dashboard", label: "Dash" },
  { href: "/discover", icon: "explore", label: "Discover" },
  { href: "/dictionary", icon: "translate", label: "Dict" },
  { href: "/practice", icon: "auto_stories", label: "Practice" },
  { href: "/strokes", icon: "draw", label: "Draw" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fcf8ff]/80 backdrop-blur-xl shadow-[0_-4px_24px_rgba(70,72,212,0.06)] border-t border-outline-variant/10 flex justify-around items-center px-2 pb-5 pt-2 z-50 rounded-t-2xl">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 min-w-[48px] py-1 ${isActive ? "text-[#4648d4]" : "text-slate-400"}`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.05em]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

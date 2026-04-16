'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface UserInfo {
  name: string;
  email: string;
  image?: string | null;
}

const navItems = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/practice", icon: "auto_stories", label: "Practice" },
  { href: "/flashcards", icon: "style", label: "Flashcards" },
  { href: "/decks", icon: "collections_bookmark", label: "Decks" },
  { href: "/discover", icon: "explore", label: "Discover" },
  { href: "/dictionary", icon: "translate", label: "Dictionary" },
  { href: "/quiz", icon: "quiz", label: "Quiz" },
  { href: "/import", icon: "library_add", label: "Import" },
  { href: "/strokes", icon: "draw", label: "Strokes" },
  { href: "/analytics", icon: "insights", label: "Analytics" },
];

export function Sidebar({ user }: { user: UserInfo }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen p-4 w-64 border-r-0 bg-background z-50 font-[family-name:var(--font-jakarta)] tracking-tight transition-colors">
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold text-primary">Digital Calligrapher</h1>
        <p className="text-xs font-medium text-on-surface-variant uppercase tracking-widest mt-1">
          {user.name}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-200 text-[13px] ${
                isActive
                  ? "text-primary font-bold"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary-fixed rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined text-[20px] relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 bg-surface-container-low rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden border-2 border-primary-fixed-dim flex-shrink-0 flex items-center justify-center">
            {user.image ? (
              <img
                alt={user.name}
                src={user.image}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
            <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
          </div>
        </div>
        <Link
          href="/practice"
          className="block w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 text-center"
        >
          Start Daily Review
        </Link>
      </div>
    </aside>
  );
}

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/practice", icon: "auto_stories", label: "Practice" },
  { href: "/flashcards", icon: "style", label: "Flashcards" },
  { href: "/discover", icon: "explore", label: "Discover" },
  { href: "/dictionary", icon: "translate", label: "Dictionary" },
  { href: "/quiz", icon: "quiz", label: "Quiz" },
  { href: "/import", icon: "library_add", label: "Import" },
  { href: "/strokes", icon: "draw", label: "Strokes" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen p-4 w-64 border-r-0 bg-[#fcf8ff] z-50 font-[family-name:var(--font-jakarta)] tracking-tight">
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold text-[#4648d4]">Digital Calligrapher</h1>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Level 4 • HSK 5</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-200 text-[13px] ${
                isActive
                  ? "text-[#4648d4] font-bold bg-[#e1e0ff]"
                  : "text-slate-500 hover:text-[#4648d4] hover:bg-[#f5f2fe]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 bg-surface-container-low rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border-2 border-primary-fixed flex-shrink-0">
            <img
              alt="Learner Profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_rNpo5-faxr2l_tLHBG-WxJWZ3gdfhHggaMvHi1CpdaBIUltsuWQaYVnd7lttlMJrjVUsMZ3_mP-8S0XKhxgCIupLs-vrAjAYBpZZhNAQ4dBVg0RmjRJNosIjmKGIKx_qsauDRkM4h7k4FyFpDL5fiJHX5oVmoa7YRXJGu6qO-vuuuSi_tbysOFSnlEmAlo39hmYZRS11AJ81UmwxcM4_MILIak5V9tr-kb6GZq2juxpkhSwISjcLXpg9njxhc8qFYxcaokx84xjk"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">Level 4 • HSK 5</p>
            <p className="text-xs text-on-surface-variant">42 Day Streak</p>
          </div>
        </div>
        <button className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
          Start Daily Review
        </button>
      </div>
    </aside>
  );
}

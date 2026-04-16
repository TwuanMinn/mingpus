'use client';

import { useState, useCallback } from 'react';
import { useRouter } from "next/navigation";
import { ThemeToggle } from './ThemeToggle';

interface UserInfo {
  name: string;
  email: string;
  image?: string | null;
}

export function Header({ user }: { user: UserInfo }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dictionary?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, router]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/dictionary?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  }, [searchQuery, router]);

  return (
    <header className="flex justify-between items-center w-full px-4 sm:px-6 md:px-8 py-3 md:py-4 sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="md:hidden text-base sm:text-lg font-black text-primary font-[family-name:var(--font-jakarta)]">Digital Calligrapher</div>
      <div className="hidden md:flex items-center gap-2">
        <span className="text-lg font-black text-primary font-[family-name:var(--font-jakarta)] tracking-tight uppercase">Digital Calligrapher</span>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <input
            className="w-40 md:w-64 pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline outline-none text-on-surface"
            placeholder="Search characters..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="material-symbols-outlined text-outline text-lg hover:text-primary transition-colors">search</span>
          </button>
        </form>
        <div className="flex items-center gap-2 sm:gap-4 text-primary">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="hover:opacity-80 transition-opacity p-1"
            aria-label="Sign out"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">logout</span>
          </button>
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-high overflow-hidden border-2 border-primary-fixed flex-shrink-0 flex items-center justify-center">
          {user.image ? (
            <img
              alt={user.name}
              src={user.image}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { XPBar } from './XPBar';
import { StreakWidget } from './StreakWidget';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggle } from './ThemeToggle';
import { cn } from "@/lib/utils";

// Deterministic particles for logout overlay
const LOGOUT_PARTICLES = [
  { id: 0, x: 10,  y: 20, size: 3, opacity: 0.35, travel: 70,  dur: 4.0, delay: 0.6 },
  { id: 1, x: 30,  y: 10, size: 4, opacity: 0.28, travel: 55,  dur: 4.8, delay: 1.3 },
  { id: 2, x: 68,  y: 16, size: 3, opacity: 0.32, travel: 85,  dur: 3.6, delay: 0.9 },
  { id: 3, x: 82,  y: 30, size: 5, opacity: 0.25, travel: 65,  dur: 5.0, delay: 2.0 },
  { id: 4, x: 55,  y: 8,  size: 3, opacity: 0.30, travel: 90,  dur: 4.2, delay: 0.4 },
  { id: 5, x: 44,  y: 35, size: 4, opacity: 0.22, travel: 50,  dur: 4.6, delay: 1.6 },
  { id: 6, x: 20,  y: 50, size: 3, opacity: 0.28, travel: 75,  dur: 3.9, delay: 1.1 },
  { id: 7, x: 88,  y: 45, size: 4, opacity: 0.30, travel: 60,  dur: 4.3, delay: 0.8 },
];

function LogoutOverlay() {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: '#0E0E11',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Expanding glow */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.0, 0.0, 0.2, 1], delay: 0.1 }}
        style={{
          position: 'absolute',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,127,232,0.10) 0%, rgba(201,182,240,0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating particles */}
      {LOGOUT_PARTICLES.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, p.opacity, 0], y: -p.travel }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, repeatDelay: p.delay * 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute', left: `${p.x}%`, bottom: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            backgroundColor: 'rgba(139,127,232,0.6)', pointerEvents: 'none',
          }}
        />
      ))}

      {/* Animated exit icon — pulsing rings */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.15 }}
        style={{ position: 'relative', marginBottom: '2rem' }}
      >
        {/* Outer pulse ring */}
        <motion.div
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 1.6, 1.9], opacity: [0, 0.28, 0] }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 1.0, repeat: Infinity, repeatDelay: 0.6 }}
          style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '1.5px solid rgba(139,127,232,0.4)', pointerEvents: 'none' }}
        />
        {/* Inner pulse ring */}
        <motion.div
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 1.35, 1.55], opacity: [0, 0.38, 0] }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 1.3, repeat: Infinity, repeatDelay: 0.4 }}
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(201,182,240,0.45)', pointerEvents: 'none' }}
        />

        <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          {/* Background circle fill */}
          <circle cx="48" cy="48" r="42" fill="rgba(139,127,232,0.07)" />
          {/* Animated circle border */}
          <motion.circle
            cx="48" cy="48" r="42"
            stroke="url(#logoutGrad)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="264"
            initial={{ strokeDashoffset: 264 }}
            animate={{ strokeDashoffset: 0 }}
            style={{ transformOrigin: '48px 48px', transform: 'rotate(-90deg)' }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.22 }}
          />
          {/* Door/exit arrow — a right-pointing arrow with a door outline */}
          <motion.path
            d="M44 34H34a2 2 0 00-2 2v24a2 2 0 002 2h10"
            stroke="rgba(201,182,240,0.6)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60"
            initial={{ strokeDashoffset: 60 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.78 }}
          />
          <motion.path
            d="M52 38l10 10-10 10M62 48H42"
            stroke="#C9B6F0"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="52"
            initial={{ strokeDashoffset: 52 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut', delay: 1.05 }}
          />
          <defs>
            <linearGradient id="logoutGrad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B7FE8" />
              <stop offset="100%" stopColor="#C9B6F0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.6 }}
        style={{ textAlign: 'center', position: 'relative' }}
      >
        <h1 style={{ color: '#F0EFF8', fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.15, margin: '0 0 0.5rem', fontFamily: 'Inter, DM Sans, system-ui, sans-serif' }}>
          See you soon.
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.05 }}
          style={{ color: 'rgba(240,239,248,0.38)', fontSize: '0.9375rem', fontFamily: 'Inter, DM Sans, system-ui, sans-serif' }}
        >
          Signing you out&hellip;
        </motion.p>
      </motion.div>
    </motion.div>,
    document.body
  );
}

interface UserInfo {
  name: string;
  email: string;
  image?: string | null;
}

const navItems = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/practice", icon: "auto_stories", label: "Practice" },
  { href: "/study", icon: "school", label: "Study" },
  { href: "/discover", icon: "explore", label: "Discover" },
  { href: "/dictionary", icon: "translate", label: "Dictionary" },
  { href: "/import", icon: "library_add", label: "Import" },
  { href: "/strokes", icon: "draw", label: "Strokes" },
  { href: "/analytics", icon: "insights", label: "Analytics" },
];

export function Sidebar({ user }: { user: UserInfo }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Defer layoutId animations to avoid SSR/CSR hydration mismatch
  useEffect(() => { setMounted(true); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  // Focus first menuitem when dropdown opens; restore focus to trigger when it closes
  useEffect(() => {
    if (profileOpen) {
      const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    } else if (mounted) {
      // Only restore focus on subsequent closes, not initial render
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [profileOpen, mounted]);

  // Keyboard navigation inside the open menu (Arrow keys, Home/End, Esc)
  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    if (!items || items.length === 0) return;

    const list = Array.from(items);
    const activeIndex = list.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setProfileOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        list[(activeIndex + 1) % list.length].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        list[(activeIndex - 1 + list.length) % list.length].focus();
        break;
      case 'Home':
        e.preventDefault();
        list[0].focus();
        break;
      case 'End':
        e.preventDefault();
        list[list.length - 1].focus();
        break;
      case 'Tab':
        // Let Tab close the menu so focus moves naturally to next page element
        setProfileOpen(false);
        break;
    }
  };

  const handleSignOut = async () => {
    if (loggingOut) return;
    setProfileOpen(false);
    setLoggingOut(true);
    await fetch("/api/auth/sign-out", { method: "POST" });
    // Button shows spinner briefly, then overlay takes over
    setTimeout(() => setShowLogoutOverlay(true), 220);
    setTimeout(() => { router.push("/login"); router.refresh(); }, 2200);
  };

  return (
    <aside 
      suppressHydrationWarning
      className={cn(
        "hidden md:flex flex-col h-screen p-4 border-r bg-background font-(family-name:--font-jakarta) tracking-tight transition-all duration-300 sticky top-0 z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Top Profile & Collapse Button */}
      <div className={cn("flex mb-6 px-1", isCollapsed ? 'items-center justify-center gap-2' : 'items-center justify-between')}>
        <div ref={dropdownRef} className={cn("relative", isCollapsed ? 'hidden' : 'flex-1')}>
          {/* Profile trigger */}
          <button
            ref={triggerRef}
            onClick={() => setProfileOpen(!profileOpen)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            aria-controls="sidebar-profile-menu"
            className="flex items-center gap-3 w-full hover:bg-surface-container-low rounded-xl px-2 py-1.5 transition-colors group"
          >
            <div className="relative w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border-2 border-primary-fixed shrink-0 flex items-center justify-center">
              {user.image ? (
                <Image alt={user.name} src={user.image} fill sizes="32px" className="object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-bold text-primary truncate">{user.name}</p>
            </div>
            <motion.span
              animate={{ rotate: profileOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary"
              aria-hidden="true"
            >
              expand_more
            </motion.span>
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                ref={menuRef}
                id="sidebar-profile-menu"
                role="menu"
                aria-label="Account menu"
                onKeyDown={onMenuKeyDown}
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-full left-0 right-0 mt-1.5 z-60 bg-surface-container border border-outline-variant/20 rounded-xl shadow-xl shadow-black/20 overflow-hidden focus:outline-none"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-outline-variant/15">
                  <p className="text-xs font-bold text-on-surface truncate">{user.name}</p>
                  <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{user.email}</p>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <Link
                    href="/settings"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2 text-[13px] text-on-surface-variant hover:text-primary hover:bg-primary-fixed/50 focus:bg-primary-fixed/50 focus:outline-none transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">settings</span>
                    <span className="font-medium">Settings</span>
                  </Link>

                  <div className="flex items-center justify-between px-4 py-2 text-[13px] text-on-surface-variant">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">dark_mode</span>
                      <span className="font-medium">Theme</span>
                    </div>
                    <ThemeToggle />
                  </div>

                  <div className="mx-3 my-1 border-t border-outline-variant/15" />

                  <button
                    onClick={handleSignOut}
                    disabled={loggingOut}
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2 w-full text-[13px] text-error hover:bg-error-container/30 focus:bg-error-container/30 focus:outline-none transition-colors disabled:opacity-60"
                  >
                    {loggingOut ? (
                      <span className="w-[18px] h-[18px] border-2 border-error/30 border-t-error rounded-full animate-spin shrink-0" aria-hidden="true" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
                    )}
                    <span className="font-medium">{loggingOut ? 'Signing out…' : 'Logout'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapsed state: show avatar as dropdown trigger */}
        {isCollapsed && (
          <div ref={isCollapsed ? dropdownRef : undefined} className="relative mx-auto">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="relative w-9 h-9 rounded-full bg-surface-container-high overflow-hidden border-2 border-primary-fixed flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition-all"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              {user.image ? (
                <Image alt={user.name} src={user.image} fill sizes="36px" className="object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-full left-0 mt-1.5 z-60 w-52 bg-surface-container border border-outline-variant/20 rounded-xl shadow-xl shadow-black/20 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-outline-variant/15">
                    <p className="text-xs font-bold text-on-surface truncate">{user.name}</p>
                    <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1.5">
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-[13px] text-on-surface-variant hover:text-primary hover:bg-primary-fixed/50 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      <span className="font-medium">Settings</span>
                    </Link>
                    <div className="flex items-center justify-between px-4 py-2 text-[13px] text-on-surface-variant">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                        <span className="font-medium">Theme</span>
                      </div>
                      <ThemeToggle />
                    </div>
                    <div className="mx-3 my-1 border-t border-outline-variant/15" />
                    <button
                      onClick={handleSignOut}
                      disabled={loggingOut}
                      className="flex items-center gap-3 px-4 py-2 w-full text-[13px] text-error hover:bg-error-container/30 transition-colors disabled:opacity-60"
                    >
                      {loggingOut ? (
                        <span className="w-[18px] h-[18px] border-2 border-error/30 border-t-error rounded-full animate-spin shrink-0" />
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                      )}
                      <span className="font-medium">{loggingOut ? 'Signing out…' : 'Logout'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors shrink-0 press-scale"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-outlined text-xl">
            {isCollapsed ? "close" : "dock_to_right"}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto overflow-x-hidden scrollbar-hide pb-4">
        
        {/* XP Progress (Above Dashboard) */}
        <div className={cn("px-2", isCollapsed ? 'hidden' : 'block')}>
          <div className="bg-surface-container-low rounded-xl p-3">
            <XPBar />
          </div>
        </div>

        {/* Streak & Daily Goal Widget */}
        <div className={cn("px-2", isCollapsed ? 'hidden' : 'block')}>
          <StreakWidget />
        </div>

        {/* Start Daily Review Button */}
        <div className={cn("px-2", isCollapsed ? 'hidden' : 'block')}>
           <Link
              href="/practice"
              className="block w-full py-2.5 px-4 bg-linear-to-r from-primary to-secondary text-on-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-md shadow-primary/20 text-center"
            >
              Start Daily Review
            </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 mt-2" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                suppressHydrationWarning={true}
                aria-current={isActive ? "page" : undefined}
                aria-label={isCollapsed ? item.label : undefined}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 text-[13px]",
                  isActive
                    ? "text-primary font-bold"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                )}
              >
                {mounted && isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    suppressHydrationWarning={true}
                    className="absolute inset-0 bg-primary-fixed rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {/* Vertical active indicator bar */}
                {mounted && isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    suppressHydrationWarning={true}
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="material-symbols-outlined text-[20px] relative z-10 shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="relative z-10 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Notifications as a Nav Item */}
          <div className={cn(
            "relative flex items-center px-1.5 py-1 mt-1 rounded-xl transition-colors duration-200 text-[13px] text-on-surface-variant hover:bg-surface-container-low",
            isCollapsed ? 'justify-center' : 'gap-2'
          )} title={isCollapsed ? "Notifications" : undefined}>
            <NotificationCenter />
            {!isCollapsed && <span className="font-medium mr-2">Notifications</span>}
          </div>
        </nav>
      </div>

      {/* Logout overlay — portal to body */}
      {showLogoutOverlay && <LogoutOverlay />}
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { trpc } from '@/trpc/client';
import { getTypeMeta, groupByDate, parseNotificationData } from '@/lib/notifications';

type DropdownFilter = 'all' | 'unread';

const DROPDOWN_FILTERS: { id: DropdownFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
];

interface NotificationCenterProps {
  /**
   * Where the panel should anchor on desktop.
   *  - `sidebar`: opens to the right of the trigger (use when bell sits in the left sidebar)
   *  - `inline` : opens directly below the trigger
   *
   * On mobile the panel always slides up as a bottom-sheet regardless of placement.
   */
  placement?: 'sidebar' | 'inline';
  /** Optional label rendered next to the bell (e.g. "Notifications" in the sidebar). */
  label?: string;
}

export function NotificationCenter({ placement = 'inline', label }: NotificationCenterProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<DropdownFilter>('all');
  // Avoid the 2 list/count requests until the user has actually opened the panel once.
  const [everOpened, setEverOpened] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  useEffect(() => { setMounted(true); }, []);

  // Recalculate panel position when opening
  const computePanelPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    if (placement === 'sidebar') {
      // Position to the right of the trigger
      setPanelStyle({
        position: 'fixed',
        top: Math.max(8, rect.top),
        left: rect.right + 12,
        bottom: 'auto',
        right: 'auto',
      });
    } else {
      // Position below the trigger
      setPanelStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
        bottom: 'auto',
        left: 'auto',
      });
    }
  }, [placement]);

  const { data: notifications } = trpc.features.getNotifications.useQuery(
    { limit: 15 },
    { enabled: everOpened, staleTime: 60_000 },
  );
  const { data: unreadCount } = trpc.features.getUnreadCount.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    // Light-touch poll to surface server-generated notifications (streaks, summaries)
    // without requiring every mutation site to remember to invalidate.
    refetchInterval: 5 * 60_000,
  });
  const markRead = trpc.features.markNotificationRead.useMutation();
  const markAllRead = trpc.features.markAllNotificationsRead.useMutation();
  const deleteOne = trpc.features.deleteNotification.useMutation();
  const generateSummary = trpc.features.generateWeeklySummary.useMutation();
  const utils = trpc.useUtils();

  const filtered = useMemo(() => {
    if (!notifications) return [];
    return filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  }, [notifications, filter]);
  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const invalidate = () => {
    utils.features.getNotifications.invalidate();
    utils.features.getUnreadCount.invalidate();
  };

  // ── Open / close behaviour ─────────────────────────────────────────────────
  const toggle = () => {
    if (!open) {
      setEverOpened(true);
      // Compute position before opening
      computePanelPosition();
    }
    setOpen((v) => !v);
  };
  const close = () => setOpen(false);

  // Restore focus to the trigger when closing
  useEffect(() => {
    if (!open && everOpened) triggerRef.current?.focus({ preventScroll: true });
  }, [open, everOpened]);

  // Close on outside click + ESC anywhere
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        close();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Lock background scroll while the mobile bottom-sheet is open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // ── Item interactions ──────────────────────────────────────────────────────
  const handleSelect = async (id: number, href: string | undefined, wasUnread: boolean) => {
    if (wasUnread) {
      try {
        await markRead.mutateAsync({ id });
        invalidate();
      } catch (err: unknown) {
        console.warn('Failed to mark notification read:', err);
      }
    }
    if (href) {
      close();
      router.push(href);
    }
  };

  const handleAction = async (id: number, href: string, wasUnread: boolean) => {
    if (wasUnread) {
      try {
        await markRead.mutateAsync({ id });
        invalidate();
      } catch (err: unknown) {
        console.warn('Failed to mark notification read:', err);
      }
    }
    if (href) {
      close();
      router.push(href);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOne.mutateAsync({ id });
      invalidate();
    } catch (err: unknown) {
      console.warn('Failed to delete notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      invalidate();
    } catch (err: unknown) {
      console.warn('Failed to mark all read:', err);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      await generateSummary.mutateAsync();
      invalidate();
    } catch (err: unknown) {
      console.warn('Failed to generate weekly summary:', err);
    }
  };

  const panelContent = open && mounted ? (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-[998] bg-black/40 sm:bg-transparent sm:pointer-events-none"
        aria-hidden="true"
        onClick={close}
      />
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        style={panelStyle}
        className="fixed z-[999] bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl shadow-black/30 max-h-[min(80vh,28rem)] w-96 flex flex-col max-sm:!inset-auto max-sm:!bottom-0 max-sm:!left-0 max-sm:!right-0 max-sm:!top-auto max-sm:w-full max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:border-t"
      >
              {/* Mobile drag handle / header */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <span className="block w-10 h-1 rounded-full bg-outline/30" aria-hidden="true" />
              </div>

              {/* Header */}
              <div className="px-4 py-3 border-b border-outline-variant/10 flex justify-between items-center gap-3">
                <h3 className="font-bold text-on-surface text-sm">Notifications</h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={generateSummary.isPending}
                    className="text-[11px] font-bold text-primary hover:underline disabled:opacity-50"
                  >
                    {generateSummary.isPending ? 'Generating…' : '+ Summary'}
                  </button>
                  {(unreadCount ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Filter chips */}
              {(notifications?.length ?? 0) > 0 && (
                <div
                  className="px-4 py-2 flex gap-2 border-b border-outline-variant/10"
                  role="tablist"
                  aria-label="Filter notifications"
                >
                  {DROPDOWN_FILTERS.map((tab) => {
                    const active = filter === tab.id;
                    const count = tab.id === 'unread' ? (unreadCount ?? 0) : notifications!.length;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setFilter(tab.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          active
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                        }`}
                      >
                        {tab.label}{count > 0 && ` (${count})`}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* List */}
              <div
                className="overflow-y-auto flex-1 sm:flex-initial sm:max-h-80"
                aria-live="polite"
                aria-label="Notifications list"
              >
                {!notifications || notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline/40" aria-hidden="true">
                      notifications_off
                    </span>
                    <p className="text-sm text-on-surface-variant mt-2">No notifications yet</p>
                    <button
                      type="button"
                      onClick={handleGenerateSummary}
                      disabled={generateSummary.isPending}
                      className="mt-3 px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold hover:opacity-90 transition disabled:opacity-50"
                    >
                      Generate Weekly Summary
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-on-surface-variant">Nothing unread.</p>
                  </div>
                ) : (
                  <>
                    <DropdownBucket title="Today"     items={groups.today}     onSelect={handleSelect} onDelete={handleDelete} onAction={handleAction} />
                    <DropdownBucket title="Yesterday" items={groups.yesterday} onSelect={handleSelect} onDelete={handleDelete} onAction={handleAction} />
                    <DropdownBucket title="Earlier"   items={groups.earlier}   onSelect={handleSelect} onDelete={handleDelete} onAction={handleAction} />
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-outline-variant/10 flex justify-between items-center">
                <Link
                  href="/notifications"
                  onClick={close}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  See all notifications
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className="text-[11px] font-bold text-on-surface-variant hover:text-on-surface sm:hidden"
                >
                  Close
                </button>
              </div>
      </div>
    </>
  ) : null;

  return (
    <div className={`relative ${label ? '' : 'inline-block'}`}>
      {/* Trigger: bell + optional label, single click target */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label ? `${label}${unreadCount ? `, ${unreadCount} unread` : ''}` : 'Notifications'}
        className={`relative flex items-center gap-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-primary min-h-11 ${
          label ? 'px-2 py-1.5 w-full' : 'p-2'
        }`}
      >
        <span className="relative">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            notifications
          </span>
          {(unreadCount ?? 0) > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              {unreadCount! > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        {label && <span className="text-[13px] font-medium">{label}</span>}
      </button>

      {/* Portal panel to body so it escapes sidebar overflow clipping */}
      {mounted && createPortal(panelContent, document.body)}
    </div>
  );
}

interface DropdownItem {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data: string | null;
  createdAt: Date | string | number;
}

function DropdownBucket({
  title,
  items,
  onSelect,
  onDelete,
  onAction,
}: {
  title: string;
  items: DropdownItem[];
  onSelect: (id: number, href: string | undefined, wasUnread: boolean) => void;
  onDelete: (id: number) => void;
  onAction: (id: number, href: string, wasUnread: boolean) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <h4 className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-outline">
        {title}
      </h4>
      <ul>
        {items.map((n) => {
          const meta = getTypeMeta(n.type);
          const parsed = parseNotificationData(n.data);
          const href = parsed.href;
          const actions = parsed.actions;
          const interactive = !n.read || Boolean(href) || (actions && actions.length > 0);
          return (
            <li
              key={n.id}
              className={`group relative border-b border-outline-variant/5 ${!n.read ? 'bg-primary-fixed/20' : ''}`}
            >
              <button
                type="button"
                disabled={!interactive}
                onClick={() => onSelect(n.id, href, !n.read)}
                className={`w-full text-left p-4 pr-11 flex gap-3 transition-colors ${
                  interactive
                    ? 'hover:bg-surface-container-low focus:bg-surface-container-low focus:outline-none cursor-pointer'
                    : 'cursor-default'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${meta.color} mt-0.5 shrink-0`}
                  aria-hidden="true"
                >
                  {meta.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between items-start gap-2">
                    <span
                      className={`text-sm font-bold ${
                        !n.read ? 'text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {n.title}
                    </span>
                    {!n.read && (
                      <span
                        className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5"
                        aria-label="Unread"
                      />
                    )}
                  </span>
                  <span className="block text-xs text-on-surface-variant mt-1 line-clamp-2">
                    {n.message}
                  </span>
                  <span className="block text-[10px] text-outline mt-1">
                    {new Date(n.createdAt).toLocaleString('en', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {href && !actions?.length && <span className="ml-2 text-primary">· Open →</span>}
                  </span>
                </span>
              </button>
              {/* Rich Action Buttons */}
              {actions && actions.length > 0 && (
                <div className="px-4 pb-3 pt-0 pl-11 flex flex-wrap gap-1.5">
                  {actions.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(n.id, action.href, !n.read);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all hover:scale-[1.03] active:scale-[0.97] ${
                        action.variant === 'primary'
                          ? 'bg-primary text-on-primary shadow-sm shadow-primary/20'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                      }`}
                    >
                      {action.icon && (
                        <span className="material-symbols-outlined text-[12px]">{action.icon}</span>
                      )}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(n.id);
                }}
                aria-label={`Delete notification: ${n.title}`}
                className="absolute top-2 right-2 w-7 h-7 rounded-full text-outline opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-error/10 hover:text-error focus:bg-error/10 focus:text-error focus:outline-none transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

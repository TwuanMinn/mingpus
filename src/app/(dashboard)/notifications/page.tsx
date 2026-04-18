'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { trpc } from '@/trpc/client';
import {
  NOTIFICATION_TYPE_META,
  type NotificationType,
  getTypeMeta,
  groupByDate,
  parseNotificationData,
} from '@/lib/notifications';

type FilterMode = 'all' | 'unread' | NotificationType;

const FILTER_TABS: { id: FilterMode; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'streak', label: 'Streaks' },
  { id: 'milestone', label: 'Milestones' },
  { id: 'weekly_summary', label: 'Summaries' },
  { id: 'reminder', label: 'Reminders' },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterMode>('all');

  const { data: notifications, isLoading } = trpc.features.getNotifications.useQuery({ limit: 100 });
  const { data: unreadCount } = trpc.features.getUnreadCount.useQuery();
  const utils = trpc.useUtils();
  const markRead = trpc.features.markNotificationRead.useMutation();
  const markAllRead = trpc.features.markAllNotificationsRead.useMutation();
  const deleteOne = trpc.features.deleteNotification.useMutation();
  const clearRead = trpc.features.clearReadNotifications.useMutation();
  const generateSummary = trpc.features.generateWeeklySummary.useMutation();

  const invalidate = () => {
    utils.features.getNotifications.invalidate();
    utils.features.getUnreadCount.invalidate();
  };

  const filtered = useMemo(() => {
    if (!notifications) return [];
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const handleSelect = async (id: number, href: string | undefined, wasUnread: boolean) => {
    if (wasUnread) {
      try {
        await markRead.mutateAsync({ id });
        invalidate();
      } catch (err: unknown) {
        console.warn('Failed to mark read:', err);
      }
    }
    if (href) router.push(href);
  };

  const handleAction = async (id: number, href: string, wasUnread: boolean) => {
    if (wasUnread) {
      try {
        await markRead.mutateAsync({ id });
        invalidate();
      } catch (err: unknown) {
        console.warn('Failed to mark read:', err);
      }
    }
    if (href) router.push(href);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOne.mutateAsync({ id });
      invalidate();
    } catch (err: unknown) {
      console.warn('Failed to delete notification:', err);
    }
  };

  const handleClearRead = async () => {
    try {
      await clearRead.mutateAsync();
      invalidate();
    } catch (err: unknown) {
      console.warn('Failed to clear read notifications:', err);
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
      console.warn('Failed to generate summary:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <Link href="/" className="text-xs text-on-surface-variant hover:text-primary inline-flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
            Back to dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-(family-name:--font-jakarta)">
            Notifications
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {unreadCount && unreadCount > 0
              ? `${unreadCount} unread`
              : 'You\u2019re all caught up'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={generateSummary.isPending}
            className="px-3 py-2 rounded-full text-xs font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition disabled:opacity-50"
          >
            {generateSummary.isPending ? 'Generating…' : '+ Weekly Summary'}
          </button>
          {(unreadCount ?? 0) > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-3 py-2 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90 transition"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={handleClearRead}
            disabled={clearRead.isPending}
            className="px-3 py-2 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant hover:text-error hover:bg-error/10 transition disabled:opacity-50"
          >
            Clear read
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide" role="tablist" aria-label="Filter notifications">
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                active
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2" aria-label="Loading notifications">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-container-low animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-outline/40" aria-hidden="true">
            notifications_off
          </span>
          <p className="text-sm text-on-surface-variant mt-3">
            {filter === 'all'
              ? 'No notifications yet.'
              : filter === 'unread'
                ? 'Nothing unread.'
                : `No ${(NOTIFICATION_TYPE_META[filter as NotificationType]?.label ?? filter).toLowerCase()} notifications.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <Bucket title="Today" items={groups.today} onSelect={handleSelect} onDelete={handleDelete} onAction={handleAction} />
          <Bucket title="Yesterday" items={groups.yesterday} onSelect={handleSelect} onDelete={handleDelete} onAction={handleAction} />
          <Bucket title="Earlier" items={groups.earlier} onSelect={handleSelect} onDelete={handleDelete} onAction={handleAction} />
        </div>
      )}
    </div>
  );
}

interface NotificationRow {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data: string | null;
  createdAt: Date | string | number;
}

function Bucket({
  title,
  items,
  onSelect,
  onDelete,
  onAction,
}: {
  title: string;
  items: NotificationRow[];
  onSelect: (id: number, href: string | undefined, wasUnread: boolean) => void;
  onDelete: (id: number) => void;
  onAction: (id: number, href: string, wasUnread: boolean) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-outline mb-2 px-1">
        {title}
      </h2>
      <ul className="space-y-2">
        {items.map((n) => {
          const meta = getTypeMeta(n.type);
          const parsed = parseNotificationData(n.data);
          const href = parsed.href;
          const actions = parsed.actions;
          const interactive = !n.read || Boolean(href) || (actions && actions.length > 0);
          return (
            <li
              key={n.id}
              className={`group rounded-xl border border-outline-variant/10 overflow-hidden transition-colors ${
                !n.read ? 'bg-primary-fixed/15' : 'bg-surface-container-low'
              }`}
            >
              <div className="flex items-stretch">
                <button
                  type="button"
                  disabled={!interactive}
                  onClick={() => onSelect(n.id, href, !n.read)}
                  className={`flex-1 text-left p-4 flex gap-3 ${
                    interactive
                      ? 'hover:bg-surface-container-high focus:bg-surface-container-high focus:outline-none cursor-pointer'
                      : 'cursor-default'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${meta.color} mt-0.5 shrink-0`}
                    aria-hidden="true"
                  >
                    {meta.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className={`text-sm font-bold ${!n.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" aria-label="Unread" />
                      )}
                    </span>
                    <span className="block text-xs text-on-surface-variant mt-1">{n.message}</span>
                    <span className="block text-[10px] text-outline mt-1.5">
                      {new Date(n.createdAt).toLocaleString('en', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {href && !actions?.length && <span className="ml-2 text-primary">· Open →</span>}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(n.id)}
                  aria-label={`Delete notification: ${n.title}`}
                  className="px-3 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors flex items-center justify-center min-w-11"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
                </button>
              </div>
              {/* Rich Action Buttons */}
              {actions && actions.length > 0 && (
                <div className="px-4 pb-3 pl-[52px] flex flex-wrap gap-2">
                  {actions.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(n.id, action.href, !n.read);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        action.variant === 'primary'
                          ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                      }`}
                    >
                      {action.icon && (
                        <span className="material-symbols-outlined text-[14px]">{action.icon}</span>
                      )}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

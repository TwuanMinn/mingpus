'use client';

import { trpc } from '@/trpc/client';
import { useState } from 'react';

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  weekly_summary: { icon: 'bar_chart', color: 'text-primary' },
  milestone: { icon: 'emoji_events', color: 'text-secondary' },
  streak: { icon: 'local_fire_department', color: 'text-error' },
  reminder: { icon: 'notifications', color: 'text-tertiary' },
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = trpc.getNotifications.useQuery();
  const { data: unreadCount } = trpc.getUnreadCount.useQuery();
  const markRead = trpc.markNotificationRead.useMutation();
  const markAllRead = trpc.markAllNotificationsRead.useMutation();
  const generateSummary = trpc.generateWeeklySummary.useMutation();
  const utils = trpc.useUtils();

  const handleMarkRead = async (id: number) => {
    await markRead.mutateAsync({ id });
    utils.getNotifications.invalidate();
    utils.getUnreadCount.invalidate();
  };

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync();
    utils.getNotifications.invalidate();
    utils.getUnreadCount.invalidate();
  };

  const handleGenerateSummary = async () => {
    await generateSummary.mutateAsync();
    utils.getNotifications.invalidate();
    utils.getUnreadCount.invalidate();
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-surface-container-high transition-colors"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-on-error text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-2xl shadow-on-surface/10 border border-outline-variant/20 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-bold text-on-surface text-sm">Notifications</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateSummary}
                  disabled={generateSummary.isPending}
                  className="text-[10px] font-bold text-primary hover:underline disabled:opacity-50"
                >
                  {generateSummary.isPending ? 'Generating...' : '+ Weekly Summary'}
                </button>
                {(unreadCount ?? 0) > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {!notifications || notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline/40">notifications_off</span>
                  <p className="text-sm text-on-surface-variant mt-2">No notifications yet</p>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={generateSummary.isPending}
                    className="mt-3 px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold hover:opacity-90 transition disabled:opacity-50"
                  >
                    Generate Weekly Summary
                  </button>
                </div>
              ) : (
                notifications.map((n) => {
                  const typeConfig = TYPE_ICONS[n.type] || TYPE_ICONS.reminder;
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.read && handleMarkRead(n.id)}
                      className={`p-4 border-b border-outline-variant/5 flex gap-3 cursor-pointer hover:bg-surface-container-low transition-colors ${
                        !n.read ? 'bg-primary-fixed/20' : ''
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${typeConfig.color} mt-0.5 flex-shrink-0`}>
                        {typeConfig.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-bold ${!n.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                            {n.title}
                          </p>
                          {!n.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-outline mt-1">
                          {new Date(n.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

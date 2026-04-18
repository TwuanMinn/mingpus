/**
 * Shared types + helpers for the notifications feature.
 *
 * Notifications carry an optional JSON `data` payload so the UI can render
 * contextual action buttons (e.g. "Start Rescue Session", "View Analytics")
 * that deep-link the user straight into the relevant workflow.
 */

export const NOTIFICATION_TYPE_META = {
  weekly_summary: { icon: 'bar_chart',              color: 'text-primary',   label: 'Weekly Summary' },
  milestone:      { icon: 'emoji_events',           color: 'text-secondary', label: 'Milestone' },
  streak:         { icon: 'local_fire_department',  color: 'text-error',     label: 'Streak' },
  reminder:       { icon: 'notifications',          color: 'text-tertiary',  label: 'Reminder' },
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPE_META;

/** An actionable button embedded within a notification. */
export interface NotificationAction {
  /** Button label shown to the user. */
  label: string;
  /** Next.js route to navigate to on click. */
  href: string;
  /** Material Symbols icon name (optional). */
  icon?: string;
  /** Visual variant: primary CTA vs subtle secondary action. */
  variant?: 'primary' | 'secondary';
}

export interface NotificationData {
  /** Legacy: simple navigation href (still supported for backwards compat). */
  href?: string;
  /** Rich action buttons rendered below the notification message. */
  actions?: NotificationAction[];
}

export function getTypeMeta(type: string) {
  return NOTIFICATION_TYPE_META[type as NotificationType] ?? NOTIFICATION_TYPE_META.reminder;
}

export function parseNotificationData(raw: string | null | undefined): NotificationData {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {};

    const result: NotificationData = {};

    // Legacy href support
    if (typeof parsed.href === 'string') {
      result.href = parsed.href;
    }

    // Rich actions
    if (Array.isArray(parsed.actions)) {
      result.actions = (parsed.actions as Record<string, unknown>[])
        .filter(a => a && typeof a === 'object' && typeof a.label === 'string' && typeof a.href === 'string')
        .map(a => ({
          label: a.label as string,
          href: a.href as string,
          icon: typeof a.icon === 'string' ? a.icon : undefined,
          variant: a.variant === 'secondary' ? 'secondary' as const : 'primary' as const,
        }));
    }

    return result;
  } catch {
    // Ignore parsing errors
  }
  return {};
}

/** Group notifications into rough date buckets for display. */
export function groupByDate<T extends { createdAt: Date | string | number }>(items: T[]) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const startOfTodayMs = startOfToday.getTime();
  const startOfYesterdayMs = startOfTodayMs - 86400000; // 24 hours
  // 7 days grouping is kept for future expansion if needed

  const today: T[] = [];
  const yesterday: T[] = [];
  const earlier: T[] = [];

  for (const item of items) {
    const createdMs = new Date(item.createdAt).getTime();
    if (createdMs >= startOfTodayMs) {
      today.push(item);
    } else if (createdMs >= startOfYesterdayMs) {
      yesterday.push(item);
    } else {
      earlier.push(item);
    }
  }

  return { today, yesterday, earlier };
}

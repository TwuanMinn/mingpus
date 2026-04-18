'use client';

import { trpc } from '@/trpc/client';

/**
 * Wraps `gamification.awardXP` with automatic invalidation of the unread
 * notification count — the server may insert streak / freeze / milestone
 * notifications during the XP award, and the sidebar badge should reflect
 * them without a full page reload.
 *
 * Use this hook anywhere you'd otherwise call `trpc.gamification.awardXP.useMutation()`.
 */
export function useAwardXP() {
  const utils = trpc.useUtils();
  return trpc.gamification.awardXP.useMutation({
    onSuccess: () => {
      utils.features.getUnreadCount.invalidate();
    },
  });
}

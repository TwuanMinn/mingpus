'use client';

import { useEffect, useCallback, useState } from 'react';
import { openDB, type IDBPDatabase } from 'idb';

interface PendingReview {
  id?: number;
  progressId: number;
  quality: number;
  responseTimeMs?: number;
  queuedAt: number;
}

const DB_NAME = 'dc-offline-reviews';
const DB_VERSION = 1;
const STORE_NAME = 'pending-reviews';

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [pendingCount, setPendingCount] = useState(0);

  // Track online/offline status
  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Refresh pending count
  const refreshCount = useCallback(async () => {
    try {
      const db = await getDB();
      const count = await db.count(STORE_NAME);
      setPendingCount(count);
    } catch {
      // IndexedDB unavailable (SSR, private mode)
    }
  }, []);

  useEffect(() => { refreshCount(); }, [refreshCount]);

  /** Enqueue a review for later submission (called when offline). */
  const enqueue = useCallback(async (review: Omit<PendingReview, 'id' | 'queuedAt'>) => {
    try {
      const db = await getDB();
      await db.add(STORE_NAME, { ...review, queuedAt: Date.now() });
      await refreshCount();

      // Register background sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        await (reg as ServiceWorkerRegistration & { sync?: { register(tag: string): Promise<void> } }).sync?.register('sync-reviews');
      }
    } catch {
      // Silent fail
    }
  }, [refreshCount]);

  /** Flush queued reviews now that we're online. */
  const flush = useCallback(async (
    submitFn: (r: Omit<PendingReview, 'id' | 'queuedAt'>) => Promise<unknown>,
  ) => {
    try {
      const db = await getDB();
      const all = await db.getAll(STORE_NAME) as PendingReview[];
      for (const review of all) {
        try {
          await submitFn({ progressId: review.progressId, quality: review.quality, responseTimeMs: review.responseTimeMs });
          await db.delete(STORE_NAME, review.id!);
        } catch {
          break; // Stop on first error; will retry later
        }
      }
      await refreshCount();
    } catch {
      // Silent fail
    }
  }, [refreshCount]);

  return { isOnline, pendingCount, enqueue, flush };
}

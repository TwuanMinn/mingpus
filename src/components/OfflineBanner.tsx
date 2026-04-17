'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface OfflineBannerProps {
  isOnline: boolean;
  pendingCount: number;
}

export function OfflineBanner({ isOnline, pendingCount }: OfflineBannerProps) {
  return (
    <AnimatePresence>
      {(!isOnline || pendingCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full shadow-lg text-sm font-semibold backdrop-blur-md border ${
            !isOnline
              ? 'bg-surface-container/95 border-warning/30 text-warning'
              : 'bg-surface-container/95 border-primary/30 text-primary'
          }`}
          role="status"
          aria-live="polite"
        >
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {!isOnline ? 'wifi_off' : 'cloud_sync'}
          </span>
          {!isOnline
            ? `Offline — reviews queued (${pendingCount})`
            : `Syncing ${pendingCount} queued review${pendingCount !== 1 ? 's' : ''}…`}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface p-8 text-center">
      <span
        className="material-symbols-outlined text-8xl text-primary/60 mb-6"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        cloud_off
      </span>
      <h1 className="text-3xl font-(family-name:--font-jakarta) font-bold mb-3">
        You&apos;re Offline
      </h1>
      <p className="text-on-surface-variant max-w-md mb-8 leading-relaxed">
        It looks like you&apos;ve lost your internet connection.
        Don&apos;t worry — your progress is saved locally and will sync when you&apos;re back online.
      </p>
      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-linear-to-r from-primary to-secondary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
        >
          Try Again
        </button>
        <span className="text-xs text-on-surface-variant">
          This page is available offline thanks to PWA caching.
        </span>
      </div>
    </div>
  );
}

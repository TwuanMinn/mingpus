"use client";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
      <h2 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-jakarta)] mb-2">
        Something went wrong
      </h2>
      <p className="text-on-surface-variant mb-6 max-w-md">
        {error.message || "An unexpected error occurred while loading analytics."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}

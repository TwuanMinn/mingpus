'use client';

export default function DecksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-error">error</span>
      <h2 className="text-xl font-bold text-on-surface font-[family-name:var(--font-jakarta)]">
        Decks failed to load
      </h2>
      <p className="text-sm text-on-surface-variant max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  );
}

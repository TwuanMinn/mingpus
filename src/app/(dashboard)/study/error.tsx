"use client";

import Link from "next/link";

export default function StudyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-error mb-4">school</span>
      <h2 className="text-2xl font-bold text-on-surface font-(family-name:--font-jakarta) mb-2">
        Couldn&apos;t load your study hub
      </h2>
      <p className="text-on-surface-variant mb-6 max-w-md">
        {error.message || "Something went wrong while loading decks and progress."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-bold text-sm hover:bg-primary-fixed transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

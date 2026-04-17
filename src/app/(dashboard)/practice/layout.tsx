import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice",
  description: "Spaced repetition review session for your Chinese flashcards.",
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decks",
  description: "Create, edit, and organize your flashcard decks.",
};

export default function DecksLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Hub",
  description: "Browse decks, track progress, and plan your next study session.",
};

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

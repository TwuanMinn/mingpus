import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import",
  description: "Bulk-import flashcards from CSV, TSV, or Quizlet exports.",
};

export default function ImportLayout({ children }: { children: React.ReactNode }) {
  return children;
}

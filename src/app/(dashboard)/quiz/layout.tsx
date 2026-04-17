import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz",
  description: "Multiple choice knowledge test across your learned characters.",
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}

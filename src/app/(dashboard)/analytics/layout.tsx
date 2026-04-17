import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Your study progress, accuracy trends, and mastery heatmap.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strokes",
  description: "Practice character stroke order with animated guidance.",
};

export default function StrokesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

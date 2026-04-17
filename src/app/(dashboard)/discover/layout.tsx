import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover",
  description: "Explore community decks and popular character sets.",
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}

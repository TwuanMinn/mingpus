import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reverse Practice",
  description: "Meaning to character recall drill.",
};

export default function ReverseLayout({ children }: { children: React.ReactNode }) {
  return children;
}

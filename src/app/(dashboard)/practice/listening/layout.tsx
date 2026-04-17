import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listening Practice",
  description: "Audio-first review: hear the character, recall the meaning.",
};

export default function ListeningLayout({ children }: { children: React.ReactNode }) {
  return children;
}

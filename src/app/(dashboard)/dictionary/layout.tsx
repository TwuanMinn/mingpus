import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dictionary",
  description: "Look up Chinese characters, pinyin, and meanings.",
};

export default function DictionaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

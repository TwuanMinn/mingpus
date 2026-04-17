import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account, preferences, and daily goals.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

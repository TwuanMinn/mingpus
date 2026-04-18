import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your milestones, streak alerts, weekly summaries, and reminders.",
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

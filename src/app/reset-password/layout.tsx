import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your Digital Calligrapher password.",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

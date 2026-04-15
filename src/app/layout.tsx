import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_SC, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSans = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Calligrapher | Dashboard",
  description: "Learn Chinese Characters with Interactive Flashcards, Quizzes, and Stroke Practice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`light ${jakarta.variable} ${inter.variable} ${notoSans.variable}`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen selection:bg-primary-fixed selection:text-primary">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:ml-64 relative min-h-screen flex flex-col">
              <Header />
              {children}
            </main>
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}

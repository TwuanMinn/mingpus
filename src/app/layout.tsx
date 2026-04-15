import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_SC, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import Script from "next/script";

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
  weight: ["400", "700"],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="theme-color" content="#4648d4" />
      </head>
      <body className="min-h-screen selection:bg-primary-fixed selection:text-primary">
        <Providers>
          {children}
        </Providers>
        {/* Non-blocking Material Symbols: loaded after initial paint */}
        <Script id="material-symbols-loader" strategy="afterInteractive">
          {`
            var l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap';
            document.head.appendChild(l);
          `}
        </Script>
      </body>
    </html>
  );
}

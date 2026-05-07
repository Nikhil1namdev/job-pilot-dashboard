import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// ThemeProvider wraps the entire app so every page gets access to theme context
import ThemeProvider from "@/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Pilot — AI-Powered Job Application Tracker",
  description:
    "Track, filter, and pilot your job applications with real-time AI fit scores and intelligent automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // suppressHydrationWarning is REQUIRED when using next-themes.
      // next-themes injects a script that reads localStorage and adds the "dark" class
      // BEFORE React hydrates. Without this attribute, React will complain about
      // the server-rendered HTML not matching the client DOM (hydration mismatch).
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {/*
         * ThemeProvider must wrap the entire <body> so all client components
         * can access the useTheme() hook from any depth in the tree.
         *
         * attribute="class" → tells next-themes to add/remove the "dark" class
         * on the <html> element, which activates Tailwind's dark: variant.
         */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

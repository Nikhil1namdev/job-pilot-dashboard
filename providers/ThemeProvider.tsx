"use client";

/**
 * 🌗 THEME PROVIDER (providers/ThemeProvider.tsx)
 * -----------------------------------------------
 * Yeh file "next-themes" library ko wrap karti hai.
 *
 * next-themes kyun use kiya?
 * --------------------------
 * Problem: Agar hum khud manually dark mode implement karein (localStorage + useEffect),
 * toh ek common bug aata hai jise "Hydration Mismatch" kehte hain.
 *
 * Hydration Mismatch kya hota hai?
 * ---------------------------------
 * Next.js pehle server par HTML generate karta hai (light mode assume karke),
 * fir browser mein React us same HTML ko "hydrate" karta hai.
 * Agar browser ka theme (dark) aur server ka output (light) alag hain, toh React confuse ho jata hai
 * aur console mein warning/flash deta hai — ise "Flash of Unstyled Content" (FOUC) bhi kehte hain.
 *
 * next-themes solution:
 * ---------------------
 * - `suppressHydrationWarning` attribute HTML tag mein lagata hai automatically.
 * - Theme class ko server-side render ke saath sync karta hai safely.
 * - System theme (prefers-color-scheme) ko automatically detect karta hai.
 * - localStorage mein theme persist karta hai across page refreshes.
 *
 * attribute="class" → Tailwind CSS ki "class" based dark mode strategy ke saath perfectly kaam karta hai.
 * Matlab jab dark mode on hota hai, toh <html> tag par "dark" class add ho jati hai.
 * Tailwind ke saare `dark:` prefix classes tabhi activate hoti hain.
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      // "class" strategy → HTML root element par "dark" class add/remove hogi
      // Tailwind dark mode automatically is class ko detect karta hai
      attribute="class"
      // Default theme: system → User ka OS preference automatically pick hoga
      defaultTheme="system"
      // Enable system theme detection (OS dark/light mode)
      enableSystem={true}
      // Browser mein theme persist karo, page reload par bhi yaad rahe
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

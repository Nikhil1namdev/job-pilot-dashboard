"use client";

/**
 * 🌞🌙 THEME TOGGLE BUTTON (components/theme/ThemeToggle.tsx)
 * -----------------------------------------------------------
 * Reusable dark/light mode toggle button.
 *
 * useTheme() → next-themes ka hook jo current theme read karta hai
 * setTheme()  → Theme change karne ke liye (light / dark / system)
 *
 * Hydration note:
 * ---------------
 * `mounted` state kyun use kiya?
 * Server-side render mein hum nahi jaante user ka current theme kya hai.
 * Agar hum mounted check na karein, server "sun" icon render karega aur
 * browser "moon" icon → yeh mismatch hydration warning dega.
 * Solution: Jab tak component browser mein mount na ho jaye, kuch mat dikhao.
 */

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Hydration mismatch se bachne ke liye: pehle client mount hone do, tab icon dikhao
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Jab tak component mount nahi hota, ek placeholder button dikhao (same size, no icon)
  // Isse layout shift nahi aata
  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50" />
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        relative h-9 w-9 rounded-xl flex items-center justify-center
        border border-zinc-200 dark:border-zinc-700
        bg-white dark:bg-zinc-900
        text-zinc-600 dark:text-zinc-300
        hover:bg-zinc-100 dark:hover:bg-zinc-800
        hover:border-zinc-300 dark:hover:border-zinc-600
        shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
        transition-all duration-200
        cursor-pointer
      "
    >
      {/* AnimatePresence → smooth crossfade between Sun & Moon icons */}
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Sun className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Moon className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

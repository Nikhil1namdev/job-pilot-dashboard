"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * 🔔 CUSTOM SONNER TOASTER WRAPPER
 * ---------------------------------
 * This component integrates Sonner with our application's `next-themes`
 * config to automatically toggle between dark and light modes.
 * 
 * Why Sonner?
 * -----------
 * - Modern SaaS look and feel.
 * - Lightweight and high performance.
 * - Smooth Framer Motion-like animations out of the box.
 * - Excellent support for accessibility and interactive action toasts.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
      closeButton
      position="bottom-right"
      expand={true}
      {...props}
    />
  );
};

export { Toaster };

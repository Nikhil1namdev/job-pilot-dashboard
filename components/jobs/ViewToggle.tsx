"use client";
import React from "react";
import { LayoutList, Kanban } from "lucide-react";
import { motion } from "framer-motion";

interface ViewToggleProps {
  currentView: string;
  onChange: (v: string) => void;
}

export default function ViewToggle({ currentView, onChange }: ViewToggleProps) {
  return (
    <div className="flex bg-zinc-100/80 dark:bg-zinc-800 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800 self-start lg:self-auto">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange("list")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          currentView === "list" 
            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]" 
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        <LayoutList className="w-3.5 h-3.5" /> List
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange("board")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          currentView === "board" 
            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]" 
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        <Kanban className="w-3.5 h-3.5" /> Board
      </motion.button>
    </div>
  );
}

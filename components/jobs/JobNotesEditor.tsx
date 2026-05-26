"use client";
import React, { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface JobNotesEditorProps {
  jobId: string;
  initialNotes: string;
}

/**
 * 📝 JOB NOTES EDITOR
 * -------------------
 * Yeh component Board view mein job notes save karne ka logic sambhalta hai.
 * Humne 'debounce' technique use ki hai: Jab user type karna roke (700ms tak),
 * tabhi API call hoti hai, taaki har keystroke par database hit na ho.
 */
export default function JobNotesEditor({ jobId, initialNotes }: JobNotesEditorProps) {
  const [isExpanded, setIsExpanded] = useState(!!initialNotes);
  const [notes, setNotes] = useState(initialNotes || "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    // Debounce Save Logic
    if (notes === initialNotes && status === "idle") return; // Data same hai toh kuch mat karo
    
    const handler = setTimeout(async () => {
      if (notes === initialNotes) return;
      
      setStatus("saving");
      try {
        const res = await fetch(`/api/jobs/${jobId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        });
        
        if (!res.ok) throw new Error("Save failed");
        
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch (err) {
        console.error("Notes save error:", err);
        setStatus("error");
        toast.error("Failed to save notes");
      }
    }, 700); // Wait for 700ms pause

    return () => clearTimeout(handler);
  }, [notes, jobId, initialNotes]);

  return (
    <div className="mt-3">
      {!isExpanded ? (
        <button 
          onClick={() => setIsExpanded(true)}
          className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer w-full justify-center"
        >
          {notes ? "📝 View Notes" : "➕ Add Notes"}
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-1.5">
          <textarea
            autoFocus
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Interview details, recruiter name..."
            className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500/50 resize-none h-20 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none text-zinc-800 dark:text-zinc-200 transition-all"
          />
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold flex items-center gap-1">
              {status === "saving" && <span className="text-amber-500 animate-pulse">Saving...</span>}
              {status === "saved" && <><Check className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-500">Saved</span></>}
              {status === "error" && <><AlertCircle className="w-3 h-3 text-rose-500" /> <span className="text-rose-500">Error</span></>}
            </span>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
            >
              Hide
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

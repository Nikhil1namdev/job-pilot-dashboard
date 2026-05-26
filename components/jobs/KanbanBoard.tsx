"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, ExternalLink, Trash2 } from "lucide-react";
import JobNotesEditor from "./JobNotesEditor";

interface Job {
  _id: string;
  title: string;
  company: string;
  score: number;
  status: string;
  location?: string;
  postedDate?: string;
  applyLink?: string;
  notes?: string;
}

interface KanbanBoardProps {
  jobs: Job[];
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string, title: string) => void;
  onApplyClick: (e: React.MouseEvent<HTMLAnchorElement>, job: Job) => void;
  deletingId: string | null;
}

// Ensure these match existing status values perfectly
const COLUMNS = [
  { id: "Not Applied", label: "Not Applied", color: "bg-zinc-100 dark:bg-zinc-800" },
  { id: "Applied", label: "Applied", color: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "Interviewing", label: "Interviewing", color: "bg-amber-50 dark:bg-amber-900/20" },
  { id: "Offer", label: "Offer", color: "bg-emerald-50 dark:bg-emerald-900/20" },
  { id: "Rejected", label: "Rejected", color: "bg-rose-50 dark:bg-rose-900/20" }
];

/**
 * 📋 KANBAN BOARD VIEW
 * --------------------
 * Yeh component drag-and-drop feature use karta hai jobs ko columns mein move karne ke liye.
 * Jab drag end hota hai (onDrop), toh parent function 'onStatusChange' call hota hai 
 * jo optimistic UI update handle karta hai.
 */
export default function KanbanBoard({ jobs, onStatusChange, onDelete, onApplyClick, deletingId }: KanbanBoardProps) {
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedJobId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    
    // Status update karo agar destination column current status se alag ho
    const job = jobs.find(j => j._id === id);
    if (job && job.status !== targetStatus) {
      onStatusChange(id, targetStatus);
    }
    setDraggedJobId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 px-1 snap-x pt-2">
      {COLUMNS.map(col => {
        // Find jobs that belong to this column
        const columnJobs = jobs.filter(j => (j.status || "Not Applied") === col.id);
        
        return (
          <div 
            key={col.id} 
            className={`flex-shrink-0 w-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col snap-center ${col.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-zinc-200/50 dark:border-zinc-700/50 flex justify-between items-center bg-white/50 dark:bg-black/20 rounded-t-2xl shadow-sm">
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{col.label}</h3>
              <span className="text-[10px] font-black bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                {columnJobs.length}
              </span>
            </div>
            
            {/* Cards Container */}
            <div className="p-3 flex flex-col gap-3 flex-1 min-h-[300px]">
              <AnimatePresence>
                {columnJobs.map(job => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={job._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, job._id)}
                    onDragEnd={() => setDraggedJobId(null)}
                    className={`bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200/80 dark:border-zinc-700/80 cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md transition-all ${draggedJobId === job._id ? 'opacity-40 scale-95' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-tight">{job.title}</h4>
                      <button 
                        onClick={() => onDelete(job._id, job.title)} 
                        disabled={deletingId === job._id}
                        className="text-zinc-400 hover:text-rose-500 transition-colors shrink-0 cursor-pointer p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      >
                        {deletingId === job._id ? <span className="animate-spin text-xs">🌀</span> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3">{job.company}</p>
                    
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-zinc-400" /> {job.location || "Unknown"}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-400" /> {job.postedDate || "Unknown"}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${job.score >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : job.score >= 50 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                        {job.score || 0}% Match
                      </span>
                      
                      {job.applyLink && (
                        <a 
                          href={job.applyLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => onApplyClick(e, job as any)}
                          className="flex items-center gap-1 text-[10px] font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2.5 py-1 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm"
                        >
                          Apply <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>

                    <JobNotesEditor jobId={job._id} initialNotes={job.notes || ""} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  );
}

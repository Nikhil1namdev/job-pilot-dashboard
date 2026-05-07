"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Award, 
  CheckCircle2, 
  Search, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Trash2,
  DollarSign,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "./Pagination";

// TypeScript interface for a Job document
interface Job {
  _id: string;
  title: string;
  company: string;
  score: number;
  status: string;
  location?: string;
  salary?: string;
  postedDate?: string;
  applyLink?: string;
}

// TypeScript interface for component props
interface JobDashboardProps {
  initialJobs: Job[];
  totalJobs: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  stats: {
    total: number;
    topMatches: number;
    applied: number;
    avgScore: number;
  };
}

export default function JobDashboard({ 
  initialJobs = [],
  totalJobs,
  totalPages,
  currentPage,
  limit,
  stats,
}: JobDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. LOCAL STATE MANAGEMENT (React States)
  // ----------------------------------------
  // [jobs, setJobs]: Database se aayi jobs ko local state mein save kiya taaki deletion aur update instantly bina page reload kiye screen par dikh sake.
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  // [searchTerm, setSearchTerm]: Jo hum search box mein type karte hain, use hold karne ke liye state.
  const [searchTerm, setSearchTerm] = useState("");
  // [statusFilter, setStatusFilter]: Kis application status pill ko click kiya (All, Applied, Offer etc.) use save karne ke liye state.
  const [statusFilter, setStatusFilter] = useState("All");
  // [scoreFilter, setScoreFilter]: Kis Match Score range (High, Mid, Low) ko select kiya hai.
  const [scoreFilter, setScoreFilter] = useState("all");
  // [updatingId]: Jab status update ki API call chal rahi ho, toh dropdown ko disable/loading dikhane ke liye.
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  // [deletingId]: Jab delete operation chal raha ho, toh loader show karne ke liye.
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync local jobs state with server-fetched jobs when initialJobs changes
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  // Synchronize component states with URL search parameters on mount or param changes
  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchTerm(search);
    
    const status = searchParams.get("status") || "All";
    setStatusFilter(status);
    
    const score = searchParams.get("score") || "all";
    setScoreFilter(score);
  }, [searchParams]);

  // Debounced Search URL Parameter Updater
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (searchTerm === currentSearch) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to page 1 on new search
      router.push(`/dashboard?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, router]);

  // Handle status filter clicks and update URL
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`/dashboard?${params.toString()}`);
  };

  // Handle score filter clicks and update URL
  const handleScoreFilterChange = (score: string) => {
    setScoreFilter(score);
    const params = new URLSearchParams(searchParams.toString());
    params.set("score", score);
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`/dashboard?${params.toString()}`);
  };

  // 3. OPTIMISTIC STATUS UPDATE FUNCTION (Inline PATCH call)
  // --------------------------------------------------------
  // Optimistic Update ka matlab hai: "API call successful hone ka wait mat karo, user ko instantly UI badla hua dikhao, agar API fail ho jaye toh rollback kar do."
  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    
    // Humne pehle hi current jobs ka backup le liya (Rollback ke liye)
    const originalJobs = [...jobs];
    
    // Instantly browser state ko update karo taaki user ko koi delay (lag) na lage
    setJobs(prevJobs =>
      prevJobs.map(job => (job._id === id ? { ...job, status: newStatus } : job))
    );

    try {
      // background mein chupke se Server API ko call karo status update karne ke liye
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Status update failed:", error);
      // Agar API call fail ho jaye, toh state ko rollback karke purana wala backup set kar do!
      setJobs(originalJobs);
      alert("Status update failed! Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. DELETE FUNCTION (calling DELETE API)
  // ----------------------------------------
  const handleDelete = async (id: string) => {
    // JavaScript alert dialog box confirm karne ke liye
    if (!confirm("Are you sure you want to delete this job?")) return;
    setDeletingId(id);
    try {
      // DELETE request to the backend API
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Agar DB se successfully delete ho gaya, toh local state se filter out kar do (Instant UI update!)
        setJobs(prevJobs => prevJobs.filter(job => job._id !== id));
      } else {
        alert("Delete failed!");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Status badging styles (Slightly enhanced contrasts for a more premium look)
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-50/70 text-blue-700 border-blue-200/80 focus:ring-blue-500/10 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/80";
      case "Interviewing":
        return "bg-amber-50/70 text-amber-700 border-amber-200/80 focus:ring-amber-500/10 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80";
      case "Offer":
        return "bg-emerald-50/70 text-emerald-700 border-emerald-200/80 focus:ring-emerald-500/10 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80";
      case "Rejected":
        return "bg-rose-50/70 text-rose-700 border-rose-200/80 focus:ring-rose-500/10 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80";
      default:
        return "bg-zinc-100/80 text-zinc-700 border-zinc-200/80 focus:ring-zinc-500/10 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/80";
    }
  };

  // Extract job brand and styles from applying url dynamically (LinkedIn, Indeed, YC, etc.)
  const getJobSource = (applyLink?: string) => {
    if (!applyLink) return { name: "Direct", style: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400" };
    const link = applyLink.toLowerCase();
    if (link.includes("linkedin")) return { name: "LinkedIn", style: "bg-blue-500/10 text-blue-600 border border-blue-200/30 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800/40" };
    if (link.includes("indeed")) return { name: "Indeed", style: "bg-indigo-500/10 text-indigo-600 border border-indigo-200/30 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-800/40" };
    if (link.includes("wellfound") || link.includes("angel")) return { name: "Wellfound", style: "bg-zinc-900/10 text-zinc-800 border border-zinc-200 dark:bg-zinc-100/10 dark:text-zinc-200 dark:border-zinc-800/40" };
    if (link.includes("ycombinator") || link.includes("yc")) return { name: "Y Combinator", style: "bg-orange-500/10 text-orange-600 border border-orange-200/30 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-800/40" };
    if (link.includes("glassdoor")) return { name: "Glassdoor", style: "bg-emerald-500/10 text-emerald-600 border border-emerald-200/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800/40" };
    return { name: "Web App", style: "bg-violet-500/10 text-violet-600 border border-violet-200/30 dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-800/40" };
  };

  // Generate a distinct color-coded fallback avatar background depending on the company's first character
  const getCompanyAvatarStyle = (companyName: string) => {
    const firstChar = companyName ? companyName[0].toUpperCase() : "J";
    const colors = [
      "bg-red-50/60 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-200/40 dark:border-red-800/40",
      "bg-orange-50/60 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border-orange-200/40 dark:border-orange-800/40",
      "bg-amber-50/60 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/40 dark:border-amber-800/40",
      "bg-emerald-50/60 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/40 dark:border-emerald-800/40",
      "bg-teal-50/60 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400 border-teal-200/40 dark:border-teal-800/40",
      "bg-blue-50/60 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200/40 dark:border-blue-800/40",
      "bg-indigo-50/60 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-200/40 dark:border-indigo-800/40",
      "bg-violet-50/60 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400 border-violet-200/40 dark:border-violet-800/40",
      "bg-fuchsia-50/60 text-fuchsia-600 dark:bg-fuchsia-950/20 dark:text-fuchsia-400 border-fuchsia-200/40 dark:border-fuchsia-800/40",
      "bg-pink-50/60 text-pink-600 dark:bg-pink-950/20 dark:text-pink-400 border-pink-200/40 dark:border-pink-800/40",
    ];
    const index = firstChar.charCodeAt(0) % colors.length;
    return { char: firstChar, style: colors[index] };
  };

  // Framer Motion spring physics configurations for organic, high-end feel
  const springConfig = { type: "spring" as const, stiffness: 380, damping: 30 };

  // Parent page transition animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  // Child sections fade-and-slide up variants
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
    >
      
      {/* HEADER SECTION (SaaS styling with fine typography hierarchy) */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <span className="text-blue-500"><Sparkles className="h-7 w-7 animate-pulse" /></span> Job Pilot Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium leading-relaxed">
            Analyze, track, and pilot your automatic job applications with premium AI-fitted compatibility insights.
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-bold px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-600 dark:text-zinc-300 self-start md:self-auto shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Active Session • Local DB Connected
        </div>
      </motion.div>

      {/* METRIC CARDS SECTION (Floating spring animations + gradient styles) */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5"
      >
        
        {/* Total Jobs */}
        <motion.div 
          whileHover={{ y: -5, scale: 1.015 }}
          whileTap={{ scale: 0.995 }}
          transition={springConfig}
          className="relative overflow-hidden bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] cursor-default transition-shadow duration-300 group"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Total Jobs</p>
              <h3 className="text-3xl font-black mt-1.5 text-zinc-900 dark:text-white tracking-tight">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
        </motion.div>

        {/* Top Matches (90+) */}
        <motion.div 
          whileHover={{ y: -5, scale: 1.015 }}
          whileTap={{ scale: 0.995 }}
          transition={springConfig}
          className="relative overflow-hidden bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] cursor-default transition-shadow duration-300 group"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Top Matches (90+)</p>
              <h3 className="text-3xl font-black mt-1.5 text-zinc-900 dark:text-white tracking-tight">{stats.topMatches}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </motion.div>

        {/* Applied */}
        <motion.div 
          whileHover={{ y: -5, scale: 1.015 }}
          whileTap={{ scale: 0.995 }}
          transition={springConfig}
          className="relative overflow-hidden bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] cursor-default transition-shadow duration-300 group"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Applied</p>
              <h3 className="text-3xl font-black mt-1.5 text-zinc-900 dark:text-white tracking-tight">{stats.applied}</h3>
            </div>
            <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-xl text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </motion.div>

        {/* Average Match Score */}
        <motion.div 
          whileHover={{ y: -5, scale: 1.015 }}
          whileTap={{ scale: 0.995 }}
          transition={springConfig}
          className="relative overflow-hidden bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] cursor-default transition-shadow duration-300 group"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Avg Fit Score</p>
              <h3 className="text-3xl font-black mt-1.5 text-zinc-900 dark:text-white tracking-tight">{stats.avgScore}%</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* FILTER & CONTROL PANEL (Elevated borders + smooth glow focus inputs) */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-b from-white to-zinc-50/30 dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-5"
      >
        
        {/* Search Bar + Score Filter Buttons */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          
          {/* Search Input with smooth shadow-glow focus */}
          <div className="relative flex-1 group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400 dark:text-zinc-500 transition-colors group-focus-within:text-blue-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Job Title, Company, or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500/50 transition-all shadow-sm"
            />
          </div>

          {/* Score Segmented Control */}
          <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-800 p-1.5 rounded-xl self-start lg:self-auto border border-zinc-200/50 dark:border-zinc-800">
            {[
              { id: "all", label: "All Scores" },
              { id: "high", label: "🔥 High (80+)" },
              { id: "medium", label: "⚡ Mid (50-79)" },
              { id: "low", label: "❄️ Low (<50)" }
            ].map((scoreOpt) => (
              <motion.button
                key={scoreOpt.id}
                onClick={() => handleScoreFilterChange(scoreOpt.id)}
                whileTap={{ scale: 0.98 }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  scoreFilter === scoreOpt.id
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {scoreOpt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200/60 dark:border-zinc-800/80 pt-4">
          <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mr-2">Status:</span>
          {["All", "Not Applied", "Applied", "Interviewing", "Offer", "Rejected"].map((status) => (
            <motion.button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900 shadow-sm"
                  : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* JOBS CONTAINER TABLE (Responsive Dual Layout: Table on Desktop, Cards on Mobile) */}
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        {jobs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="h-12 w-12 bg-zinc-50 dark:bg-zinc-800/80 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No jobs found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto">
              Try adjusting your search query, status filters, or score ranges to see jobs.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW (Visible on md and above) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20">
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Job Details</th>
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Location & Salary</th>
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Fit Score</th>
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Application Status</th>
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Apply Link</th>
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40">
                  <AnimatePresence mode="popLayout">
                    {jobs.map((job) => (
                      <motion.tr 
                        key={job._id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 border-b border-zinc-100/80 dark:border-zinc-850/30 last:border-0 transition-colors duration-150 group"
                      >
                        {/* Job Details */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            {/* Company Initial Avatar Placeholder */}
                            {(() => {
                              const avatar = getCompanyAvatarStyle(job.company);
                              return (
                                <div className={`h-10 w-10 border rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${avatar.style}`}>
                                  {avatar.char}
                                </div>
                              );
                            })()}
                            <div>
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {job.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                  {job.company}
                                </span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider uppercase ${getJobSource(job.applyLink).style}`}>
                                  {getJobSource(job.applyLink).name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location & Salary */}
                        <td className="px-6 py-4.5">
                          <div className="flex flex-col gap-1.5 text-xs">
                            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-semibold">
                              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                              {job.location || "Anywhere"}
                            </span>
                            {job.salary && job.salary !== "Not mentioned" && (
                              <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold">
                                <DollarSign className="h-3 w-3 text-zinc-400" />
                                {job.salary}
                              </span>
                            )}
                            {job.postedDate && (
                              <span className="flex items-center gap-1.5 text-zinc-400 font-semibold">
                                <Calendar className="h-3.5 w-3.5 text-zinc-400/80" />
                                {job.postedDate}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Score Indicator */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${
                              job.score >= 80 
                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
                                : job.score >= 50 
                                ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" 
                                : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                            }`}>
                              {job.score || 0}% Match
                            </span>
                          </div>
                        </td>

                        {/* Application Status Selector */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-2.5">
                            <select
                              value={job.status || "Not Applied"}
                              onChange={(e) => handleStatusChange(job._id, e.target.value)}
                              disabled={updatingId === job._id}
                              className={`text-xs font-extrabold px-3 py-1.5 border rounded-xl shadow-[0_2px_5px_rgba(0,0,0,0.01)] focus:outline-none focus:ring-4 transition-all cursor-pointer ${getStatusStyle(job.status || "Not Applied")}`}
                            >
                              <option value="Not Applied">Not Applied</option>
                              <option value="Applied">Applied</option>
                              <option value="Interviewing">Interviewing</option>
                              <option value="Offer">Offer</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            {updatingId === job._id && (
                              <span className="animate-spin text-xs text-zinc-400">🌀</span>
                            )}
                          </div>
                        </td>

                        {/* Apply Link */}
                        <td className="px-6 py-4.5">
                          {job.applyLink ? (
                            <motion.a 
                              href={job.applyLink} 
                              target="_blank"
                              rel="noreferrer"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white px-3.5 py-1.5 rounded-xl shadow-sm transition-colors"
                            >
                              Apply <ExternalLink className="h-3 w-3" />
                            </motion.a>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold">No Link</span>
                          )}
                        </td>

                        {/* Action Panel */}
                        <td className="px-6 py-4.5 text-right">
                          <Button
                            variant="destructive" 
                            size="icon" 
                            onClick={() => handleDelete(job._id)} 
                            disabled={deletingId === job._id}
                            className="h-8.5 w-8.5 rounded-xl cursor-pointer"
                          >
                            {deletingId === job._id ? (
                              <span className="animate-spin text-xs">🌀</span>
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW (Visible on screens below md - zero horizontal scrolling!) */}
            <div className="md:hidden divide-y divide-zinc-150 dark:divide-zinc-800/60">
              <AnimatePresence mode="popLayout">
                {jobs.map((job) => (
                  <motion.div
                    key={job._id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="p-5 flex flex-col gap-4 hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-colors duration-150"
                  >
                    {/* Top Row: Title, Company & Delete */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        {/* Company Initial Avatar Placeholder */}
                        {(() => {
                          const avatar = getCompanyAvatarStyle(job.company);
                          return (
                            <div className={`h-10 w-10 border rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${avatar.style}`}>
                              {avatar.char}
                            </div>
                          );
                        })()}
                        <div>
                          <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-snug">
                            {job.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                              {job.company}
                            </span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider uppercase ${getJobSource(job.applyLink).style}`}>
                              {getJobSource(job.applyLink).name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive" 
                        size="icon" 
                        onClick={() => handleDelete(job._id)} 
                        disabled={deletingId === job._id}
                        className="h-8 w-8 rounded-xl shrink-0 cursor-pointer"
                      >
                        {deletingId === job._id ? (
                          <span className="animate-spin text-xs">🌀</span>
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>

                    {/* Middle Info Badges */}
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-xs">
                      <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                        {job.location || "Anywhere"}
                      </span>
                      {job.salary && job.salary !== "Not mentioned" && (
                        <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold">
                          <DollarSign className="h-3 w-3 text-zinc-400" />
                          {job.salary}
                        </span>
                      )}
                      {job.postedDate && (
                        <span className="flex items-center gap-1.5 text-zinc-400 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400/80" />
                          {job.postedDate}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${
                        job.score >= 80 
                          ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
                          : job.score >= 50 
                          ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" 
                          : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                      }`}>
                        {job.score || 0}% Match
                      </span>
                    </div>

                    {/* Bottom Action Section */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <select
                          value={job.status || "Not Applied"}
                          onChange={(e) => handleStatusChange(job._id, e.target.value)}
                          disabled={updatingId === job._id}
                          className={`text-xs font-extrabold px-3 py-2 border rounded-xl shadow-[0_2px_5px_rgba(0,0,0,0.01)] focus:outline-none focus:ring-4 transition-all cursor-pointer ${getStatusStyle(job.status || "Not Applied")}`}
                        >
                          <option value="Not Applied">Not Applied</option>
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Offer">Offer</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        {updatingId === job._id && (
                          <span className="animate-spin text-xs text-zinc-400">🌀</span>
                        )}
                      </div>

                      {job.applyLink ? (
                        <motion.a 
                          href={job.applyLink} 
                          target="_blank"
                          rel="noreferrer"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white px-3.5 py-2 rounded-xl shadow-sm transition-colors"
                        >
                          Apply <ExternalLink className="h-3 w-3" />
                        </motion.a>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold">No Link</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalJobs={totalJobs}
              limit={limit}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

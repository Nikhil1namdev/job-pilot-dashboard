"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Sparkles,
  FilterX,
  RefreshCw
} from "lucide-react";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "./Pagination";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { toast } from "sonner";
import { filterJobs, sortJobs } from "@/lib/jobFilters";
import ViewToggle from "./ViewToggle";
import KanbanBoard from "./KanbanBoard";

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
  source?: string;
  notes?: string;
}

interface JobDashboardProps {
  initialJobs: Job[];
}

export default function JobDashboard({ initialJobs = [] }: JobDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  // URL Params
  const currentSearch = searchParams.get("search") || "";
  // 11. Default dashboard view: status = Not Applied, posted = Past week
  const currentStatus = searchParams.get("status") || "Not Applied";
  const currentScore = searchParams.get("score") || "all";
  const currentLocation = searchParams.get("location") || "all";
  const currentPosted = searchParams.get("posted") || "7d";
  const currentRemote = searchParams.get("remote") || "all";
  const currentSource = searchParams.get("source") || "all";
  const currentRelevantOnly = searchParams.get("relevant") || "false";
  const currentHideUnknown = searchParams.get("hideUnknown") || "false";
  const currentView = searchParams.get("view") || "list";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const limit = 8;

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const stats = useMemo(() => {
    const total = jobs.length;
    const topMatches = jobs.filter(j => (j.score || 0) >= 90).length;
    const applied = jobs.filter(j => j.status === "Applied").length;
    const sum = jobs.reduce((acc, j) => acc + (j.score || 0), 0);
    const avgScore = total > 0 ? Math.round(sum / total) : 0;
    return { total, topMatches, applied, avgScore };
  }, [jobs]);

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    let pageReset = false;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      if (key !== "page") pageReset = true;
    });

    if (pageReset) {
      params.set("page", "1");
    }

    router.push(`/dashboard?${params.toString()}`);
  }, [searchParams, router]);

  useEffect(() => {
    if (searchTerm === currentSearch) return;
    const timer = setTimeout(() => {
      updateParams({ search: searchTerm || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, currentSearch, updateParams]);

  const processedJobs = useMemo(() => {
    const filtered = filterJobs(jobs, {
      search: currentSearch,
      status: currentStatus,
      score: currentScore,
      location: currentLocation,
      posted: currentPosted,
      remote: currentRemote,
      source: currentSource,
      relevantOnly: currentRelevantOnly,
      hideUnknown: currentHideUnknown
    });
    return sortJobs(filtered);
  }, [jobs, currentSearch, currentStatus, currentScore, currentLocation, currentPosted, currentRemote, currentSource, currentRelevantOnly, currentHideUnknown]);

  const totalJobsFiltered = processedJobs.length;
  const totalPages = Math.ceil(totalJobsFiltered / limit) || 1;
  const paginatedJobs = processedJobs.slice((currentPage - 1) * limit, currentPage * limit);

  const resetFilters = () => {
    setSearchTerm("");
    updateParams({
      search: null,
      status: "all",
      score: "all",
      location: "all",
      posted: "any",
      remote: "all",
      source: "all",
      relevant: "false",
      hideUnknown: "false",
      view: "list",
      page: "1"
    });
    toast("Filters reset to default.");
  };

  const applyQuickFilter = (type: string, value: string) => {
    updateParams({ [type]: value });
  };

  const handleStatusChange = async (id: string, newStatus: string, showToast = true) => {
    setUpdatingId(id);
    const originalJobs = [...jobs];
    
    setJobs(prevJobs =>
      prevJobs.map(job => (job._id === id ? { ...job, status: newStatus } : job))
    );

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      if (showToast) {
        const toastDescription = `Status set to ${newStatus}.`;
        if (newStatus === "Offer") {
          toast.success("Congratulations! Offer Secured! 🎉", { description: toastDescription });
        } else if (newStatus === "Interviewing") {
          toast.info("Ready for action! Interview Scheduled 🎯", { description: toastDescription });
        } else if (newStatus === "Rejected") {
          toast.warning("Marked as Rejected 💔", { description: "Don't give up! Keep applying." });
        } else {
          toast.success("Status updated successfully", { description: `Job moved to ${newStatus}.` });
        }
      }

    } catch (error) {
      console.error("Status update failed:", error);
      setJobs(originalJobs);
      toast.error("Failed to update status", {
        description: `Could not update status. Reverted back automatically.`,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApplyClick = (e: React.MouseEvent<HTMLAnchorElement>, job: Job) => {
    if (job.status !== "Applied") {
      handleStatusChange(job._id, "Applied", false);
      toast.success("Opened apply link and marked as Applied.");
    }
  };

  const handleDelete = async (id: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"?`)) return;
    
    setDeletingId(id);
    const toastId = toast.loading(`Removing "${jobTitle}"...`);

    try {
      const response = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("API request failed");
      
      setJobs(prevJobs => prevJobs.filter(job => job._id !== id));

      toast.dismiss(toastId);
      toast(`Successfully deleted "${jobTitle}"`, { icon: "🗑️" });

    } catch (error) {
      console.error("Delete execution failed:", error);
      toast.dismiss(toastId);
      toast.error(`Could not delete "${jobTitle}"`);
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * 🔄 Manual Refresh Handler
   * -------------------------
   * Fetches latest jobs stored in MongoDB via GET /api/jobs without reloading the browser.
   * Updates state and refreshes the Last Refreshed timestamp display.
   * 
   * Note: This only fetches existing DB records and does NOT trigger the n8n automation workflow.
   * Future Scope: An "Admin Sync Jobs" button could be added to trigger the n8n workflow via webhook to fetch fresh jobs from SerpAPI on demand.
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/jobs");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        setLastRefreshed(formattedTime);
        toast.success("Jobs refreshed successfully.");
      } else {
        throw new Error(data.error || "Failed to fetch jobs");
      }
    } catch (error: any) {
      console.error("Manual refresh failed:", error);
      toast.error("Failed to refresh jobs", {
        description: "Could not fetch latest jobs from database.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Applied": return "bg-blue-50/70 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/80";
      case "Interviewing": return "bg-amber-50/70 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80";
      case "Offer": return "bg-emerald-50/70 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80";
      case "Rejected": return "bg-rose-50/70 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80";
      default: return "bg-zinc-100/80 text-zinc-700 border-zinc-200/80 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/80";
    }
  };

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

  const springConfig = { type: "spring" as const, stiffness: 380, damping: 30 };
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <span className="text-blue-500"><Sparkles className="h-7 w-7 animate-pulse" /></span> Job Pilot Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium leading-relaxed">
            Analyze, track, and pilot your automatic job applications with premium AI-fitted compatibility insights.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          {lastRefreshed && (
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80">
              Refreshed: {lastRefreshed}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs font-extrabold gap-1.5 rounded-xl px-3.5 py-1.5 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-blue-500 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active Session • Local DB Connected
          </div>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* METRIC CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Total Jobs", value: stats.total, color: "blue", icon: <Briefcase className="h-5 w-5" /> },
          { label: "Top Matches (90+)", value: stats.topMatches, color: "emerald", icon: <Award className="h-5 w-5" /> },
          { label: "Applied", value: stats.applied, color: "violet", icon: <CheckCircle2 className="h-5 w-5" /> },
          { label: "Avg Fit Score", value: `${stats.avgScore}%`, color: "amber", icon: <TrendingUp className="h-5 w-5" /> },
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -5, scale: 1.015 }} whileTap={{ scale: 0.995 }} transition={springConfig} className="relative overflow-hidden bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] cursor-default transition-shadow duration-300 group">
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-${stat.color}-500`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black mt-1.5 text-zinc-900 dark:text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-950/40 rounded-xl text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* FILTER & CONTROL PANEL */}
      <motion.div variants={itemVariants} className="bg-gradient-to-b from-white to-zinc-50/30 dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-5">
        
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <ViewToggle currentView={currentView} onChange={(v) => updateParams({ view: v })} />
          
          <div className="relative flex-1 group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400 dark:text-zinc-500 transition-colors group-focus-within:text-blue-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Job Title, Company, or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-zinc-100/80 dark:bg-zinc-800 p-1.5 rounded-xl self-start lg:self-auto border border-zinc-200/50 dark:border-zinc-800">
            {[
              { id: "all", label: "All Scores" },
              { id: "high", label: "🔥 High (80+)" },
              { id: "medium", label: "⚡ Mid (50-79)" },
              { id: "low", label: "❄️ Low (<50)" }
            ].map((scoreOpt) => (
              <motion.button
                key={scoreOpt.id}
                onClick={() => updateParams({ score: scoreOpt.id })}
                whileTap={{ scale: 0.98 }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentScore === scoreOpt.id
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {scoreOpt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Dropdowns for Location, Posted, Remote */}
        <div className="flex flex-wrap gap-4 items-center border-t border-zinc-200/60 dark:border-zinc-800/80 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Location:</span>
            <select
              value={currentLocation}
              onChange={(e) => updateParams({ location: e.target.value })}
              className="text-xs font-semibold px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="indore">Indore</option>
              <option value="pune">Pune</option>
              <option value="mumbai">Mumbai</option>
              <option value="bengaluru">Bengaluru</option>
              <option value="hyderabad">Hyderabad</option>
              <option value="remote">Remote / Anywhere</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Date:</span>
            <select
              value={currentPosted}
              onChange={(e) => updateParams({ posted: e.target.value })}
              className="text-xs font-semibold px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="any">Any time</option>
              <option value="24h">Past 24 hours</option>
              <option value="2d">Past 2 days</option>
              <option value="7d">Past week</option>
              <option value="unknown">Unknown date</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Type:</span>
            <select
              value={currentRemote}
              onChange={(e) => updateParams({ remote: e.target.value })}
              className="text-xs font-semibold px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="remote">Remote only</option>
              <option value="non-remote">Non-remote only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-xs font-bold gap-1.5 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-blue-500 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh Jobs"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs font-bold gap-1.5 rounded-xl">
              <FilterX className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200/60 dark:border-zinc-800/80 pt-4">
          <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mr-2">Status:</span>
          {["All", "Not Applied", "Applied", "Interviewing", "Offer", "Rejected"].map((status) => (
            <motion.button
              key={status}
              onClick={() => updateParams({ status })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                currentStatus === status
                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900 shadow-sm"
                  : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200/60 dark:border-zinc-800/80 pt-4">
          <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mr-2">Quick:</span>
          
          <button
            onClick={() => updateParams({ status: "Not Applied", posted: "2d", score: "mid_high", location: "remote_indore", relevant: "true", hideUnknown: "true" })}
            className="px-3 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-1"
          >
            <CheckCircle2 className="h-3 w-3" /> Ready To Apply
          </button>
          
          <button
            onClick={() => updateParams({ relevant: currentRelevantOnly === "true" ? "false" : "true" })}
            className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${currentRelevantOnly === "true" ? "bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/20" : "bg-zinc-50/50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}
          >
            {currentRelevantOnly === "true" ? "🎯 Relevant Only: ON" : "Relevant Only"}
          </button>

          <button
            onClick={() => updateParams({ hideUnknown: currentHideUnknown === "true" ? "false" : "true" })}
            className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${currentHideUnknown === "true" ? "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20" : "bg-zinc-50/50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}
          >
            {currentHideUnknown === "true" ? "🙈 Unknowns: HIDDEN" : "Hide Unknown"}
          </button>

          {[
            { label: "Indore", type: "location", val: "indore" },
            { label: "Remote", type: "remote", val: "remote" },
            { label: "Past 24h", type: "posted", val: "24h" },
            { label: "High Score", type: "score", val: "high" },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => applyQuickFilter(chip.type, chip.val)}
              className="px-3 py-1 rounded-md text-[10px] font-bold bg-blue-50/50 text-blue-600 border border-blue-200/50 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

      </motion.div>

      {/* JOBS CONTAINER */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* Results Count Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            Showing <span className="text-zinc-900 dark:text-white font-black">{totalJobsFiltered}</span> of {jobs.length} jobs
          </p>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Filters:</span>
            {(() => {
              const active = [];
              if (currentStatus && currentStatus !== "all" && currentStatus !== "All") active.push(currentStatus);
              if (currentPosted && currentPosted !== "any") active.push(currentPosted);
              if (currentLocation && currentLocation !== "all") active.push(currentLocation === "remote_indore" ? "Remote/Indore" : currentLocation);
              if (currentScore && currentScore !== "all") active.push(`Score: ${currentScore}`);
              if (currentRemote && currentRemote !== "all") active.push(currentRemote === "remote" ? "Remote" : "Non-remote");
              if (currentRelevantOnly === "true") active.push("Relevant Only");
              if (currentHideUnknown === "true") active.push("No Unknowns");
              if (currentSearch) active.push(`"${currentSearch}"`);
              
              if (active.length === 0) return <span className="text-xs text-zinc-500 font-medium">None</span>;
              
              return active.map((f, i) => (
                <React.Fragment key={i}>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md capitalize">{f}</span>
                  {i < active.length - 1 && <span className="text-zinc-300 dark:text-zinc-700">•</span>}
                </React.Fragment>
              ));
            })()}
          </div>
        </div>

        {paginatedJobs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="h-12 w-12 bg-zinc-50 dark:bg-zinc-800/80 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No jobs found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto">
              Try adjusting your search query, status filters, or score ranges to see jobs.
            </p>
          </div>
        ) : currentView === "board" ? (
          <KanbanBoard 
            jobs={processedJobs} 
            onStatusChange={handleStatusChange} 
            onDelete={handleDelete} 
            onApplyClick={handleApplyClick} 
            deletingId={deletingId} 
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20">
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Job Details</th>
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Location & Posted</th>
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Fit Score</th>
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Application Status</th>
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Apply Link</th>
                    <th className="px-6 py-4.5 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40">
                  <AnimatePresence mode="popLayout">
                    {paginatedJobs.map((job) => (
                      <motion.tr key={job._id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25, ease: "easeOut" }} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 border-b border-zinc-100/80 dark:border-zinc-850/30 last:border-0 transition-colors duration-150 group">
                        
                        {/* Job Details */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
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

                        {/* Location & Posted */}
                        <td className="px-6 py-4.5">
                          <div className="flex flex-col gap-1.5 text-xs">
                            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-semibold">
                              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                              {job.location || "Unknown location"}
                            </span>
                            <span className="flex items-center gap-1.5 text-zinc-400 font-semibold">
                              <Calendar className="h-3.5 w-3.5 text-zinc-400/80" />
                              {job.postedDate || "Unknown date"}
                            </span>
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
                            {updatingId === job._id && <span className="animate-spin text-xs text-zinc-400">🌀</span>}
                          </div>
                        </td>

                        {/* Apply Link */}
                        <td className="px-6 py-4.5">
                          {job.applyLink ? (
                            <motion.a 
                              href={job.applyLink} 
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => handleApplyClick(e, job)}
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
                            onClick={() => handleDelete(job._id, job.title)} 
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

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden divide-y divide-zinc-150 dark:divide-zinc-800/60">
              <AnimatePresence mode="popLayout">
                {paginatedJobs.map((job) => (
                  <motion.div key={job._id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25, ease: "easeOut" }} className="p-5 flex flex-col gap-4 hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-colors duration-150">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const avatar = getCompanyAvatarStyle(job.company);
                          return (
                            <div className={`h-10 w-10 border rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${avatar.style}`}>
                              {avatar.char}
                            </div>
                          );
                        })()}
                        <div>
                          <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-snug">{job.title}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">{job.company}</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider uppercase ${getJobSource(job.applyLink).style}`}>
                              {getJobSource(job.applyLink).name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(job._id, job.title)} disabled={deletingId === job._id} className="h-8 w-8 rounded-xl shrink-0 cursor-pointer">
                        {deletingId === job._id ? <span className="animate-spin text-xs">🌀</span> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-xs">
                      <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                        {job.location || "Unknown location"}
                      </span>
                      <span className="flex items-center gap-1.5 text-zinc-400 font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400/80" />
                        {job.postedDate || "Unknown date"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${job.score >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : job.score >= 50 ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"}`}>
                        {job.score || 0}% Match
                      </span>
                    </div>

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
                        {updatingId === job._id && <span className="animate-spin text-xs text-zinc-400">🌀</span>}
                      </div>

                      {job.applyLink ? (
                        <motion.a 
                          href={job.applyLink} 
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => handleApplyClick(e, job)}
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

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalJobs={totalJobsFiltered}
              limit={limit}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
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
  TrendingUp
} from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

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

interface JobDashboardProps {
  initialJobs: Job[];
}

export default function JobDashboard({ initialJobs = [] }: JobDashboardProps) {
  const router = useRouter();
  
  // 1. Local state for jobs to support instant "optimistic" updates
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 2. Calculations using useMemo (optimized performance)
  const stats = useMemo(() => {
    const total = jobs.length;
    const topMatches = jobs.filter((job) => (job.score || 0) >= 90).length;
    const applied = jobs.filter((job) => job.status === "Applied").length;
    
    // Average Match Score
    const totalScore = jobs.reduce((acc, job) => acc + (job.score || 0), 0);
    const avgScore = total > 0 ? Math.round(totalScore / total) : 0;

    return { total, topMatches, applied, avgScore };
  }, [jobs]);

  // 3. Status update function (real-time inline PATCH call)
  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    
    // Optimistic Update: Change state locally first for zero-latency feel
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
    } catch (error) {
      console.error("Status update failed:", error);
      // Rollback to original state if API call fails
      setJobs(originalJobs);
      alert("Status update failed! Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. Delete function (calling DELETE API)
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
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

  // 5. Filtering logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search matching
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location || "").toLowerCase().includes(searchTerm.toLowerCase());

      // Status matching
      const matchesStatus = statusFilter === "All" || job.status === statusFilter;

      // Score matching
      let matchesScore = true;
      if (scoreFilter === "high") matchesScore = (job.score || 0) >= 80;
      else if (scoreFilter === "medium") matchesScore = (job.score || 0) >= 50 && (job.score || 0) < 80;
      else if (scoreFilter === "low") matchesScore = (job.score || 0) < 50;

      return matchesSearch && matchesStatus && matchesScore;
    });
  }, [jobs, searchTerm, statusFilter, scoreFilter]);

  // Status badging styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      case "Interviewing":
        return "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      case "Offer":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200 focus:ring-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <span>🚀</span> Job Pilot Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Analyze, track, and pilot your applications to land your dream job.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-300 self-start md:self-auto shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Active Session • Local DB Connected
        </div>
      </div>

      {/* METRIC CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        
        {/* Total Jobs */}
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Jobs</p>
              <h3 className="text-3xl font-black mt-1 text-zinc-900 dark:text-white">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Top Matches (90+) */}
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Top Matches (90+)</p>
              <h3 className="text-3xl font-black mt-1 text-zinc-900 dark:text-white">{stats.topMatches}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Applied */}
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Applied</p>
              <h3 className="text-3xl font-black mt-1 text-zinc-900 dark:text-white">{stats.applied}</h3>
            </div>
            <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-xl text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Average Match Score */}
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Avg Fit Score</p>
              <h3 className="text-3xl font-black mt-1 text-zinc-900 dark:text-white">{stats.avgScore}%</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & CONTROL PANEL */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm mb-6 flex flex-col gap-4">
        
        {/* Search Bar + Score Filter Buttons */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Job Title, Company, or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Score Segmented Control */}
          <div className="flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-800/60 p-1 rounded-xl self-start lg:self-auto border border-zinc-200/40 dark:border-zinc-700/20">
            {[
              { id: "all", label: "All Scores" },
              { id: "high", label: "🔥 High (80+)" },
              { id: "medium", label: "⚡ Mid (50-79)" },
              { id: "low", label: "❄️ Low (<50)" }
            ].map((scoreOpt) => (
              <button
                key={scoreOpt.id}
                onClick={() => setScoreFilter(scoreOpt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  scoreFilter === scoreOpt.id
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {scoreOpt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2">Status:</span>
          {["All", "Not Applied", "Applied", "Interviewing", "Offer", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                statusFilter === status
                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900 shadow-sm"
                  : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* JOBS CONTAINER TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="h-12 w-12 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No jobs found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, status filters, or score ranges to see jobs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Job Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Location & Salary</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Fit Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Application Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Apply Link</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredJobs.map((job) => (
                  <tr 
                    key={job._id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-all duration-150 group"
                  >
                    
                    {/* Job Details */}
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {job.company}
                        </p>
                      </div>
                    </td>

                    {/* Location & Salary */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          {job.location || "Anywhere"}
                        </span>
                        {job.salary && job.salary !== "Not mentioned" && (
                          <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
                            <DollarSign className="h-3 w-3 text-zinc-400" />
                            {job.salary}
                          </span>
                        )}
                        {job.postedDate && (
                          <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            {job.postedDate}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Score Indicator */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider shadow-sm ${
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={job.status || "Not Applied"}
                          onChange={(e) => handleStatusChange(job._id, e.target.value)}
                          disabled={updatingId === job._id}
                          className={`text-xs font-bold px-3 py-1.5 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all cursor-pointer ${getStatusStyle(job.status || "Not Applied")}`}
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
                    <td className="px-6 py-4">
                      {job.applyLink ? (
                        <a 
                          href={job.applyLink} 
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white px-3 py-1.5 rounded-xl shadow-sm transition-all"
                        >
                          Apply <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-zinc-400 text-xs font-medium">No Link</span>
                      )}
                    </td>

                    {/* Action Panel */}
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="destructive" 
                        size="icon" 
                        onClick={() => handleDelete(job._id)} 
                        disabled={deletingId === job._id}
                        className="h-8 w-8 rounded-xl"
                      >
                        {deletingId === job._id ? (
                          <span className="animate-spin text-xs">🌀</span>
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      
      {/* HEADER SECTION SKELETON */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
        <div className="space-y-2.5">
          {/* Main Title Placeholder */}
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          {/* Subtitle Placeholder */}
          <div className="h-4 w-96 max-w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg" />
        </div>
        {/* Active Session badge placeholder */}
        <div className="h-8 w-44 bg-zinc-200/40 dark:bg-zinc-800/40 rounded-full" />
      </div>

      {/* METRIC CARDS SKELETON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="p-6 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950/80 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-3 flex-1">
              {/* Category tag */}
              <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
              {/* Stat number */}
              <div className="h-8 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            </div>
            {/* Soft icon placeholder */}
            <div className="h-10 w-10 bg-zinc-200/60 dark:bg-zinc-800/40 rounded-xl" />
          </div>
        ))}
      </div>

      {/* FILTER & CONTROL PANEL SKELETON */}
      <div className="bg-gradient-to-b from-white to-zinc-50/30 dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col gap-5">
        
        {/* Search bar + Segmented controls */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search box placeholder */}
          <div className="h-11 flex-1 bg-zinc-200/70 dark:bg-zinc-800/60 rounded-xl" />
          {/* Scores buttons placeholder */}
          <div className="h-11 w-80 max-w-full bg-zinc-200/40 dark:bg-zinc-800/40 rounded-xl" />
        </div>

        {/* Status filters list */}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200/60 dark:border-zinc-800/80 pt-4">
          {/* Status Label placeholder */}
          <div className="h-4 w-12 bg-zinc-200/80 dark:bg-zinc-800/80 rounded mr-2" />
          {/* Pill placeholders */}
          {[60, 84, 70, 92, 64, 76].map((width, i) => (
            <div 
              key={i} 
              style={{ width: `${width}px` }}
              className="h-7 bg-zinc-200/60 dark:bg-zinc-800/50 rounded-full" 
            />
          ))}
        </div>
      </div>

      {/* JOBS CONTAINER TABLE / CARD SKELETON */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden">
        
        {/* DESKTOP TABLE VIEW SKELETON (md and above) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20">
                <th className="px-6 py-4.5"><div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" /></th>
                <th className="px-6 py-4.5"><div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" /></th>
                <th className="px-6 py-4.5"><div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" /></th>
                <th className="px-6 py-4.5"><div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" /></th>
                <th className="px-6 py-4.5"><div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" /></th>
                <th className="px-6 py-4.5 text-right"><div className="h-3 w-10 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40">
              {[...Array(5)].map((_, idx) => (
                <tr key={idx} className="border-b border-zinc-100/80 dark:border-zinc-850/30">
                  {/* Title & Company */}
                  <td className="px-6 py-5 space-y-2">
                    <div className="h-4 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-3.5 w-24 bg-zinc-150 dark:bg-zinc-850 rounded" />
                  </td>
                  {/* Location & Salary */}
                  <td className="px-6 py-5 space-y-2">
                    <div className="h-3.5 w-32 bg-zinc-150 dark:bg-zinc-850 rounded" />
                    <div className="h-3.5 w-20 bg-zinc-150 dark:bg-zinc-850 rounded" />
                  </td>
                  {/* Match Score */}
                  <td className="px-6 py-5">
                    <div className="h-6 w-20 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-lg" />
                  </td>
                  {/* Dropdown status */}
                  <td className="px-6 py-5">
                    <div className="h-8 w-28 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl" />
                  </td>
                  {/* Link action */}
                  <td className="px-6 py-5">
                    <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  </td>
                  {/* Delete action */}
                  <td className="px-6 py-5 text-right">
                    <div className="h-8.5 w-8.5 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS VIEW SKELETON (below md) */}
        <div className="md:hidden divide-y divide-zinc-150 dark:divide-zinc-800/60">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                  <div className="h-3.5 w-1/3 bg-zinc-150 dark:bg-zinc-850 rounded" />
                </div>
                <div className="h-8 w-8 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl shrink-0" />
              </div>
              <div className="flex flex-wrap gap-2.5">
                <div className="h-4 w-20 bg-zinc-150 dark:bg-zinc-850 rounded" />
                <div className="h-4 w-16 bg-zinc-150 dark:bg-zinc-850 rounded" />
                <div className="h-5 w-16 bg-zinc-200/80 dark:bg-zinc-800/80 rounded" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="h-8 w-28 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl" />
                <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

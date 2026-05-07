"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

// TypeScript interface for Pagination component props
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalJobs: number;
  limit: number;
}

/**
 * 📦 REUSABLE PAGINATION COMPONENT (SaaS Premium Styling)
 * -----------------------------------------------------
 * Yeh component server-side pagination ko control karta hai.
 * Buttons click hone par yeh Next.js useRouter() ke jariye URL ke query parameters (?page=X) ko update karta hai,
 * jisse server automatically naya paginated aur filtered data database se fetch karke bejta hai.
 */
export default function Pagination({
  currentPage,
  totalPages,
  totalJobs,
  limit,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Agar total 1 page hi hai, toh pagination controls dikhane ki need nahi hai
  if (totalPages <= 1) return null;

  // URL search params ko modify karke naye page par navigate karne ka function
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    // Purane URL search parameters ko copy karke naya page set karo taaki active search/filters lost na hon!
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    // Naye URL path par client side router se push karo
    router.push(`/dashboard?${params.toString()}`);
  };

  // Safe range nikalna page numbers generate karne ke liye (maximum 5 visible page numbers at a time)
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    // End boundary check
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  // Dynamic status texts
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalJobs);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200/60 dark:border-zinc-800/80 px-6 py-4 bg-zinc-50/30 dark:bg-zinc-950/20 rounded-b-2xl">
      
      {/* Page Items Description (e.g., "Showing 1-8 of 24 jobs") */}
      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
        Showing <span className="text-zinc-800 dark:text-white font-extrabold">{startItem}</span> to{" "}
        <span className="text-zinc-800 dark:text-white font-extrabold">{endItem}</span> of{" "}
        <span className="text-zinc-800 dark:text-white font-extrabold">{totalJobs}</span> jobs
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        
        {/* Previous Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold border shadow-[0_2px_5px_rgba(0,0,0,0.01)] transition-all ${
            currentPage === 1
              ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </motion.button>

        {/* Individual Page Numbers */}
        <div className="flex items-center gap-1 hidden sm:flex">
          {visiblePages.map((pageNum) => (
            <motion.button
              key={pageNum}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(pageNum)}
              className={`h-8 w-8 rounded-lg text-xs font-extrabold border flex items-center justify-center transition-all cursor-pointer ${
                currentPage === pageNum
                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900 shadow-sm"
                  : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {pageNum}
            </motion.button>
          ))}
        </div>

        {/* Mobile Page Indicator (Visible below sm breakpoint) */}
        <div className="sm:hidden text-xs font-extrabold px-3 py-1.5 text-zinc-600 dark:text-zinc-400">
          Page {currentPage} of {totalPages}
        </div>

        {/* Next Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold border shadow-[0_2px_5px_rgba(0,0,0,0.01)] transition-all ${
            currentPage === totalPages
              ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
          }`}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </motion.button>

      </div>
    </div>
  );
}

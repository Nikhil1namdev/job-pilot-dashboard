"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, Sparkles, ArrowRight, Compass, Shield, Zap } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

/**
 * 🌟 PREMIUM SAAS LANDING PAGE (Root Route placeholder)
 * ----------------------------------------------------
 * Beautifully designed glassmorphic landing page with smooth gradients,
 * modern typography, and responsive grid elements to wow the user at first glance.
 * Clicking 'Enter Dashboard' seamlessly transitions the user to /dashboard.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col justify-between relative overflow-hidden selection:bg-blue-500/30 selection:text-blue-900 dark:selection:text-white">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
            Job Pilot
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 hidden sm:inline-block">v2.1.0 (Stable)</span>
          <Link
            href="/dashboard"
            className="text-xs font-extrabold px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
          >
            Sign In
          </Link>
          {/* Dark / light mode toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center flex-1 flex flex-col justify-center items-center z-10">
        
        {/* Sparkle badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-extrabold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-8 shadow-[0_0_15px_rgba(59,130,246,0.1)] animate-pulse">
          <Sparkles className="h-3.5 w-3.5" /> Next-Gen Job Application Pilot
        </div>

        {/* Hero title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] max-w-3xl mb-6 text-zinc-900 dark:text-transparent dark:bg-gradient-to-b dark:from-white dark:via-zinc-100 dark:to-zinc-500 dark:bg-clip-text">
          Organize Your Professional Career Search.
        </h1>

        {/* Hero description */}
        <p className="text-base sm:text-lg font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed mb-10">
          Simplify your job hunting experience. Track applications, view matching fit scores, filter dynamically by platform, and stay on top of interview status updates in one elegant dashboard.
        </p>

        {/* Interactive action button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/dashboard"
            className="group relative flex items-center gap-2 text-sm font-extrabold bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white px-7 py-4 rounded-xl shadow-lg shadow-zinc-900/10 dark:shadow-white/5 hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer"
          >
            Enter Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 duration-300" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-extrabold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-6 py-4 rounded-xl transition-colors cursor-pointer"
          >
            View Documentation
          </a>
        </div>

        {/* Feature grid placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mt-20 w-full text-left">
          {[
            {
              icon: <Compass className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
              title: "Smart Filtering",
              desc: "Sort by score matches, platforms, and application status instantly on the server.",
            },
            {
              icon: <Zap className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />,
              title: "Optimistic Status Shifts",
              desc: "Experience lag-free application pipeline edits that sync dynamically in the background.",
            },
            {
              icon: <Shield className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />,
              title: "Responsive Skeletons",
              desc: "Gorgeous dark-mode adaptive skeletons and card views for mobile and desktop screens.",
            },
          ].map((feat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/20 backdrop-blur-md hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors"
            >
              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-fit mb-4 border border-zinc-200 dark:border-zinc-800">
                {feat.icon}
              </div>
              <h3 className="text-sm font-extrabold mb-1.5 text-zinc-800 dark:text-zinc-200">{feat.title}</h3>
              <p className="text-xs font-semibold text-zinc-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

      </main>

      {/* Footer bar */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-900 text-xs font-bold text-zinc-400 dark:text-zinc-600 z-10">
        <span>&copy; 2026 Job Pilot Inc. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Terms of Use</a>
        </div>
      </footer>

    </div>
  );
}
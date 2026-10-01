"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Activity, CheckCircle2, ArrowRight } from "lucide-react";

interface DashboardHeroProps {
  userName: string;
  roleTitle?: string;
  description: string;
  heroImage: string;
  healthBadge?: string;
  healthTitle?: string;
  healthSubtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function DashboardHero({
  userName,
  roleTitle,
  description,
  heroImage,
  healthBadge = "All Systems Normal",
  healthTitle = "Platform Health",
  healthSubtitle = "95.8% uptime • Last 24 hours",
  actionLabel = "User Control Matrix →",
  actionHref = "/dashboard/admin/users",
}: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1427]/85 backdrop-blur-2xl shadow-xl p-6 sm:p-8 transition-all">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-purple-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        {/* Left Column: Welcome text, gradient title, badges */}
        <div className="max-w-xl space-y-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">
              Welcome back,
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mt-1">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-cyan-300 dark:to-purple-400 bg-clip-text text-transparent">
                {userName}
              </span>
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Glowing Status Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm shadow-emerald-500/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Secure</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold shadow-sm shadow-blue-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Realtime Data</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-xs font-bold shadow-sm shadow-cyan-500/10">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>System Online</span>
            </div>
          </div>
        </div>

        {/* Center: 3D Holographic Artwork */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative min-h-[180px] max-w-sm">
          <div className="relative w-full h-48 rounded-2xl overflow-hidden group">
            <Image
              src={heroImage}
              alt="Operational HUD Hologram"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              priority
            />
            {/* Soft gradient blend edges */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent dark:from-[#0c1427]/90 dark:via-transparent dark:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-transparent to-white/90 dark:from-[#0c1427]/90 dark:via-transparent dark:to-[#0c1427]/90" />
          </div>
        </div>

        {/* Right Column: Platform Health Card */}
        <div className="w-full xl:w-72 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#080e1d]/90 p-5 shadow-lg backdrop-blur-xl shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              <Activity className="h-3 w-3 animate-pulse" />
              <span>{healthBadge}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground">{healthTitle}</h3>
            <p className="text-[11px] text-muted-foreground">{healthSubtitle}</p>
          </div>

          {/* Smooth Area Wave Chart SVG */}
          <div className="w-full h-12">
            <svg
              viewBox="0 0 160 50"
              className="w-full h-full overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 38 C 20 40, 35 30, 50 34 C 70 38, 85 20, 105 24 C 125 28, 140 10, 160 14 L 160 50 L 0 50 Z"
                fill="url(#waveGradient)"
              />
              <path
                d="M0 38 C 20 40, 35 30, 50 34 C 70 38, 85 20, 105 24 C 125 28, 140 10, 160 14"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              />
            </svg>
          </div>

          {/* CTA Action Button */}
          {actionHref && actionLabel && (
            <Button
              asChild
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              <Link href={actionHref} className="flex items-center justify-center gap-1.5">
                <span>{actionLabel}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "blue" | "cyan" | "emerald" | "amber" | "purple";
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend = { value: "+0%", positive: true },
  variant = "blue",
  className,
}: StatCardProps) {
  // Theme color styles
  const variantStyles = {
    blue: {
      iconBg: "bg-blue-600/15 text-blue-500 dark:text-blue-400 border-blue-500/20 shadow-blue-500/10",
      stroke: "#3b82f6",
      glow: "from-blue-500/5 to-transparent",
    },
    cyan: {
      iconBg: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 shadow-cyan-500/10",
      stroke: "#06b6d4",
      glow: "from-cyan-500/5 to-transparent",
    },
    emerald: {
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/10",
      stroke: "#10b981",
      glow: "from-emerald-500/5 to-transparent",
    },
    amber: {
      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-amber-500/10",
      stroke: "#f59e0b",
      glow: "from-amber-500/5 to-transparent",
    },
    purple: {
      iconBg: "bg-purple-600/15 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-purple-500/10",
      stroke: "#a855f7",
      glow: "from-purple-500/5 to-transparent",
    },
  }[variant];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 dark:bg-[#0c1427]/80 backdrop-blur-xl shadow-sm hover:shadow-lg dark:hover:border-primary/40 transition-all duration-300",
        className
      )}
    >
      {/* Top subtle ambient glow */}
      <div className={cn("absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl group-hover:opacity-40 transition-opacity", variantStyles.glow)} />

      <CardContent className="p-5 flex flex-col justify-between h-full">
        {/* Top row: Icon and Title / More */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm group-hover:scale-105 transition-transform",
                variantStyles.iconBg
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground tracking-tight">
                {title}
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono mt-0.5">
                {value}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Options"
            className="text-muted-foreground/60 hover:text-muted-foreground p-1 rounded-lg transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Description subtext */}
        {description && (
          <p className="text-[11px] text-muted-foreground mt-2 truncate">
            {description}
          </p>
        )}

        {/* Bottom row: Trend badge & mini sparkline wave */}
        <div className="mt-4 pt-2 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-bold text-[11px]",
                trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
            <span className="text-[11px] text-muted-foreground">vs. last 7 days</span>
          </div>

          {/* Glowing mini sparkline SVG */}
          <div className="w-16 h-6 flex items-center justify-end">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 60 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 15 C 10 18, 18 12, 28 14 C 38 16, 45 4, 59 7"
                stroke={variantStyles.stroke}
                strokeWidth="2"
                strokeLinecap="round"
                className="drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]"
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

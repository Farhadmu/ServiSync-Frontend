"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettlementCardProps {
  badgeTitle: string;
  badgeTag?: string;
  tagIcon?: React.ElementType;
  title: string;
  description: string;
  rate: number;
  rateLabel: string;
  primaryCount: number;
  primaryLabel: string;
  secondaryCount: number;
  secondaryLabel: string;
  legendPrimary: string;
  legendSecondary: string;
  secondaryColor?: "amber" | "muted";
  showChartIcon?: boolean;
}

export function SettlementCard({
  badgeTitle,
  badgeTag = "Real-Time",
  tagIcon: TagIcon,
  title,
  description,
  rate,
  rateLabel,
  primaryCount,
  primaryLabel,
  secondaryCount,
  secondaryLabel,
  legendPrimary,
  legendSecondary,
  secondaryColor = "amber",
  showChartIcon = false,
}: SettlementCardProps) {
  const total = primaryCount + secondaryCount;
  const primaryWidth = total > 0 ? (primaryCount / total) * 100 : 0;
  const secondaryWidth = total > 0 ? (secondaryCount / total) * 100 : 0;

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c1427]/85 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
            {badgeTitle}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border bg-muted/40 text-[10px] font-mono font-bold text-foreground">
            {TagIcon ? (
              <TagIcon className="h-3 w-3 text-primary" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span>{badgeTag}</span>
          </div>
        </div>
        <CardTitle className="text-base sm:text-lg font-extrabold text-foreground mt-1">
          {title}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground line-clamp-1">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Metric Rate Gauge row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Circular Ring Gauge */}
            <div className="relative flex items-center justify-center h-12 w-12 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-inner">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary transition-all duration-700 ease-out"
                  strokeDasharray={`${rate}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono font-black text-xs text-foreground">
                {rate}%
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground block">
                {rateLabel}
              </span>
              <span className="text-[11px] text-muted-foreground/75">
                Calculated live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {primaryCount} {primaryLabel}
              </span>{" "}
              /{" "}
              <span
                className={cn(
                  "font-bold",
                  secondaryColor === "amber"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                )}
              >
                {secondaryCount} {secondaryLabel}
              </span>
            </div>

            {showChartIcon && (
              <div className="p-2 rounded-xl bg-primary/10 text-primary hidden sm:block">
                <BarChart2 className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Dual Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-emerald-500 transition-all duration-700 rounded-l-full shadow-sm"
            style={{ width: `${primaryWidth}%` }}
            title={`${primaryCount} ${primaryLabel}`}
          />
          <div
            className={cn(
              "h-full transition-all duration-700",
              secondaryColor === "amber" ? "bg-amber-500" : "bg-slate-400 dark:bg-slate-600"
            )}
            style={{ width: `${secondaryWidth}%` }}
            title={`${secondaryCount} ${secondaryLabel}`}
          />
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-0.5">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            {legendPrimary}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className={cn(
                "h-2 w-2 rounded-full shadow-sm",
                secondaryColor === "amber"
                  ? "bg-amber-500 shadow-amber-500/50"
                  : "bg-slate-400 dark:bg-slate-500"
              )}
            />
            {legendSecondary}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

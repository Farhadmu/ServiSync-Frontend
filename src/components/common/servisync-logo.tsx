"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ServiSyncLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  href?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  priority?: boolean;
}

export function ServiSyncLogo({
  size = "md",
  withText = true,
  href,
  className,
  iconClassName,
  textClassName,
}: ServiSyncLogoProps) {
  const sizeMap = {
    xs: {
      box: "h-6 w-6",
      svg: 24,
      text: "text-sm",
      sub: "text-[9px]",
    },
    sm: {
      box: "h-8 w-8",
      svg: 32,
      text: "text-base",
      sub: "text-[10px]",
    },
    md: {
      box: "h-9 w-9",
      svg: 36,
      text: "text-lg",
      sub: "text-[11px]",
    },
    lg: {
      box: "h-11 w-11",
      svg: 44,
      text: "text-2xl",
      sub: "text-xs",
    },
    xl: {
      box: "h-14 w-14",
      svg: 56,
      text: "text-3xl",
      sub: "text-sm",
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 select-none group transition-transform duration-200 active:scale-[0.98]",
        className
      )}
    >
      {/* Brandmark Glyph */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-[1.5px] shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/35 transition-all duration-300",
          currentSize.box,
          iconClassName
        )}
      >
        {/* Inner container with subtle glass surface */}
        <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden relative">
          {/* Subtle ambient diagonal beam */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-violet-400/25 pointer-events-none" />

          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full p-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          >
            <defs>
              <linearGradient id="serviBrandGrad1" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
              <linearGradient id="serviBrandGrad2" x1="36" y1="4" x2="4" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>

            {/* Sync Ring Arc 1 - Left to Top */}
            <path
              d="M12 24 C10 20 11 14 16 10 C21 6 28 7 32 11"
              stroke="url(#serviBrandGrad1)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Arrow Tip 1 */}
            <path
              d="M29 7 L33 11 L29 15"
              stroke="url(#serviBrandGrad1)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Sync Ring Arc 2 - Right to Bottom */}
            <path
              d="M28 16 C30 20 29 26 24 30 C19 34 12 33 8 29"
              stroke="url(#serviBrandGrad2)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Arrow Tip 2 */}
            <path
              d="M11 33 L7 29 L11 25"
              stroke="url(#serviBrandGrad2)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Central Precision Tool/Wrench Spark Diamond */}
            <circle cx="20" cy="20" r="3" fill="#FFFFFF" />
            <path
              d="M20 13 L21 18 L26 20 L21 22 L20 27 L19 22 L14 20 L19 18 Z"
              fill="url(#serviBrandGrad1)"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>

      {/* Wordmark */}
      {withText && (
        <div className="flex flex-col text-left leading-none">
          <div
            className={cn(
              "font-black tracking-tight flex items-center gap-0.5",
              currentSize.text,
              textClassName
            )}
          >
            <span className="text-foreground transition-colors group-hover:text-primary">Servi</span>
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent font-extrabold">
              Sync
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}

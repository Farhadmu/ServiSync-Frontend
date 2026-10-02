"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Wrench,
  Tag,
  CheckCircle2,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ServiceCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SearchedService {
  id: string;
  name: string;
  description?: string | null;
  basePrice?: number | string | null;
  durationMinutes?: number | null;
  category?: {
    id: string;
    name: string;
    icon?: string | null;
  };
}

export function SmartServiceFinder({
  categories = [],
}: {
  categories?: ServiceCategory[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query backend search API
  const {
    data: searchResults = [],
    isLoading,
    isError,
  } = useQuery<SearchedService[]>({
    queryKey: ["service-search", debouncedQuery, selectedCategory],
    queryFn: async () => {
      const res = await api.get<SearchedService[]>("/service-categories/services/search", {
        params: {
          q: debouncedQuery || undefined,
          categoryId: selectedCategory !== "ALL" ? selectedCategory : undefined,
          limit: 12,
        },
      });
      return res.data || [];
    },
    enabled: Boolean(debouncedQuery.length > 0 || selectedCategory !== "ALL"),
    staleTime: 1000 * 30,
  });

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const activeCategories = categories.filter((c) => c.isActive !== false);

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto relative z-30">
      {/* Search Input Box with Action Bar */}
      <div className="relative rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 p-2 shadow-xl shadow-primary/5 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <div className="flex items-center gap-2 px-3">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="smart-search-results"
            placeholder="Search by trade or problem (e.g. AC cooling leak, water pipe burst, circuit breaker)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-transparent py-2.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setDebouncedQuery("");
              }}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-sm"
          >
            <Link href="#instant-booking">
              <span>Book Service</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Quick Category Suggestion Pills */}
        <div className="flex items-center gap-1.5 pt-2 px-2 overflow-x-auto no-scrollbar border-t border-border/40 mt-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Popular:
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("ALL");
              setIsOpen(true);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Services
          </button>
          {activeCategories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setIsOpen(true);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Dropdown Results */}
      {isOpen && (debouncedQuery.length > 0 || selectedCategory !== "ALL") && (
        <Card
          id="smart-search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-150 z-50"
        >
          <CardContent className="p-3 space-y-2">
            {isLoading ? (
              <div className="space-y-2.5 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Searching verified service catalog...</span>
                </div>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Unable to load suggestions. Please try another keyword.
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <Wrench className="h-8 w-8 text-muted-foreground mx-auto stroke-1" />
                <p className="text-sm font-semibold text-foreground">
                  No exact services found for &ldquo;{searchTerm}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Our certified technicians also handle custom repairs. You can request a custom
                  booking or diagnostic inspection.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-2 text-xs">
                  <Link href="/dashboard/requests/new">
                    Request Custom Service
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Matching Services ({searchResults.length})</span>
                  <span>Direct Booking Available</span>
                </div>

                {searchResults.map((service) => (
                  <div
                    key={service.id}
                    className="p-3 rounded-xl border border-border/50 hover:border-primary/40 bg-card hover:bg-muted/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {service.name}
                        </span>
                        {service.category?.name && (
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                            {service.category.name}
                          </Badge>
                        )}
                      </div>

                      {service.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {service.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                        {service.basePrice && (
                          <span className="font-semibold text-foreground">
                            Starting from: {formatCurrency(Number(service.basePrice))}
                          </span>
                        )}
                        {service.durationMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            ~{service.durationMinutes} mins
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button asChild size="sm" className="h-8 text-xs font-semibold shadow-xs">
                        <Link
                          href={`/dashboard/requests/new?serviceTypeId=${service.id}&category=${encodeURIComponent(
                            service.category?.name || "General"
                          )}`}
                        >
                          Book Now
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

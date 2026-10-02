"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  UserCheck,
  Star,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Calendar,
  Briefcase,
  ArrowRight,
  Sparkles,
  Users,
  Award,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface PublicTechnician {
  id: string;
  userId: string;
  name: string;
  image?: string | null;
  bio: string;
  experienceYears: number;
  isAvailable: boolean;
  skills: string[];
  completedJobs: number;
  averageRating: number;
  totalReviews: number;
}

interface PublicProfileDetail {
  id: string;
  name: string;
  image?: string | null;
  bio: string;
  experienceYears: number;
  skills: { id: string; name: string; proficiency?: string }[];
  stats: {
    completedJobs: number;
    totalReviews: number;
    averageRating: number;
  };
  reviews: {
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    customerName: string;
  }[];
}

export function FeaturedTechniciansSection() {
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>("ALL");
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // 1. Fetch public technicians
  const { data: technicians = [], isLoading, error } = useQuery<PublicTechnician[]>({
    queryKey: ["public-technicians", selectedSkillFilter],
    queryFn: async () => {
      const res = await api.get<PublicTechnician[]>("/technicians/public", {
        params: {
          skill: selectedSkillFilter !== "ALL" ? selectedSkillFilter : undefined,
          limit: 12,
        },
      });
      return res.data || [];
    },
    staleTime: 1000 * 60,
  });

  // 2. Fetch full profile detail for modal
  const { data: profileDetail, isLoading: loadingProfile } = useQuery<PublicProfileDetail | null>({
    queryKey: ["technician-public-profile", activeProfileId],
    queryFn: async () => {
      if (!activeProfileId) return null;
      const res = await api.get<PublicProfileDetail>(`/technicians/${activeProfileId}/public-profile`);
      return res.data;
    },
    enabled: Boolean(activeProfileId),
  });

  // Extract all unique skills across technicians for filter tabs
  const availableSkills = useMemo(() => {
    const set = new Set<string>();
    technicians.forEach((t) => t.skills.forEach((s) => set.add(s)));
    return Array.from(set).slice(0, 6);
  }, [technicians]);

  return (
    <section
      id="technicians"
      aria-label="Meet Our Certified Technicians"
      className="py-16 md:py-24 bg-card border-b border-border/60 relative"
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-xl">
            <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 bg-primary/5 text-primary border-primary/20">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              Verified Service Fleet
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Meet Our Certified Field Specialists
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Every ServiSync technician is identity-checked, skill-endorsed, and equipped with standardized digital execution checklists.
            </p>
          </div>

          {/* Skill Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedSkillFilter("ALL")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedSkillFilter === "ALL"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Trades
            </button>
            {availableSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => setSelectedSkillFilter(skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSkillFilter === skill
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Technician Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : technicians.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border/80 bg-muted/20">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <h4 className="font-bold text-sm text-foreground">No specialists found in this category</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Select &ldquo;All Trades&rdquo; to view the complete available technician roster.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicians.map((tech) => (
              <Card
                key={tech.id}
                className="border border-border/80 hover:border-primary/40 bg-card transition-all hover:shadow-lg rounded-2xl overflow-hidden flex flex-col justify-between group"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Top Row: Avatar & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {tech.image ? (
                          <img
                            src={tech.image}
                            alt={tech.name}
                            className="h-14 w-14 rounded-2xl object-cover border border-border"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-lg">
                            {tech.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background ${
                            tech.isAvailable ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          title={tech.isAvailable ? "On-Duty / Available" : "Assigned On-Site"}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {tech.name}
                          </h4>
                          <span title="Verified Technician">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {tech.experienceYears}+ years field experience
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-bold shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span>{tech.averageRating}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {tech.bio}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tech.skills.slice(0, 3).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-[10px] bg-muted hover:bg-muted/80 font-medium"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {tech.skills.length > 3 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{tech.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-muted/40">
                      <p className="font-bold text-foreground">{tech.completedJobs}</p>
                      <p className="text-[10px] text-muted-foreground">Jobs Completed</p>
                    </div>
                    <div className="p-2 rounded-xl bg-muted/40">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">100%</p>
                      <p className="text-[10px] text-muted-foreground">Background Checked</p>
                    </div>
                  </div>
                </CardContent>

                <div className="p-4 pt-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveProfileId(tech.id)}
                    className="w-full text-xs font-semibold hover:border-primary/40"
                  >
                    View Verified Profile & Reviews
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Public Profile & Verified Reviews */}
        <Dialog open={Boolean(activeProfileId)} onOpenChange={() => setActiveProfileId(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            {loadingProfile ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : profileDetail ? (
              <div className="space-y-5">
                <DialogHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base">
                      {profileDetail.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <DialogTitle className="text-base font-bold flex items-center gap-1.5">
                        {profileDetail.name}
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Certified Field Service Specialist • {profileDetail.experienceYears} Years Experience
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                {/* Profile Overview */}
                <div className="space-y-3 text-xs">
                  <div>
                    <h5 className="font-semibold text-foreground mb-1 uppercase tracking-wider text-[10px] text-muted-foreground">
                      Professional Background
                    </h5>
                    <p className="text-muted-foreground leading-relaxed">{profileDetail.bio}</p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-foreground mb-1.5 uppercase tracking-wider text-[10px] text-muted-foreground">
                      Verified Technical Skills
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {profileDetail.skills.map((s) => (
                        <Badge key={s.id} variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-primary" />
                          {s.name} ({s.proficiency || "Expert"})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Rating Metrics */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-foreground">
                        {profileDetail.stats.completedJobs}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Verified Field Completions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-amber-500 flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500" />
                        {profileDetail.stats.averageRating}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {profileDetail.stats.totalReviews} Customer Ratings
                      </p>
                    </div>
                  </div>

                  {/* Customer Reviews Section */}
                  <div>
                    <h5 className="font-semibold text-foreground mb-2 uppercase tracking-wider text-[10px] text-muted-foreground">
                      Recent Verified Customer Reviews
                    </h5>
                    {profileDetail.reviews.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-xl">
                        No written reviews submitted yet for this specialist.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {profileDetail.reviews.map((r) => (
                          <div key={r.id} className="p-2.5 rounded-xl border border-border/50 bg-card text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground">{r.customerName}</span>
                              <div className="flex items-center text-amber-500 text-[10px]">
                                {[...Array(r.rating)].map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-amber-500" />
                                ))}
                              </div>
                            </div>
                            {r.comment && <p className="text-muted-foreground text-[11px]">&ldquo;{r.comment}&rdquo;</p>}
                            <span className="text-[10px] text-muted-foreground block">{formatDate(r.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex justify-end">
                  <Button asChild size="sm" className="font-bold shadow-xs">
                    <Link href="#instant-booking" onClick={() => setActiveProfileId(null)}>
                      Book Guaranteed Service
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

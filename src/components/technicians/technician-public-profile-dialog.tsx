"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { PublicTechnicianProfile } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  CheckCircle2,
  Briefcase,
  Award,
  Loader2,
  Calendar,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

interface TechnicianPublicProfileDialogProps {
  technicianId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TechnicianPublicProfileDialog({
  technicianId,
  isOpen,
  onClose,
}: TechnicianPublicProfileDialogProps) {
  const { data: profile, isLoading, error } = useQuery<PublicTechnicianProfile>({
    queryKey: ["technician-public-profile", technicianId],
    queryFn: async () => {
      if (!technicianId) throw new Error("No technician ID provided");
      const res = await api.get<PublicTechnicianProfile>(
        `/technicians/${technicianId}/public-profile`
      );
      return res.data;
    },
    enabled: isOpen && !!technicianId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Verified Technician Profile
          </DialogTitle>
          <DialogDescription>
            Official credentials and customer ratings for this service specialist
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading verified technician credentials...</p>
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-sm text-destructive bg-destructive/10 rounded-lg">
            Could not retrieve technician information.
          </div>
        )}

        {!isLoading && profile && (
          <div className="space-y-6 pt-2">
            {/* Header / Bio Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <Avatar className="h-20 w-20 ring-4 ring-primary/20 shadow-md">
                <AvatarImage src={profile.image || undefined} alt={profile.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-bold text-foreground">{profile.name}</h3>
                  <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Pro
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {profile.bio || "Certified Field Service Technician"}
                </p>
                {profile.experienceYears !== undefined && profile.experienceYears > 0 && (
                  <p className="text-xs font-medium text-primary flex items-center justify-center sm:justify-start gap-1 pt-0.5">
                    <Award className="h-3.5 w-3.5" />
                    {profile.experienceYears} {profile.experienceYears === 1 ? "year" : "years"} professional experience
                  </p>
                )}
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-muted/40 border-border/80">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg">
                    <Star className="h-4 w-4 fill-amber-500" />
                    <span>{profile.stats.averageRating > 0 ? profile.stats.averageRating.toFixed(1) : "N/A"}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Avg Rating ({profile.stats.totalReviews})
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/40 border-border/80">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-primary font-bold text-lg">
                    <Briefcase className="h-4 w-4" />
                    <span>{profile.stats.completedJobs}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Completed Jobs</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/40 border-border/80">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>100%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Vetted Quality</p>
                </CardContent>
              </Card>
            </div>

            {/* Specialties & Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Specialties & Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <Badge key={skill.id} variant="outline" className="px-2.5 py-1 text-xs bg-card">
                      {skill.name}
                      {skill.proficiency && (
                        <span className="ml-1 text-[10px] text-muted-foreground font-normal">
                          ({skill.proficiency})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Reviews Section */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Recent Customer Feedback
                </h4>
                <span className="text-xs text-muted-foreground">
                  {profile.reviews.length} {profile.reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              {profile.reviews.length === 0 ? (
                <div className="text-center py-6 px-4 bg-muted/20 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                  No customer reviews yet. This technician is ready for your feedback!
                </div>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {profile.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 rounded-lg border border-border/70 bg-card text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={rev.customerImage || undefined} />
                            <AvatarFallback className="text-[9px]">
                              {rev.customerName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-foreground">{rev.customerName}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rev.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rev.comment && <p className="text-muted-foreground italic">&ldquo;{rev.comment}&rdquo;</p>}
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 pt-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

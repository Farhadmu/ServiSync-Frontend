"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Sliders, CheckCircle2, DollarSign, Wrench, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { TechnicianProfile } from "@/types";
import { toast } from "sonner";

export default function TechnicianAvailabilityPage() {
  const queryClient = useQueryClient();

  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [hourlyRate, setHourlyRate] = useState<number>(50);
  const [isAvailable, setIsAvailable] = useState(true);

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ["technician-profile-me"],
    queryFn: async () => {
      const res = await api.get<TechnicianProfile>("/technicians/me/profile");
      return res.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setExperienceYears(profile.experienceYears || 3);
      setHourlyRate(Number(profile.hourlyRate) || 50);
      setIsAvailable(profile.isAvailable ?? true);
    }
  }, [profile]);

  // Profile Mutation
  const profileMutation = useMutation({
    mutationFn: async () => {
      return api.patch("/technicians/me/profile", {
        bio,
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technician-profile-me"] });
      toast.success("Profile details updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update profile");
    },
  });

  // Availability Mutation
  const availabilityMutation = useMutation({
    mutationFn: async (avail: boolean) => {
      return api.patch("/technicians/me/availability", { isAvailable: avail });
    },
    onSuccess: (_, avail) => {
      setIsAvailable(avail);
      queryClient.invalidateQueries({ queryKey: ["technician-profile-me"] });
      toast.success(avail ? "You are now AVAILABLE" : "You are marked UNAVAILABLE");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update availability");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Field Availability & Technician Profile"
        description="Set your live dispatch status, labor rates, experience, and verified certifications."
      />

      {/* Live Availability Toggle Card */}
      <Card className="border border-border/80">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  isAvailable ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                }`}
              />
              <h3 className="font-bold text-base text-foreground">
                Current Status: {isAvailable ? "Available for Dispatch" : "Off Duty / Unavailable"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              When Available, dispatchers can schedule and route new customer tickets to your queue.
            </p>
          </div>

          <Button
            size="sm"
            variant={isAvailable ? "outline" : "default"}
            onClick={() => availabilityMutation.mutate(!isAvailable)}
            isLoading={availabilityMutation.isPending}
            className="w-full sm:w-auto shrink-0"
          >
            {isAvailable ? "Go Off Duty" : "Mark Available"}
          </Button>
        </CardContent>
      </Card>

      {/* Profile Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Technician Credentials & Rates</CardTitle>
          <CardDescription className="text-xs">
            These parameters are visible to operations managers during dispatch matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rate">Standard Hourly Labor Rate (৳)</Label>
              <Input
                id="rate"
                type="number"
                min="10"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp">Years of Field Experience</Label>
              <Input
                id="exp"
                type="number"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Professional Bio & Specializations</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="e.g. Certified HVAC specialist with 5 years experience in commercial ductwork and AC units..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Verified Skills Display */}
          <div className="pt-2 border-t border-border space-y-2">
            <Label>Verified Skills & Certifications</Label>
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.skills.map((s) => (
                  <Badge key={s.id} variant="default" className="text-xs py-1 px-2.5">
                    <Shield className="h-3 w-3 mr-1 text-primary-foreground" />
                    {s.skill?.name || "Skill"} • {s.proficiency || "EXPERT"}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No specialized skills tagged yet.</p>
            )}
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              onClick={() => profileMutation.mutate()}
              isLoading={profileMutation.isPending}
              size="sm"
              className="w-full sm:w-auto font-semibold"
            >
              Save Profile Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Wrench,
  Users,
  Check,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ServiceCategory, AppointmentSlot } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function InstantBookingChecker({
  categories = [],
}: {
  categories?: ServiceCategory[];
}) {
  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive !== false),
    [categories]
  );

  const defaultCategory = activeCategories[0];
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    defaultCategory?.id || ""
  );

  const selectedCategory = useMemo(
    () =>
      activeCategories.find((c) => c.id === selectedCategoryId) ||
      defaultCategory,
    [activeCategories, selectedCategoryId, defaultCategory]
  );

  const activeServiceTypes = useMemo(
    () => selectedCategory?.serviceTypes || [],
    [selectedCategory]
  );
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>("");

  // Auto-select first service type when category changes
  const currentServiceType = useMemo(() => {
    return (
      activeServiceTypes.find((st) => st.id === selectedServiceTypeId) ||
      activeServiceTypes[0]
    );
  }, [activeServiceTypes, selectedServiceTypeId]);

  // Today's date as minimum
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);

  // Fetch real available slots for date and service type
  const {
    data: slotsData,
    isLoading: loadingSlots,
    error: slotsError,
    refetch: refetchSlots,
  } = useQuery<{
    date: string;
    totalAvailableTechnicians: number;
    slots: AppointmentSlot[];
  }>({
    queryKey: [
      "available-slots",
      selectedDate,
      currentServiceType?.id,
    ],
    queryFn: async () => {
      const res = await api.get<{
        date: string;
        totalAvailableTechnicians: number;
        slots: AppointmentSlot[];
      }>("/service-requests/available-slots", {
        params: {
          date: selectedDate,
          serviceTypeId: currentServiceType?.id || undefined,
        },
      });
      return res.data;
    },
    enabled: Boolean(selectedDate),
    staleTime: 1000 * 30,
  });

  const slots = slotsData?.slots || [];
  const totalTechs = slotsData?.totalAvailableTechnicians || 0;

  const basePrice = currentServiceType?.basePrice ? Number(currentServiceType.basePrice) : 850;
  const duration = currentServiceType?.durationMinutes || 90;

  return (
    <section
      id="instant-booking"
      aria-label="Instant Booking and Availability Checker"
      className="py-16 md:py-24 border-b border-border/60 relative overflow-hidden isolate"
    >
      {/* ── Background Visual Layer: Clean contemporary home-service workspace ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/images/bg-booking.jpg"
          alt="Clean modern home-service inspection workspace"
          className="w-full h-full object-cover object-center opacity-85 dark:opacity-90 dark:brightness-110 dark:contrast-105 filter saturate-105"
        />
        {/* Soft elegant gradient mask that lets the real photography shine through */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/20 to-background/70 dark:from-[#0b0f19]/60 dark:via-[#0b0f19]/15 dark:to-[#0b0f19]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40 dark:from-[#0b0f19]/30 dark:via-transparent dark:to-[#0b0f19]/30" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 bg-primary/5 text-primary border-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Live Capacity Engine
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Instant Service Availability & Scheduling
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Check real-time technician coverage, select your preferred arrival window, and reserve guaranteed service without waiting for callbacks.
          </p>
        </div>

        {/* 2-Column Booking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Selector Column */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-border/80 shadow-md bg-card/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    Configure Your Service Appointment
                  </span>
                  {totalTechs > 0 && (
                    <Badge variant="success" className="text-[10px] gap-1">
                      <Users className="h-3 w-3" />
                      {totalTechs} {totalTechs === 1 ? "Technician" : "Technicians"} Available
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  All appointments follow strict conflict-free dispatching and certified quality standards.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-5">
                {/* 1. Category Picker */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    1. Select Trade Specialization
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {activeCategories.slice(0, 8).map((cat) => {
                      const isSelected = (selectedCategoryId || defaultCategory?.id) === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            setSelectedServiceTypeId("");
                            setSelectedSlot(null);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-start gap-1 text-xs ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/30"
                              : "border-border/70 hover:border-primary/40 bg-card hover:bg-muted/40 text-foreground"
                          }`}
                        >
                          <span className="truncate w-full">{cat.name}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {cat.serviceTypes?.length || 1} services
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Service Type Picker */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    2. Specific Service Package
                  </Label>
                  {activeServiceTypes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeServiceTypes.map((st) => {
                        const isSelected = (currentServiceType?.id) === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setSelectedServiceTypeId(st.id);
                              setSelectedSlot(null);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all text-xs ${
                              isSelected
                                ? "border-primary bg-primary/10 font-bold ring-1 ring-primary/30"
                                : "border-border/70 hover:border-primary/30 bg-card hover:bg-muted/30"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-foreground truncate">{st.name}</span>
                              {st.basePrice && (
                                <span className="font-bold text-primary text-[11px]">
                                  {formatCurrency(Number(st.basePrice))}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground block line-clamp-1">
                              {st.description || "Standard inspection & repair"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                      Standard comprehensive service package selected.
                    </div>
                  )}
                </div>

                {/* 3. Service Date Picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      3. Preferred Appointment Date
                    </Label>
                    <span className="text-[11px] text-muted-foreground">Same-day bookings available</span>
                  </div>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                    }}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* 4. Live Available Time Slots */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      4. Real-time Arrival Window
                    </Label>
                    <button
                      type="button"
                      onClick={() => refetchSlots()}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" /> Refresh Slots
                    </button>
                  </div>

                  {loadingSlots ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                      ))}
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="p-4 bg-muted/50 rounded-xl text-center text-xs text-muted-foreground">
                      No open slots on this date. Please select a following day.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {slots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-2 ring-primary/30 font-bold"
                                : slot.available
                                ? "border-border/80 hover:border-primary/50 bg-card hover:bg-muted/40 cursor-pointer"
                                : "border-border/40 bg-muted/30 opacity-55 cursor-not-allowed"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-semibold mb-1">
                              <span className="flex items-center gap-1.5">
                                <Clock className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                {slot.label}
                              </span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                            </div>

                            <div className="flex items-center justify-between text-[11px]">
                              <span
                                className={`text-[10px] font-medium ${
                                  slot.available
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {slot.available ? "Confirmed Open" : slot.reason || "Slot Full"}
                              </span>
                              {slot.available && slot.capacityRemaining !== undefined && (
                                <span className="text-[10px] text-muted-foreground">
                                  {slot.capacityRemaining} slots left
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl rounded-2xl overflow-hidden sticky top-24">
              <CardHeader className="pb-3 border-b border-border/50 bg-primary/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Appointment Summary
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] bg-card text-primary font-bold">
                    30-Day Warranty
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Review selected details before proceeding to your service request
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                {/* Service Details Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Trade Category:</span>
                    <span className="font-semibold text-foreground">{selectedCategory?.name || "General Maintenance"}</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Service Name:</span>
                    <span className="font-bold text-foreground text-right">{currentServiceType?.name || "Standard Diagnostic"}</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Estimated Work Time:</span>
                    <span className="font-medium text-foreground">~{duration} minutes</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Appointment Date:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Arrival Window:</span>
                    <span className={`font-semibold ${selectedSlot ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      {selectedSlot ? selectedSlot.label : "Pending selection"}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Published Base Rate:</p>
                      <p className="text-[10px] text-muted-foreground">No upfront charge. Pay via Stripe after job completion.</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-foreground">{formatCurrency(basePrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Platform Guarantees */}
                <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60 space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Free cancellation up to 2 hours prior</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>30-Day Labor & Service Warranty included</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Certified background-checked technician dispatch</span>
                  </div>
                </div>

                {/* Final Action Button */}
                <Button
                  asChild
                  size="lg"
                  className="w-full font-bold shadow-md shadow-primary/20 text-sm h-11"
                  disabled={!selectedSlot}
                >
                  <Link
                    href={`/dashboard/requests/new?serviceTypeId=${currentServiceType?.id || ""}&category=${encodeURIComponent(
                      selectedCategory?.name || "General"
                    )}&date=${selectedDate}${selectedSlot ? `&slot=${encodeURIComponent(selectedSlot.label)}` : ""}`}
                  >
                    <span>{selectedSlot ? "Proceed to Finalize Booking" : "Select an Arrival Window to Continue"}</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

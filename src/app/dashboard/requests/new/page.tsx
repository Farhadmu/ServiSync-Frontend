"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceRequestSchema, ServiceRequestFormData } from "@/lib/validations";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ServiceCategory, ServiceType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wrench,
  Zap,
  Droplets,
  ShieldCheck,
  MapPin,
  Tag,
} from "lucide-react";

const QUICK_ISSUES = [
  "AC cooling fan making loud vibration",
  "Water pipe leakage under bathroom sink",
  "Main circuit breaker tripping frequently",
  "Kitchen appliance short circuit / sparking",
  "Water heater thermostat failure",
  "Power outlet loose connection",
];

const QUICK_ADDRESSES = [
  "123 Main St, Apt 4B, Dhanmondi, Dhaka",
  "Plot 15, Road 27, Gulshan-2, Dhaka",
  "House 42, Sector 7, Uttara, Dhaka",
];

export default function NewServiceRequestPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      categoryId: "",
      serviceTypeId: "",
      title: "",
      description: "",
      location: "",
      preferredDateTime: "",
    },
  });

  // Fetch active categories
  const { data: categories, isLoading: loadingCategories, error: catError } = useQuery({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const res = await api.get<ServiceCategory[]>("/service-categories");
      return res.data || [];
    },
  });

  // Fetch full category with service types when category changes
  const { data: categoryDetails, isLoading: loadingTypes } = useQuery({
    queryKey: ["service-category", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return null;
      const res = await api.get<ServiceCategory>(`/service-categories/${selectedCategoryId}`);
      return res.data;
    },
    enabled: !!selectedCategoryId,
  });

  const availableTypes = categoryDetails?.serviceTypes || [];

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    setValue("categoryId", catId, { shouldValidate: true });
    setValue("serviceTypeId", "", { shouldValidate: true });
    setSelectedServiceType(null);
  };

  const handleServiceTypeChange = (typeId: string) => {
    setValue("serviceTypeId", typeId, { shouldValidate: true });
    const match = availableTypes.find((t) => t.id === typeId) || null;
    setSelectedServiceType(match);
  };

  const createMutation = useMutation({
    mutationFn: async (data: ServiceRequestFormData) => {
      const payloadDescription = isEmergency
        ? `[EMERGENCY PRIORITY] ${data.description || ""}`.trim()
        : data.description;

      const preferredIso =
        data.preferredDateTime && !isNaN(new Date(data.preferredDateTime).getTime())
          ? new Date(data.preferredDateTime).toISOString()
          : new Date(Date.now() + 86400000).toISOString();

      return api.post("/service-requests", {
        categoryId: data.categoryId,
        serviceTypeId: data.serviceTypeId,
        title: data.title,
        description: payloadDescription,
        location: data.location,
        preferredDateTime: preferredIso,
      });
    },
    onSuccess: (res: any) => {
      toast.success("Service request submitted successfully!");
      const newId = res.data?.id;
      if (newId) {
        router.push(`/dashboard/requests/${newId}`);
      } else {
        router.push("/dashboard/requests");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit service request");
    },
  });

  const onSubmit = (data: ServiceRequestFormData) => {
    createMutation.mutate(data);
  };

  const basePrice = selectedServiceType ? Number(selectedServiceType.basePrice) : 0;
  const emergencySurcharge = isEmergency ? 25 : 0;
  const totalPrice = basePrice + emergencySurcharge;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Requests
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Book a Field Service Request"
        description="Select a certified service category, schedule a specialist arrival window, and track diagnostic milestones in real-time."
      />

      {catError && (
        <ErrorPanel
          title="Could not load categories"
          message={(catError as any)?.message}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Category Selection */}
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold items-center justify-center">
                        1
                      </span>
                      Select Service Category
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Choose the field specialization required for your property
                    </CardDescription>
                  </div>
                  {selectedCategoryId && (
                    <Badge variant="outline" className="text-xs">
                      Category Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingCategories ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {categories?.map((cat) => {
                      const isSelected = selectedCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryChange(cat.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                              : "border-border hover:border-primary/40 bg-card hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="p-2 rounded-lg bg-background text-primary border border-border/60">
                              {cat.name.toLowerCase().includes("electric") ? (
                                <Zap className="h-4 w-4 text-amber-500" />
                              ) : cat.name.toLowerCase().includes("plumb") ? (
                                <Droplets className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Wrench className="h-4 w-4 text-indigo-500" />
                              )}
                            </span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="font-bold text-xs text-foreground">{cat.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                            {cat.description || "Certified field maintenance"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.categoryId && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.categoryId.message}
                  </p>
                )}

                {/* Service Type Dropdown */}
                {selectedCategoryId && (
                  <div className="pt-2 border-t border-border/60 space-y-1.5">
                    <Label htmlFor="serviceType" className="text-xs font-semibold">
                      Specific Service Type *
                    </Label>
                    {loadingTypes ? (
                      <Skeleton className="h-9 w-full" />
                    ) : availableTypes.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted">
                        No service types available under this category.
                      </p>
                    ) : (
                      <select
                        id="serviceType"
                        value={watch("serviceTypeId")}
                        onChange={(e) => handleServiceTypeChange(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                      >
                        <option value="">-- Choose specific service type --</option>
                        {availableTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} (Base Fee: ৳{t.basePrice} • ~{t.durationMinutes} mins)
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.serviceTypeId && (
                      <p className="text-xs text-destructive font-medium">
                        {errors.serviceTypeId.message}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Problem Description & Priority */}
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold items-center justify-center">
                    2
                  </span>
                  Problem Diagnosis & Priority
                </CardTitle>
                <CardDescription className="text-xs">
                  Describe what requires maintenance or click a common diagnostic symptom
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Issue Pills */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Quick Diagnostic Suggestions:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ISSUES.map((issue) => (
                      <button
                        key={issue}
                        type="button"
                        onClick={() => setValue("title", issue, { shouldValidate: true })}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-muted/80 hover:bg-primary/10 hover:text-primary border border-border text-foreground transition-colors"
                      >
                        + {issue}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">Problem Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. AC compressor making strange clicking noise"
                    error={errors.title?.message}
                    {...register("title")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold">Detailed Symptoms / Notes</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide any additional symptoms, error codes, floor number, or parking notes..."
                    rows={3}
                    error={errors.description?.message}
                    {...register("description")}
                  />
                </div>

                {/* Priority Selection */}
                <div className="p-3 rounded-xl border border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Flame className={`h-4 w-4 ${isEmergency ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
                      Emergency / Rush Dispatch
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Prioritize technician allocation within a 2-hour emergency arrival window (+৳25 surcharge)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={isEmergency ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsEmergency(!isEmergency)}
                    className="h-8 text-xs font-semibold"
                  >
                    {isEmergency ? "Emergency Active (+$25)" : "Standard Dispatch"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 3. Location & Schedule */}
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold items-center justify-center">
                    3
                  </span>
                  Location & Arrival Window
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location" className="text-xs font-semibold">Service Location Address *</Label>
                    <span className="text-[11px] text-muted-foreground">Autofill:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {QUICK_ADDRESSES.map((addr) => (
                      <button
                        key={addr}
                        type="button"
                        onClick={() => setValue("location", addr, { shouldValidate: true })}
                        className="text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors truncate max-w-[200px]"
                        title={addr}
                      >
                        📍 {addr.split(",")[0]}
                      </button>
                    ))}
                  </div>
                  <Input
                    id="location"
                    placeholder="e.g. 123 Main St, Apt 4B, Dhanmondi, Dhaka"
                    error={errors.location?.message}
                    {...register("location")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preferredDateTime" className="text-xs font-semibold">Preferred Date & Arrival Time *</Label>
                  <Input
                    id="preferredDateTime"
                    type="datetime-local"
                    error={errors.preferredDateTime?.message}
                    {...register("preferredDateTime")}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-2">
              <Button asChild variant="outline">
                <Link href="/dashboard/requests">Cancel</Link>
              </Button>
              <Button
                type="submit"
                size="lg"
                className="shadow-md shadow-primary/20 font-semibold"
                isLoading={createMutation.isPending}
              >
                Confirm & Submit Service Request
              </Button>
            </div>
          </div>

          {/* Pricing & Estimation Sidebar Card */}
          <div className="space-y-4">
            <Card className="border border-primary/20 bg-gradient-to-b from-primary/5 via-card to-card sticky top-20 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Service Cost Estimate
                </CardTitle>
                <CardDescription className="text-xs">
                  Official transparent pricing policy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {selectedServiceType ? (
                  <>
                    <div className="p-3 rounded-xl bg-card border border-border/80">
                      <p className="font-bold text-foreground text-sm">
                        {selectedServiceType.name}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        {selectedServiceType.description || "Certified field diagnostic and repair."}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/70">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-primary" /> Base Inspection Fee:
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(basePrice, "BDT")}
                        </span>
                      </div>

                      {isEmergency && (
                        <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                          <span className="flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5" /> Emergency Surcharge:
                          </span>
                          <span className="font-semibold">+৳25</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" /> Estimated Duration:
                        </span>
                        <span className="font-semibold text-foreground">
                          ~{selectedServiceType.durationMinutes} mins
                        </span>
                      </div>

                      <div className="pt-2 border-t border-border/80 flex items-center justify-between text-sm">
                        <span className="font-bold text-foreground">Estimated Total:</span>
                        <span className="font-extrabold text-primary text-base">
                          {formatCurrency(totalPrice, "BDT")}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/50 border border-border text-[11px] text-muted-foreground space-y-2">
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> ServiSync Quality Pledge:
                      </p>
                      <ul className="space-y-1.5">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>Vetted and certified field technician</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>Digital work order and diagnostic report</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>Secure Stripe test checkout on job completion</span>
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <Wrench className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="italic">
                      Select a category and service type above to calculate standard pricing and arrival windows.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

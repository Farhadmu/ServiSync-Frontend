"use client";

import React, { useState, useEffect } from "react";
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
import { ArrowLeft, Clock, DollarSign, Sparkles, CheckCircle2 } from "lucide-react";

export default function NewServiceRequestPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);

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

  // Submit Mutation
  const createMutation = useMutation({
    mutationFn: async (data: ServiceRequestFormData) => {
      const payload = {
        ...data,
        preferredDateTime: new Date(data.preferredDateTime).toISOString(),
      };
      const res = await api.post<any>("/service-requests", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Service request submitted successfully!");
      router.push(`/dashboard/requests/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit service request");
    },
  });

  const onSubmit = (formData: ServiceRequestFormData) => {
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Requests
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Create Service Request"
        description="Submit a detailed service request. Our dispatch team will assign an expert field technician."
      />

      {catError && (
        <ErrorPanel
          title="Could not load categories"
          message={(catError as any)?.message}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <div className="md:col-span-2 space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">1. Select Service</CardTitle>
                <CardDescription className="text-xs">
                  Choose the category and specific maintenance or repair required
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor="category">Service Category *</Label>
                  {loadingCategories ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <select
                      id="category"
                      value={selectedCategoryId}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">-- Choose a category --</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.categoryId && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                {/* Service Type Dropdown */}
                {selectedCategoryId && (
                  <div className="space-y-1.5">
                    <Label htmlFor="serviceType">Service Type *</Label>
                    {loadingTypes ? (
                      <Skeleton className="h-9 w-full" />
                    ) : availableTypes.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-2 rounded bg-muted">
                        No service types currently available under this category.
                      </p>
                    ) : (
                      <select
                        id="serviceType"
                        value={watch("serviceTypeId")}
                        onChange={(e) => handleServiceTypeChange(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">-- Choose specific service type --</option>
                        {availableTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} (Base Price: ৳{t.basePrice})
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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">2. Request Details</CardTitle>
                <CardDescription className="text-xs">
                  Describe the issue and indicate when you want the technician to arrive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Problem Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. AC compressor making strange clicking noise"
                    error={errors.title?.message}
                    {...register("title")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide any additional symptoms, error codes, or access details..."
                    rows={4}
                    error={errors.description?.message}
                    {...register("description")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="location">Service Location / Address *</Label>
                    <Input
                      id="location"
                      placeholder="e.g. 123 Main St, Apt 4B, Dhaka"
                      error={errors.location?.message}
                      {...register("location")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="preferredDateTime">Preferred Date & Time *</Label>
                    <Input
                      id="preferredDateTime"
                      type="datetime-local"
                      error={errors.preferredDateTime?.message}
                      {...register("preferredDateTime")}
                    />
                  </div>
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
                Submit Service Request
              </Button>
            </div>
          </div>

          {/* Pricing & Estimation Sidebar Card */}
          <div className="space-y-4">
            <Card className="border border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Service Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {selectedServiceType ? (
                  <>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {selectedServiceType.name}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {selectedServiceType.description || "Certified field diagnostic and repair."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-primary" /> Base Inspection Fee:
                        </span>
                        <span className="font-bold text-foreground">
                          {formatCurrency(selectedServiceType.basePrice, "BDT")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" /> Estimated Time:
                        </span>
                        <span className="font-bold text-foreground">
                          {selectedServiceType.durationMinutes} mins
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-background border border-border text-[11px] text-muted-foreground">
                      <p className="font-semibold text-foreground mb-1">Guaranteed Service:</p>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Vetted certified technician
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Digital work order report
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Stripe test mode checkout
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground italic">
                    Select a category and service type to view standard pricing and estimated duration.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

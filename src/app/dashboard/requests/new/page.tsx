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
import { ServiceCategory, ServiceType, CustomerAddress, AppointmentSlot } from "@/types";
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
  Calendar,
  Home,
  Building2,
  Navigation,
  Loader2,
} from "lucide-react";

const QUICK_ISSUES = [
  "AC cooling fan making loud vibration",
  "Water pipe leakage under bathroom sink",
  "Main circuit breaker tripping frequently",
  "Kitchen appliance short circuit / sparking",
  "Water heater thermostat failure",
  "Power outlet loose connection",
];

function getCategorySuggestions(categoryName: string): string[] {
  const name = (categoryName || "").toLowerCase();
  if (name.includes("pest")) {
    return [
      "Termite Inspection & Treatment",
      "Cockroach Extermination",
      "Bed Bug Eradication",
      "General Fumigation",
      "Rodent & Rat Control",
      "Mosquito & Fly Spray",
    ];
  }
  if (name.includes("clean")) {
    return [
      "Full House Deep Cleaning",
      "Sofa & Carpet Shampooing",
      "Kitchen Deep Scrub",
      "Bathroom Sanitization & Descaling",
      "Window & Glass Facade Cleaning",
    ];
  }
  if (name.includes("paint")) {
    return [
      "Interior Wall Painting",
      "Waterproofing & Damp Repair",
      "Ceiling Painting & Touch-up",
      "Exterior Weatherproof Paint",
    ];
  }
  if (name.includes("carpent") || name.includes("wood")) {
    return [
      "Door & Lock Repair",
      "Cabinet & Drawer Fitting",
      "Furniture Assembly & Repair",
      "Custom Shelving Installation",
    ];
  }
  if (name.includes("plumb")) {
    return [
      "Water Pipe Leak Repair",
      "Faucet & Sink Replacement",
      "Water Heater Geyser Service",
      "Drain Unclogging",
    ];
  }
  if (name.includes("electric") || name.includes("hvac") || name.includes("ac")) {
    return [
      "AC Gas Refill & Cooling Service",
      "Circuit Breaker / Short Circuit Fix",
      "Ceiling Fan Installation & Repair",
      "Switchboard & Wiring Repair",
    ];
  }
  return [
    "General Inspection & Diagnostics",
    "Emergency Repair Service",
    "Installation & Setup",
    "Preventative Maintenance",
  ];
}

export default function NewServiceRequestPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);

  // Custom service type typing support
  const [isCustomTypeMode, setIsCustomTypeMode] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState("");

  // Address selection state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [customAddressMode, setCustomAddressMode] = useState(false);

  // Slot selection state
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

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
      customServiceTypeName: "",
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

  // When category changes, auto-enable custom type mode if 0 service types available
  useEffect(() => {
    if (!categoryDetails) return;
    const types = categoryDetails.serviceTypes || [];
    if (types.length === 0) {
      setIsCustomTypeMode(true);
    } else {
      setIsCustomTypeMode(false);
    }
  }, [categoryDetails]);

  // Fetch customer's saved addresses
  const { data: savedAddresses = [] } = useQuery<CustomerAddress[]>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await api.get<CustomerAddress[]>("/addresses");
      return res.data || [];
    },
  });

  // Preselect default address if available
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId && !watch("location")) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
      setValue("location", defaultAddr.address, { shouldValidate: true });
    }
  }, [savedAddresses, selectedAddressId, setValue, watch]);

  // Fetch available slots for selected date & service type
  const { data: slotsData, isLoading: loadingSlots } = useQuery<{
    date: string;
    slots: AppointmentSlot[];
  }>({
    queryKey: ["available-slots", selectedDate, selectedServiceType?.id],
    queryFn: async () => {
      const res = await api.get<{ date: string; slots: AppointmentSlot[] }>(
        "/service-requests/available-slots",
        {
          params: {
            date: selectedDate,
            serviceTypeId: selectedServiceType?.id || undefined,
          },
        }
      );
      return res.data;
    },
    enabled: !!selectedDate,
  });

  const slots = slotsData?.slots || [];

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    setValue("categoryId", catId, { shouldValidate: true });
    setValue("serviceTypeId", "", { shouldValidate: true });
    setValue("customServiceTypeName", "", { shouldValidate: true });
    setSelectedServiceType(null);
    setCustomTypeInput("");
    setIsCustomTypeMode(false);
  };

  const handleCustomTypeInput = (text: string) => {
    setCustomTypeInput(text);
    setValue("customServiceTypeName", text, { shouldValidate: true });
    setValue("serviceTypeId", "", { shouldValidate: true });
    setSelectedServiceType(null);
    const currentTitle = watch("title");
    if (!currentTitle || currentTitle.trim().length === 0) {
      setValue("title", text, { shouldValidate: true });
    }
  };

  const handleServiceTypeChange = (typeId: string) => {
    if (typeId === "__CUSTOM__") {
      setIsCustomTypeMode(true);
      setValue("serviceTypeId", "", { shouldValidate: true });
      setSelectedServiceType(null);
      return;
    }
    setIsCustomTypeMode(false);
    setValue("serviceTypeId", typeId, { shouldValidate: true });
    setValue("customServiceTypeName", "", { shouldValidate: true });
    setCustomTypeInput("");
    const match = availableTypes.find((t) => t.id === typeId) || null;
    setSelectedServiceType(match);
  };

  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);
  const categorySuggestions = getCategorySuggestions(selectedCategory?.name || "");

  const handleSelectSavedAddress = (addr: CustomerAddress) => {
    setSelectedAddressId(addr.id);
    setCustomAddressMode(false);
    setValue("location", addr.address, { shouldValidate: true });
  };

  const handleSelectSlot = (slot: AppointmentSlot) => {
    if (!slot.available) return;
    setSelectedSlotId(slot.id);
    setValue("preferredDateTime", slot.startTime, { shouldValidate: true });
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
        serviceTypeId: isCustomTypeMode ? undefined : (data.serviceTypeId || undefined),
        customServiceTypeName: (isCustomTypeMode || !data.serviceTypeId) ? (customTypeInput.trim() || undefined) : undefined,
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
    if (isCustomTypeMode || availableTypes.length === 0) {
      if (!customTypeInput.trim()) {
        toast.error("Please type your specific service requirement");
        return;
      }
    } else {
      if (!data.serviceTypeId) {
        toast.error("Please select a service type or type your requirement");
        return;
      }
    }

    if (!data.preferredDateTime) {
      toast.error("Please select an available appointment slot");
      return;
    }
    createMutation.mutate(data);
  };

  const isCustomSpec = isCustomTypeMode || (availableTypes.length === 0 && Boolean(customTypeInput.trim()));
  const basePrice = selectedServiceType ? Number(selectedServiceType.basePrice) : isCustomSpec ? 500 : 0;
  const emergencySurcharge = isEmergency ? 25 : 0;
  const totalPrice = basePrice + emergencySurcharge;

  const getAddressIcon = (lbl: string) => {
    switch (lbl) {
      case "HOME":
        return <Home className="h-3.5 w-3.5" />;
      case "OFFICE":
        return <Building2 className="h-3.5 w-3.5" />;
      default:
        return <Navigation className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Requests
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Smart Service Booking"
        description="Select a certified service specialization, choose from your saved addresses, and pick a guaranteed arrival slot."
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
            {/* 1. Category & Service Type Selection */}
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold items-center justify-center">
                        1
                      </span>
                      Service Category & Specialization
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

                {/* Service Type Selection or Custom Typing */}
                {selectedCategoryId && (
                  <div className="pt-2 border-t border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="serviceType" className="text-xs font-semibold">
                        Specific Service Type *
                      </Label>
                      {availableTypes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isCustomTypeMode) {
                              setIsCustomTypeMode(true);
                              setValue("serviceTypeId", "");
                              setSelectedServiceType(null);
                            } else {
                              setIsCustomTypeMode(false);
                              setValue("customServiceTypeName", "");
                              setCustomTypeInput("");
                            }
                          }}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          {isCustomTypeMode
                            ? "← Choose from standard service list"
                            : "+ Type custom / other requirement"}
                        </button>
                      )}
                    </div>

                    {loadingTypes ? (
                      <Skeleton className="h-10 w-full" />
                    ) : availableTypes.length === 0 || isCustomTypeMode ? (
                      <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Specify Your Service Requirement
                          </p>
                          <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                            {availableTypes.length === 0 ? "Custom Requirement" : "Manual Input"}
                          </Badge>
                        </div>

                        <Input
                          placeholder={`Type specific need (e.g. ${categorySuggestions[0] || "Inspection & maintenance"})...`}
                          value={customTypeInput}
                          onChange={(e) => handleCustomTypeInput(e.target.value)}
                          className="bg-card font-medium text-sm border-primary/30 focus-visible:ring-primary shadow-xs"
                        />

                        {categorySuggestions.length > 0 && (
                          <div className="space-y-1.5 pt-0.5">
                            <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                              <Tag className="h-3 w-3 text-primary" /> Popular Suggestions (Click to apply):
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {categorySuggestions.map((suggestion) => {
                                const isChosen = customTypeInput.toLowerCase() === suggestion.toLowerCase();
                                return (
                                  <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => handleCustomTypeInput(suggestion)}
                                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all text-left ${
                                      isChosen
                                        ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                                        : "bg-card hover:bg-primary/10 hover:border-primary/40 border-border text-foreground"
                                    }`}
                                  >
                                    + {suggestion}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
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
                        <option value="__CUSTOM__">✏️ + Other / Type specific requirement...</option>
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
                      Prioritize technician allocation within an emergency arrival window (+৳25 surcharge)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={isEmergency ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsEmergency(!isEmergency)}
                    className="h-8 text-xs font-semibold"
                  >
                    {isEmergency ? "Emergency Active (+৳25)" : "Standard Dispatch"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 3. Saved Addresses Selection */}
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold items-center justify-center">
                      3
                    </span>
                    Service Location
                  </CardTitle>
                  <Link
                    href="/dashboard/addresses"
                    className="text-xs text-primary hover:underline font-medium"
                    target="_blank"
                  >
                    + Manage Addresses
                  </Link>
                </div>
                <CardDescription className="text-xs">
                  Select one of your saved locations or enter a new address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Choose from Saved Addresses:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id && !customAddressMode;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                                : "border-border/80 hover:border-primary/40 bg-card"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="flex items-center gap-1.5 text-xs font-bold capitalize text-foreground">
                                {getAddressIcon(addr.label)}
                                {addr.label.toLowerCase()}
                              </span>
                              {addr.isDefault && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{addr.address}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="location" className="text-xs font-semibold">
                      Service Address *
                    </Label>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomAddressMode(true);
                          setSelectedAddressId(null);
                          setValue("location", "");
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Enter different address
                      </button>
                    )}
                  </div>
                  <Input
                    id="location"
                    placeholder="e.g. House 42, Road 11, Block D, Banani, Dhaka"
                    error={errors.location?.message}
                    {...register("location")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 4. Smart Appointment Slot Picker */}
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold items-center justify-center">
                    4
                  </span>
                  Appointment Date & Verified Slots
                </CardTitle>
                <CardDescription className="text-xs">
                  Available appointment slots are verified directly against technician schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="preferredDate" className="text-xs font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Select Preferred Date *
                  </Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlotId(null);
                      setValue("preferredDateTime", "");
                    }}
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <Label className="text-xs font-semibold">Available Arrival Slots *</Label>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-4 bg-muted/40 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Checking real-time technician capacity...
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted">
                      No slots available for this date. Please pick another date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {slots.map((slot) => {
                        const isSelected = selectedSlotId === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => handleSelectSlot(slot)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                                : slot.available
                                ? "border-border hover:border-primary/40 bg-card hover:bg-muted/30"
                                : "border-border/40 bg-muted/40 opacity-60 cursor-not-allowed"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                {slot.label}
                              </span>
                              {slot.available ? (
                                <Badge className="text-[10px] bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                                  {slot.remainingSlots} slots
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]">
                                  {slot.reason || "Full"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {slot.available ? "Guaranteed arrival window" : "Unavailable"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {errors.preferredDateTime && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.preferredDateTime.message}
                    </p>
                  )}
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
                  Service Booking Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Review verified appointment and cost estimate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {selectedServiceType || customTypeInput.trim() ? (
                  <>
                    <div className="p-3 rounded-xl bg-card border border-border/80">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-bold text-foreground text-sm">
                          {selectedServiceType ? selectedServiceType.name : customTypeInput.trim()}
                        </p>
                        {!selectedServiceType && (
                          <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                            Custom
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        {selectedServiceType
                          ? selectedServiceType.description || "Certified field diagnostic and repair."
                          : `Customer-specified requirement under ${selectedCategory?.name || "selected category"}.`}
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
                          ~{selectedServiceType?.durationMinutes || 60} mins
                        </span>
                      </div>

                      {watch("preferredDateTime") && (
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                          <p className="font-semibold text-[11px]">Selected Arrival Slot:</p>
                          <p className="font-medium text-xs mt-0.5">
                            {new Date(watch("preferredDateTime")!).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            ({slots.find((s) => s.id === selectedSlotId)?.label || "Scheduled"})
                          </p>
                        </div>
                      )}

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
                          <span>Formal quote provided prior to major repairs</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>Secure Stripe test checkout on completion</span>
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <Wrench className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="italic">
                      Select a category and choose or type your service requirement above to calculate standard pricing and arrival windows.
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

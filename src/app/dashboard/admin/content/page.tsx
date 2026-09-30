"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api-client";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/default-content";
import {
  WebsiteSection,
  HeroContent,
  FeaturesContent,
  WorkflowContent,
  RolesContent,
  ShowcaseContent,
  FaqContent,
  CtaContent,
  FooterContent,
} from "@/types";
import {
  Globe,
  Save,
  CheckCircle2,
  Eye,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Send,
  FileText,
  Wrench,
  Users,
} from "lucide-react";

export default function WebsiteContentManagementPage() {
  const { role } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<
    "hero" | "features" | "workflow" | "roles" | "showcase" | "faq" | "cta" | "footer" | "sections" | "preview"
  >("hero");

  // Local draft states for each section
  const [heroDraft, setHeroDraft] = useState<WebsiteSection<HeroContent> | null>(null);
  const [featuresDraft, setFeaturesDraft] = useState<WebsiteSection<FeaturesContent> | null>(null);
  const [workflowDraft, setWorkflowDraft] = useState<WebsiteSection<WorkflowContent> | null>(null);
  const [rolesDraft, setRolesDraft] = useState<WebsiteSection<RolesContent> | null>(null);
  const [showcaseDraft, setShowcaseDraft] = useState<WebsiteSection<ShowcaseContent> | null>(null);
  const [faqDraft, setFaqDraft] = useState<WebsiteSection<FaqContent> | null>(null);
  const [ctaDraft, setCtaDraft] = useState<WebsiteSection<CtaContent> | null>(null);
  const [footerDraft, setFooterDraft] = useState<WebsiteSection<FooterContent> | null>(null);

  // Fetch all CMS sections (including drafts) from backend
  const { data: sections, isLoading, isError, refetch } = useQuery<WebsiteSection[]>({
    queryKey: ["admin-cms-content"],
    queryFn: async () => {
      const res = await api.get<WebsiteSection[]>("/content/admin");
      return res.data || [];
    },
    enabled: role === "ADMIN",
  });

  useEffect(() => {
    if (sections && Array.isArray(sections)) {
      const map: Record<string, WebsiteSection> = {};
      sections.forEach((s) => {
        map[s.sectionKey] = s;
      });

      if (map["hero"]) setHeroDraft(map["hero"]);
      if (map["features"]) setFeaturesDraft(map["features"]);
      if (map["workflow"]) setWorkflowDraft(map["workflow"]);
      if (map["roles"]) setRolesDraft(map["roles"]);
      if (map["showcase"]) setShowcaseDraft(map["showcase"]);
      if (map["faq"]) setFaqDraft(map["faq"]);
      if (map["cta"]) setCtaDraft(map["cta"]);
      if (map["footer"]) setFooterDraft(map["footer"]);
    }
  }, [sections]);

  // Mutation: Update section content
  const updateSectionMutation = useMutation({
    mutationFn: async ({
      sectionKey,
      payload,
    }: {
      sectionKey: string;
      payload: Partial<WebsiteSection>;
    }) => {
      const res = await api.put<WebsiteSection>(`/content/admin/${sectionKey}`, payload);
      return res.data;
    },
    onSuccess: (data, vars) => {
      toast.success(`Section '${vars.sectionKey}' saved successfully!`);
      queryClient.invalidateQueries({ queryKey: ["admin-cms-content"] });
      queryClient.invalidateQueries({ queryKey: ["published-cms-content"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save section content");
    },
  });

  // Mutation: Toggle publish status
  const togglePublishMutation = useMutation({
    mutationFn: async ({ sectionKey, isPublished }: { sectionKey: string; isPublished: boolean }) => {
      const res = await api.patch<WebsiteSection>(`/content/admin/${sectionKey}/publish`, {
        isPublished,
      });
      return res.data;
    },
    onSuccess: (data, vars) => {
      toast.success(
        `Section '${vars.sectionKey}' is now ${vars.isPublished ? "PUBLISHED (Live)" : "DRAFT (Hidden)"}!`
      );
      queryClient.invalidateQueries({ queryKey: ["admin-cms-content"] });
      queryClient.invalidateQueries({ queryKey: ["published-cms-content"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update publish status");
    },
  });

  // Mutation: Reorder sections
  const reorderMutation = useMutation({
    mutationFn: async (sectionsToReorder: Array<{ sectionKey: string; order: number; isVisible?: boolean }>) => {
      const res = await api.post("/content/admin/reorder", { sections: sectionsToReorder });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Section layout and visibility updated!");
      queryClient.invalidateQueries({ queryKey: ["admin-cms-content"] });
      queryClient.invalidateQueries({ queryKey: ["published-cms-content"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update section layout");
    },
  });

  // Mutation: Reset to default templates
  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<WebsiteSection[]>("/content/admin/reset", {});
      return res.data;
    },
    onSuccess: () => {
      toast.success("All sections reset to default production templates!");
      queryClient.invalidateQueries({ queryKey: ["admin-cms-content"] });
      queryClient.invalidateQueries({ queryKey: ["published-cms-content"] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reset website content");
    },
  });

  // Enforce ADMIN authorization
  if (role !== "ADMIN") {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          Only authenticated System Administrators have authorization to modify public website content.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Get current active draft based on tab
  const getCurrentSection = () => {
    switch (activeTab) {
      case "hero":
        return heroDraft || (DEFAULT_HOMEPAGE_SECTIONS["hero"] as WebsiteSection<HeroContent>);
      case "features":
        return featuresDraft || (DEFAULT_HOMEPAGE_SECTIONS["features"] as WebsiteSection<FeaturesContent>);
      case "workflow":
        return workflowDraft || (DEFAULT_HOMEPAGE_SECTIONS["workflow"] as WebsiteSection<WorkflowContent>);
      case "roles":
        return rolesDraft || (DEFAULT_HOMEPAGE_SECTIONS["roles"] as WebsiteSection<RolesContent>);
      case "showcase":
        return showcaseDraft || (DEFAULT_HOMEPAGE_SECTIONS["showcase"] as WebsiteSection<ShowcaseContent>);
      case "faq":
        return faqDraft || (DEFAULT_HOMEPAGE_SECTIONS["faq"] as WebsiteSection<FaqContent>);
      case "cta":
        return ctaDraft || (DEFAULT_HOMEPAGE_SECTIONS["cta"] as WebsiteSection<CtaContent>);
      case "footer":
        return footerDraft || (DEFAULT_HOMEPAGE_SECTIONS["footer"] as WebsiteSection<FooterContent>);
      default:
        return null;
    }
  };

  const handleSaveDraft = (publishNow: boolean = false) => {
    const current = getCurrentSection();
    if (!current) return;

    updateSectionMutation.mutate({
      sectionKey: current.sectionKey,
      payload: {
        title: current.title,
        subtitle: current.subtitle,
        content: current.content,
        order: current.order,
        isVisible: current.isVisible,
        isPublished: publishNow ? true : current.isPublished,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
              ADMINISTRATION
            </Badge>
            <Badge variant="secondary" className="text-xs">
              CMS Governance
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Globe className="h-7 w-7 text-primary" />
            Website Content Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure homepage messaging, hero headlines, platform features, FAQs, and footer settings with full draft and publish controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="outline" size="sm">
            <Link href="/" target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              View Public Site
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Reset all website content back to default factory templates?")) {
                resetMutation.mutate();
              }
            }}
            isLoading={resetMutation.isPending}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Defaults
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSaveDraft(false)}
            isLoading={updateSectionMutation.isPending}
            className="text-xs font-semibold"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save Draft
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSaveDraft(true)}
            isLoading={updateSectionMutation.isPending}
            className="text-xs font-semibold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Publish to Live
          </Button>
        </div>
      </div>

      {/* Main CMS Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Section Navigation Tabs */}
        <div className="lg:col-span-3 space-y-1.5 bg-card p-3 rounded-2xl border border-border/80 shadow-sm sticky top-20">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
            Homepage Sections
          </p>

          {[
            { id: "hero", label: "Hero & Messaging", icon: Sparkles },
            { id: "features", label: "Platform Features", icon: Layers },
            { id: "workflow", label: "4-Step Workflow", icon: Wrench },
            { id: "roles", label: "Stakeholder Portals", icon: Users },
            { id: "showcase", label: "Product Showcase", icon: Eye },
            { id: "faq", label: "FAQ Knowledge Base", icon: HelpCircle },
            { id: "cta", label: "Call to Action", icon: ArrowRight },
            { id: "footer", label: "Footer & Contact", icon: FileText },
            { id: "sections", label: "Layout & Ordering", icon: Sliders },
            { id: "preview", label: "Live Preview", icon: Globe },
          ].map((item) => {
            const isActive = activeTab === item.id;
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComp className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronDown className="h-3.5 w-3.5 -rotate-90" />}
              </button>
            );
          })}
        </div>

        {/* Right Content Area: Section Form */}
        <div className="lg:col-span-9 space-y-6">
          {isLoading ? (
            <Card className="p-8 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-10 w-32" />
            </Card>
          ) : (
            <>
              {/* ── 1. HERO SECTION FORM ──────────────────────────────── */}
              {activeTab === "hero" && heroDraft && (
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Hero Section Configuration
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Configure headline, highlighted gradient text, value proposition, and primary CTAs.
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={heroDraft.isPublished ? "default" : "secondary"}
                          className="text-xs font-mono"
                        >
                          {heroDraft.isPublished ? "PUBLISHED" : "DRAFT"}
                        </Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            togglePublishMutation.mutate({
                              sectionKey: "hero",
                              isPublished: !heroDraft.isPublished,
                            })
                          }
                          className="text-xs h-7"
                        >
                          {heroDraft.isPublished ? "Make Draft" : "Publish"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="heroBadge" className="text-xs font-semibold">
                          Top Badge Text
                        </Label>
                        <Input
                          id="heroBadge"
                          value={heroDraft.content?.badgeText || ""}
                          onChange={(e) =>
                            setHeroDraft({
                              ...heroDraft,
                              content: { ...heroDraft.content, badgeText: e.target.value },
                            })
                          }
                          placeholder="e.g. Field Service Management System"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="heroHighlight" className="text-xs font-semibold">
                          Gradient Highlighted Words
                        </Label>
                        <Input
                          id="heroHighlight"
                          value={heroDraft.content?.highlightedText || ""}
                          onChange={(e) =>
                            setHeroDraft({
                              ...heroDraft,
                              content: { ...heroDraft.content, highlightedText: e.target.value },
                            })
                          }
                          placeholder="e.g. Customers, Technicians,"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="heroHeadline" className="text-xs font-semibold">
                        Main Headline *
                      </Label>
                      <Input
                        id="heroHeadline"
                        value={heroDraft.title || ""}
                        onChange={(e) => setHeroDraft({ ...heroDraft, title: e.target.value })}
                        placeholder="e.g. Smartly Connecting Customers, Technicians, and Service Operations."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="heroSubtitle" className="text-xs font-semibold">
                        Subtitle / Value Proposition *
                      </Label>
                      <Textarea
                        id="heroSubtitle"
                        rows={3}
                        value={heroDraft.subtitle || ""}
                        onChange={(e) => setHeroDraft({ ...heroDraft, subtitle: e.target.value })}
                        placeholder="Detailed value proposition..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Primary CTA Button</Label>
                        <Input
                          value={heroDraft.content?.primaryCtaText || ""}
                          onChange={(e) =>
                            setHeroDraft({
                              ...heroDraft,
                              content: { ...heroDraft.content, primaryCtaText: e.target.value },
                            })
                          }
                          placeholder="Button Label"
                        />
                        <Input
                          value={heroDraft.content?.primaryCtaLink || ""}
                          onChange={(e) =>
                            setHeroDraft({
                              ...heroDraft,
                              content: { ...heroDraft.content, primaryCtaLink: e.target.value },
                            })
                          }
                          placeholder="/register"
                          className="mt-1 font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Secondary CTA Button</Label>
                        <Input
                          value={heroDraft.content?.secondaryCtaText || ""}
                          onChange={(e) =>
                            setHeroDraft({
                              ...heroDraft,
                              content: { ...heroDraft.content, secondaryCtaText: e.target.value },
                            })
                          }
                          placeholder="Button Label"
                        />
                        <Input
                          value={heroDraft.content?.secondaryCtaLink || ""}
                          onChange={(e) =>
                            setHeroDraft({
                              ...heroDraft,
                              content: { ...heroDraft.content, secondaryCtaLink: e.target.value },
                            })
                          }
                          placeholder="#services"
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 2. FEATURES SECTION FORM ─────────────────────────── */}
              {activeTab === "features" && featuresDraft && (
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Layers className="h-5 w-5 text-primary" />
                          Platform Features Editor
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Manage core system capability cards displayed on the homepage.
                        </CardDescription>
                      </div>

                      <Badge
                        variant={featuresDraft.isPublished ? "default" : "secondary"}
                        className="text-xs font-mono"
                      >
                        {featuresDraft.isPublished ? "PUBLISHED" : "DRAFT"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Section Badge</Label>
                        <Input
                          value={featuresDraft.content?.badge || ""}
                          onChange={(e) =>
                            setFeaturesDraft({
                              ...featuresDraft,
                              content: { ...featuresDraft.content, badge: e.target.value },
                            })
                          }
                          placeholder="Platform Capabilities"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Section Title</Label>
                        <Input
                          value={featuresDraft.title || ""}
                          onChange={(e) =>
                            setFeaturesDraft({ ...featuresDraft, title: e.target.value })
                          }
                          placeholder="Engineered for Reliability & Scale"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Section Subtitle</Label>
                      <Textarea
                        rows={2}
                        value={featuresDraft.subtitle || ""}
                        onChange={(e) =>
                          setFeaturesDraft({ ...featuresDraft, subtitle: e.target.value })
                        }
                      />
                    </div>

                    {/* Features Items List */}
                    <div className="space-y-3 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Feature Cards ({featuresDraft.content?.items?.length || 0})
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const items = featuresDraft.content?.items || [];
                            setFeaturesDraft({
                              ...featuresDraft,
                              content: {
                                ...featuresDraft.content,
                                items: [
                                  ...items,
                                  {
                                    icon: "Zap",
                                    title: "New Capability",
                                    description: "Description of the newly added system feature.",
                                    tag: "Feature",
                                  },
                                ],
                              },
                            });
                          }}
                          className="text-xs h-7"
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add Card
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {(featuresDraft.content?.items || []).map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-primary">Card #{idx + 1}</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const items = featuresDraft.content?.items || [];
                                  setFeaturesDraft({
                                    ...featuresDraft,
                                    content: {
                                      ...featuresDraft.content,
                                      items: items.filter((_, i) => i !== idx),
                                    },
                                  });
                                }}
                                className="h-6 px-2 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <Input
                                value={item.title}
                                onChange={(e) => {
                                  const items = [...(featuresDraft.content?.items || [])];
                                  items[idx].title = e.target.value;
                                  setFeaturesDraft({
                                    ...featuresDraft,
                                    content: { ...featuresDraft.content, items },
                                  });
                                }}
                                placeholder="Feature Title"
                                className="font-semibold text-xs"
                              />
                              <Input
                                value={item.tag || ""}
                                onChange={(e) => {
                                  const items = [...(featuresDraft.content?.items || [])];
                                  items[idx].tag = e.target.value;
                                  setFeaturesDraft({
                                    ...featuresDraft,
                                    content: { ...featuresDraft.content, items },
                                  });
                                }}
                                placeholder="Badge / Tag (e.g. Security)"
                                className="text-xs"
                              />
                              <Input
                                value={item.icon}
                                onChange={(e) => {
                                  const items = [...(featuresDraft.content?.items || [])];
                                  items[idx].icon = e.target.value;
                                  setFeaturesDraft({
                                    ...featuresDraft,
                                    content: { ...featuresDraft.content, items },
                                  });
                                }}
                                placeholder="Icon (ShieldCheck, Zap, Wrench)"
                                className="text-xs font-mono"
                              />
                            </div>

                            <Textarea
                              rows={2}
                              value={item.description}
                              onChange={(e) => {
                                const items = [...(featuresDraft.content?.items || [])];
                                items[idx].description = e.target.value;
                                setFeaturesDraft({
                                  ...featuresDraft,
                                  content: { ...featuresDraft.content, items },
                                });
                              }}
                              placeholder="Feature description..."
                              className="text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 3. WORKFLOW STEPS FORM ───────────────────────────── */}
              {activeTab === "workflow" && workflowDraft && (
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      4-Step Lifecycle Workflow Configuration
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Customize the operational steps explaining how field service flows from customer to settlement.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Workflow Title</Label>
                        <Input
                          value={workflowDraft.title || ""}
                          onChange={(e) =>
                            setWorkflowDraft({ ...workflowDraft, title: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Workflow Subtitle</Label>
                        <Input
                          value={workflowDraft.subtitle || ""}
                          onChange={(e) =>
                            setWorkflowDraft({ ...workflowDraft, subtitle: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-3 border-t border-border/50">
                      {(workflowDraft.content?.steps || []).map((step, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-border/80 bg-card space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary font-mono">
                              Step {step.stepNumber}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {step.role}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[11px]">Step Title</Label>
                              <Input
                                value={step.title}
                                onChange={(e) => {
                                  const steps = [...(workflowDraft.content?.steps || [])];
                                  steps[idx].title = e.target.value;
                                  setWorkflowDraft({
                                    ...workflowDraft,
                                    content: { ...workflowDraft.content, steps },
                                  });
                                }}
                                className="text-xs font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px]">Responsible Role</Label>
                              <Input
                                value={step.role}
                                onChange={(e) => {
                                  const steps = [...(workflowDraft.content?.steps || [])];
                                  steps[idx].role = e.target.value;
                                  setWorkflowDraft({
                                    ...workflowDraft,
                                    content: { ...workflowDraft.content, steps },
                                  });
                                }}
                                className="text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px]">Step Description</Label>
                            <Textarea
                              rows={2}
                              value={step.description}
                              onChange={(e) => {
                                const steps = [...(workflowDraft.content?.steps || [])];
                                steps[idx].description = e.target.value;
                                setWorkflowDraft({
                                  ...workflowDraft,
                                  content: { ...workflowDraft.content, steps },
                                });
                              }}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 4. FAQ SECTION FORM ──────────────────────────────── */}
              {activeTab === "faq" && faqDraft && (
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-primary" />
                          FAQ Knowledge Base Editor
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Manage common questions, answers, and category tags displayed in the accordion.
                        </CardDescription>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const items = faqDraft.content?.items || [];
                          setFaqDraft({
                            ...faqDraft,
                            content: {
                              ...faqDraft.content,
                              items: [
                                ...items,
                                {
                                  question: "New Frequently Asked Question?",
                                  answer: "Comprehensive answer explaining the policy or technical workflow.",
                                  category: "General",
                                },
                              ],
                            },
                          });
                        }}
                        className="text-xs h-7"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add Question
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      {(faqDraft.content?.items || []).map((faq, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">
                              Q#{idx + 1}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const items = faqDraft.content?.items || [];
                                setFaqDraft({
                                  ...faqDraft,
                                  content: {
                                    ...faqDraft.content,
                                    items: items.filter((_, i) => i !== idx),
                                  },
                                });
                              }}
                              className="h-6 px-2 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <Input
                              value={faq.question}
                              onChange={(e) => {
                                const items = [...(faqDraft.content?.items || [])];
                                items[idx].question = e.target.value;
                                setFaqDraft({
                                  ...faqDraft,
                                  content: { ...faqDraft.content, items },
                                });
                              }}
                              placeholder="Question text..."
                              className="sm:col-span-3 text-xs font-semibold"
                            />
                            <Input
                              value={faq.category || ""}
                              onChange={(e) => {
                                const items = [...(faqDraft.content?.items || [])];
                                items[idx].category = e.target.value;
                                setFaqDraft({
                                  ...faqDraft,
                                  content: { ...faqDraft.content, items },
                                });
                              }}
                              placeholder="Tag (e.g. Billing)"
                              className="text-xs font-mono"
                            />
                          </div>

                          <Textarea
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => {
                              const items = [...(faqDraft.content?.items || [])];
                              items[idx].answer = e.target.value;
                              setFaqDraft({
                                ...faqDraft,
                                content: { ...faqDraft.content, items },
                              });
                            }}
                            placeholder="Detailed answer..."
                            className="text-xs leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 5. FINAL CTA SECTION FORM ────────────────────────── */}
              {activeTab === "cta" && ctaDraft && (
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-primary" />
                      Closing Call-to-Action Banner
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Banner Heading</Label>
                      <Input
                        value={ctaDraft.title || ""}
                        onChange={(e) => setCtaDraft({ ...ctaDraft, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Banner Subtitle</Label>
                      <Textarea
                        rows={2}
                        value={ctaDraft.subtitle || ""}
                        onChange={(e) => setCtaDraft({ ...ctaDraft, subtitle: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Primary Button</Label>
                        <Input
                          value={ctaDraft.content?.primaryButtonText || ""}
                          onChange={(e) =>
                            setCtaDraft({
                              ...ctaDraft,
                              content: { ...ctaDraft.content, primaryButtonText: e.target.value },
                            })
                          }
                          placeholder="Button Label"
                        />
                        <Input
                          value={ctaDraft.content?.primaryButtonLink || ""}
                          onChange={(e) =>
                            setCtaDraft({
                              ...ctaDraft,
                              content: { ...ctaDraft.content, primaryButtonLink: e.target.value },
                            })
                          }
                          placeholder="Link (/register)"
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Secondary Button</Label>
                        <Input
                          value={ctaDraft.content?.secondaryButtonText || ""}
                          onChange={(e) =>
                            setCtaDraft({
                              ...ctaDraft,
                              content: { ...ctaDraft.content, secondaryButtonText: e.target.value },
                            })
                          }
                          placeholder="Button Label"
                        />
                        <Input
                          value={ctaDraft.content?.secondaryButtonLink || ""}
                          onChange={(e) =>
                            setCtaDraft({
                              ...ctaDraft,
                              content: { ...ctaDraft.content, secondaryButtonLink: e.target.value },
                            })
                          }
                          placeholder="Link (/login)"
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 6. FOOTER CONFIGURATION FORM ─────────────────────── */}
              {activeTab === "footer" && footerDraft && (
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Footer & Organization Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Company Name</Label>
                        <Input
                          value={footerDraft.content?.companyName || ""}
                          onChange={(e) =>
                            setFooterDraft({
                              ...footerDraft,
                              content: { ...footerDraft.content, companyName: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Copyright Notice</Label>
                        <Input
                          value={footerDraft.content?.copyright || ""}
                          onChange={(e) =>
                            setFooterDraft({
                              ...footerDraft,
                              content: { ...footerDraft.content, copyright: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Footer Tagline</Label>
                      <Input
                        value={footerDraft.content?.tagline || ""}
                        onChange={(e) =>
                          setFooterDraft({
                            ...footerDraft,
                            content: { ...footerDraft.content, tagline: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Support Email</Label>
                        <Input
                          value={footerDraft.content?.contactEmail || ""}
                          onChange={(e) =>
                            setFooterDraft({
                              ...footerDraft,
                              content: { ...footerDraft.content, contactEmail: e.target.value },
                            })
                          }
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Contact Phone</Label>
                        <Input
                          value={footerDraft.content?.contactPhone || ""}
                          onChange={(e) =>
                            setFooterDraft({
                              ...footerDraft,
                              content: { ...footerDraft.content, contactPhone: e.target.value },
                            })
                          }
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Physical Address</Label>
                        <Input
                          value={footerDraft.content?.address || ""}
                          onChange={(e) =>
                            setFooterDraft({
                              ...footerDraft,
                              content: { ...footerDraft.content, address: e.target.value },
                            })
                          }
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 7. SECTION ORDER & VISIBILITY FORM ───────────────── */}
              {activeTab === "sections" && (
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Sliders className="h-5 w-5 text-primary" />
                      Section Ordering & Visibility Controls
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Toggle sections on or off and set custom vertical display ordering on the live homepage.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {(sections || []).map((sec, idx) => (
                      <div
                        key={sec.sectionKey}
                        className="p-3.5 rounded-xl border border-border/80 bg-card flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-lg bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">
                            {sec.order}
                          </span>
                          <div>
                            <p className="font-bold text-xs capitalize text-foreground">
                              {sec.sectionKey} Section
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-md">
                              {sec.title || "Standard template"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant={sec.isPublished ? "default" : "secondary"}
                            className="text-[10px] font-mono"
                          >
                            {sec.isPublished ? "PUBLISHED" : "DRAFT"}
                          </Badge>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              reorderMutation.mutate([
                                {
                                  sectionKey: sec.sectionKey,
                                  order: sec.order,
                                  isVisible: !sec.isVisible,
                                },
                              ]);
                            }}
                            className="h-8 text-xs font-semibold"
                          >
                            {sec.isVisible ? (
                              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <ToggleRight className="h-4 w-4" /> Visible
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <ToggleLeft className="h-4 w-4" /> Hidden
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* ── 8. LIVE PREVIEW TAB ──────────────────────────────── */}
              {activeTab === "preview" && (
                <Card className="border border-border/80 shadow-sm overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/60 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        In-App Responsive Live Preview
                      </CardTitle>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/" target="_blank">
                          Open in Full Browser Tab
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="border border-border rounded-b-xl overflow-hidden bg-background">
                      <iframe
                        src="/"
                        className="w-full h-[650px] border-0"
                        title="Live Homepage Preview"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

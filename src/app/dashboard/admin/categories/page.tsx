"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FolderTree, Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ServiceCategory } from "@/types";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  // Add service type modal state
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [targetCategoryForType, setTargetCategoryForType] = useState<ServiceCategory | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typePrice, setTypePrice] = useState("500");
  const [typeDuration, setTypeDuration] = useState("60");
  const [typeDesc, setTypeDesc] = useState("");

  const { data: categories, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await api.get<ServiceCategory[]>("/service-categories");
      return res.data || [];
    },
  });

  const addTypeMutation = useMutation({
    mutationFn: async () => {
      if (!targetCategoryForType) throw new Error("Category is required");
      if (!typeName.trim()) throw new Error("Service type name is required");
      return api.post(`/service-categories/${targetCategoryForType.id}/service-types`, {
        name: typeName.trim(),
        basePrice: parseFloat(typePrice) || 500,
        durationMinutes: parseInt(typeDuration) || 60,
        description: typeDesc.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setTypeModalOpen(false);
      setTypeName("");
      setTypePrice("500");
      setTypeDuration("60");
      setTypeDesc("");
      toast.success("Service specialization added to category!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to add service type");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name) throw new Error("Category name is required");
      if (editingCategory) {
        return api.patch(`/service-categories/${editingCategory.id}`, {
          name,
          description: description || undefined,
          icon: icon || undefined,
        });
      } else {
        return api.post("/service-categories", {
          name,
          description: description || undefined,
          icon: icon || undefined,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setModalOpen(false);
      toast.success(editingCategory ? "Category updated!" : "Category created successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (catId: string) => {
      return api.delete(`/service-categories/${catId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete category");
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIcon("");
    setModalOpen(true);
  };

  const openEditModal = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIcon(cat.icon || "");
    setModalOpen(true);
  };

  const openAddTypeModal = (cat: ServiceCategory) => {
    setTargetCategoryForType(cat);
    setTypeName("");
    setTypePrice("500");
    setTypeDuration("60");
    setTypeDesc("");
    setTypeModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Categories Administration"
        description="Organize the master service catalog available to customers and field technicians."
      >
        <Button size="sm" onClick={openCreateModal}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Category
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : categories?.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No service categories"
          description="Create your first category such as Electrical, HVAC, or Plumbing."
          actionLabel="Create Category"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((cat) => {
            const types = cat.serviceTypes || [];
            return (
              <Card key={cat.id} className="border-border/80 hover:shadow-md transition-all flex flex-col justify-between">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={cat.isActive ? "success" : "outline"} className="text-[10px]">
                      {cat.isActive ? "Active" : "Archived"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditModal(cat)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${cat.name}"?`)) {
                            deleteMutation.mutate(cat.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-foreground">{cat.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {cat.description || "No description provided."}
                    </p>
                  </div>

                  {/* Service Types Section */}
                  <div className="pt-2 border-t border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted-foreground">
                        Specializations:
                      </span>
                      <span className="text-[11px] font-medium text-primary">
                        {types.length} {types.length === 1 ? "type" : "types"}
                      </span>
                    </div>

                    {types.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {types.map((st) => (
                          <span
                            key={st.id}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-muted text-foreground border border-border"
                          >
                            <span>{st.name}</span>
                            <span className="text-primary font-semibold">৳{st.basePrice}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic bg-muted/40 p-2 rounded-md">
                        No specializations yet. Customers can type custom needs or you can add predefined types below.
                      </p>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs mt-2 border-dashed border-primary/40 text-primary hover:bg-primary/10"
                      onClick={() => openAddTypeModal(cat)}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Specialization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Service Category"}
            </DialogTitle>
            <DialogDescription>
              Specify the department name and description for customer bookings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catName">Category Name *</Label>
              <Input
                id="catName"
                placeholder="e.g. Electrical, HVAC, Plumbing, Pest Control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc">Description</Label>
              <Textarea
                id="catDesc"
                placeholder="Brief description of repairs covered under this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => saveMutation.mutate()}
              isLoading={saveMutation.isPending}
            >
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD SERVICE TYPE TO CATEGORY MODAL */}
      <Dialog open={typeModalOpen} onOpenChange={setTypeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Specialization to {targetCategoryForType?.name}
            </DialogTitle>
            <DialogDescription>
              Create a predefined service type with standard base price and arrival duration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="stName">Specialization Name *</Label>
              <Input
                id="stName"
                placeholder="e.g. Termite Inspection & Treatment, Deep Fumigation"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="stPrice">Base Fee (৳) *</Label>
                <Input
                  id="stPrice"
                  type="number"
                  placeholder="500"
                  value={typePrice}
                  onChange={(e) => setTypePrice(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stDuration">Estimated Duration (mins) *</Label>
                <Input
                  id="stDuration"
                  type="number"
                  placeholder="60"
                  value={typeDuration}
                  onChange={(e) => setTypeDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stDesc">Description / Coverage</Label>
              <Textarea
                id="stDesc"
                placeholder="What is included in this service specialization..."
                value={typeDesc}
                onChange={(e) => setTypeDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTypeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => addTypeMutation.mutate()}
              isLoading={addTypeMutation.isPending}
            >
              Add Specialization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

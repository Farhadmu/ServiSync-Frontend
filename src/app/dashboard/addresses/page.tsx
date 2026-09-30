"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { CustomerAddress } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Home,
  Building2,
  Navigation,
  Plus,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [label, setLabel] = useState<"HOME" | "OFFICE" | "OTHER">("HOME");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Fetch addresses
  const { data: addresses = [], isLoading, error } = useQuery<CustomerAddress[]>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await api.get<CustomerAddress[]>("/addresses");
      return res.data || [];
    },
  });

  // Create address mutation
  const createMutation = useMutation({
    mutationFn: async (payload: {
      label: string;
      address: string;
      city?: string;
      area?: string;
      isDefault: boolean;
    }) => {
      const res = await api.post<CustomerAddress>("/addresses", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added successfully");
      resetForm();
      setIsAddOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add address");
    },
  });

  // Update address mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        label?: string;
        address?: string;
        city?: string;
        area?: string;
        isDefault?: boolean;
      };
    }) => {
      const res = await api.patch<CustomerAddress>(`/addresses/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address updated successfully");
      resetForm();
      setEditingAddress(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update address");
    },
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<CustomerAddress>(`/addresses/${id}/default`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Default address updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to set default address");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address removed");
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete address");
    },
  });

  const resetForm = () => {
    setLabel("HOME");
    setAddress("");
    setCity("");
    setArea("");
    setIsDefault(false);
  };

  const openEdit = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setLabel(addr.label);
    setAddress(addr.address);
    setCity(addr.city || "");
    setArea(addr.area || "");
    setIsDefault(addr.isDefault);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || address.trim().length < 3) {
      toast.error("Please enter a valid address (at least 3 characters)");
      return;
    }

    if (editingAddress) {
      updateMutation.mutate({
        id: editingAddress.id,
        payload: {
          label,
          address: address.trim(),
          city: city.trim() || undefined,
          area: area.trim() || undefined,
          isDefault,
        },
      });
    } else {
      createMutation.mutate({
        label,
        address: address.trim(),
        city: city.trim() || undefined,
        area: area.trim() || undefined,
        isDefault,
      });
    }
  };

  const getLabelIcon = (lbl: string) => {
    switch (lbl) {
      case "HOME":
        return <Home className="h-4 w-4" />;
      case "OFFICE":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Saved Addresses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your service locations for quick and seamless booking
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Loading your addresses...</p>
        </div>
      )}

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Failed to load addresses. Please refresh the page.</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && addresses.length === 0 && (
        <Card className="border-dashed border-2 py-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No addresses saved yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Add your home or office address to book repair and maintenance services faster.
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsAddOpen(true);
              }}
              variant="outline"
              className="mt-2 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add First Address
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Address Grid */}
      {!isLoading && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((item) => (
            <Card
              key={item.id}
              className={`relative transition-all duration-200 hover:shadow-md ${
                item.isDefault
                  ? "border-primary/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm"
                  : "border-border/80"
              }`}
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      item.isDefault
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getLabelIcon(item.label)}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold capitalize">
                      {item.label.toLowerCase()}
                    </CardTitle>
                    {item.isDefault && (
                      <Badge variant="secondary" className="text-xs bg-primary/15 text-primary border-primary/20 mt-0.5">
                        Default Address
                      </Badge>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {!item.isDefault && (
                      <DropdownMenuItem
                        onClick={() => setDefaultMutation.mutate(item.id)}
                        className="gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Set as Default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => openEdit(item)}
                      className="gap-2 cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4 text-primary" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingId(item.id)}
                      className="gap-2 text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="text-sm space-y-2 text-foreground/90">
                <p className="font-medium line-clamp-2">{item.address}</p>
                {(item.area || item.city) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span>{item.area}</span>
                    {item.area && item.city && <span>•</span>}
                    <span>{item.city}</span>
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-border/40 text-xs text-muted-foreground">
                  <span>Saved location</span>
                  {!item.isDefault && (
                    <button
                      onClick={() => setDefaultMutation.mutate(item.id)}
                      className="text-primary hover:underline font-medium"
                    >
                      Make Default
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={isAddOpen || !!editingAddress}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingAddress(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Saved Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Update your service address details below."
                : "Add a new location where technicians can provide service."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Address Label</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["HOME", "OFFICE", "OTHER"] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setLabel(lbl)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      label === lbl
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/70 hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {getLabelIcon(lbl)}
                    <span className="capitalize">{lbl.toLowerCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address-field">Street Address / House / Flat *</Label>
              <Input
                id="address-field"
                placeholder="e.g. House 42, Road 11, Block D"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="area-field">Area / Neighborhood</Label>
                <Input
                  id="area-field"
                  placeholder="e.g. Banani"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-field">City</Label>
                <Input
                  id="city-field"
                  placeholder="e.g. Dhaka"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="default-toggle"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="default-toggle" className="text-sm font-normal cursor-pointer">
                Set as default service address
              </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingAddress(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingAddress ? (
                  "Save Changes"
                ) : (
                  "Add Address"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Remove Saved Address
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this address? Note: Any existing historical service
              requests and work orders will safely preserve their original service location.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Address"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

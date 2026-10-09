"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { User, UserRole } from "@/types";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Edit Role Modal State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("CUSTOMER");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-users", { page, roleFilter, search }],
    queryFn: async () => {
      const res = await api.get<User[]>("/admin/users", {
        params: {
          page,
          limit: 15,
          role: roleFilter || undefined,
          search: search || undefined,
        },
      });
      return {
        users: res.data || [],
        meta: res.meta || { page: 1, limit: 15, total: 0, totalPages: 1 },
      };
    },
  });

  // Update Role Mutation
  const roleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return;
      return api.patch(`/admin/users/${selectedUser.id}/role`, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setRoleModalOpen(false);
      toast.success("User role updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update role");
    },
  });

  // Toggle Active Status Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return api.patch(`/admin/users/${userId}/status`, { isActive });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(
        vars.isActive ? "User account activated" : "User account deactivated"
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to change user status");
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const users = data?.users || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Governance & Role Management"
        description="Inspect registered system accounts, manage authorization roles, and toggle access states."
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-card px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel message={(error as any)?.message} onRetry={() => refetch()} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match query"
          description="Try clearing your search query or role filter."
        />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">System Role</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="flex items-center gap-1.5">
                            {u.name}
                            {isSelf && (
                              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                                You
                              </Badge>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground font-mono">{u.email}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            u.role === "ADMIN"
                              ? "destructive"
                              : u.role === "MANAGER"
                              ? "secondary"
                              : u.role === "TECHNICIAN"
                              ? "warning"
                              : "default"
                          }
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={u.isActive ? "success" : "outline"}
                          className="text-[10px]"
                        >
                          {u.isActive ? "Active" : "Deactivated"}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedUser(u);
                              setNewRole(u.role);
                              setRoleModalOpen(true);
                            }}
                          >
                            Change Role
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isSelf}
                            title={isSelf ? "You cannot deactivate your own account" : undefined}
                            className={`h-7 text-xs ${
                              isSelf
                                ? "opacity-40 cursor-not-allowed text-muted-foreground"
                                : u.isActive
                                ? "text-destructive hover:text-destructive"
                                : "text-emerald-600"
                            }`}
                            onClick={() =>
                              statusMutation.mutate({
                                userId: u.id,
                                isActive: !u.isActive,
                              })
                            }
                            isLoading={statusMutation.isPending}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta && (meta.totalPages ?? 1) > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border/60 text-xs text-muted-foreground text-center sm:text-left">
              <span>
                Page {meta.page} of {meta.totalPages ?? 1} ({meta.total} total accounts)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (meta.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHANGE ROLE DIALOG */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Assigning a new role grants or restricts dashboard permissions according to ServiSync RBAC policies.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted text-xs">
              <span className="font-bold text-foreground">{selectedUser?.name}</span>
              <p className="text-muted-foreground font-mono">{selectedUser?.email}</p>
            </div>

            {selectedUser?.id === currentUser?.id && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  You are editing your own administrator account. Removing the ADMIN role from yourself is prohibited to prevent platform lockout.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="roleSelect">Select New System Role</Label>
              <select
                id="roleSelect"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="CUSTOMER">CUSTOMER — Service Booker & Client</option>
                <option value="TECHNICIAN">TECHNICIAN — Field Specialist</option>
                <option value="MANAGER">MANAGER — Operations Dispatcher</option>
                <option value="ADMIN">ADMIN — System Administrator</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={selectedUser?.id === currentUser?.id && newRole !== "ADMIN"}
              onClick={() => roleMutation.mutate()}
              isLoading={roleMutation.isPending}
            >
              Update Authorization Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

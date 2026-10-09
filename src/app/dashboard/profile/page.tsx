"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  changePasswordSchema,
  UpdateProfileFormData,
  ChangePasswordFormData,
} from "@/lib/validations";
import { api } from "@/lib/api-client";
import { User, Lock, Shield, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { user, role, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Profile Form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.customerProfile?.phone || "",
      address: user?.customerProfile?.address || "",
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || "",
        phone: user.customerProfile?.phone || "",
        address: user.customerProfile?.address || "",
      });
    }
  }, [user, resetProfile]);

  // Password Form
  const {
    register: regPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onUpdateProfile = async (data: UpdateProfileFormData) => {
    setProfileSaving(true);
    try {
      const res = await api.patch<any>("/users/me", data);
      if (res.success) {
        updateUser(res.data);
        toast.success("Profile updated successfully!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setPasswordSaving(true);
    try {
      const res = await api.patch("/users/me/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (res.success) {
        toast.success("Password changed successfully!");
        resetPass();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Account & Profile Settings"
        description="Manage your personal contact details, security credentials, and role privileges."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-4">
          <Card className="border border-border/80 text-center p-6 space-y-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-2xl mx-auto ring-4 ring-primary/20">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{user.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{user.email}</p>
            </div>
            <div className="pt-2">
              <Badge variant="default" className="text-xs font-bold px-3 py-1">
                {role}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Edit Details & Security Forms */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-xs">
                Update your display name and contact address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    error={profileErrors.name?.message}
                    {...regProfile("name")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+880..."
                      error={profileErrors.phone?.message}
                      {...regProfile("phone")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address">Service Address</Label>
                    <Input
                      id="address"
                      placeholder="e.g. 123 Main St, Dhaka"
                      error={profileErrors.address?.message}
                      {...regProfile("address")}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" isLoading={profileSaving} className="w-full sm:w-auto">
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription className="text-xs">
                Secure your account with a strong password (minimum 6 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    error={passErrors.currentPassword?.message}
                    {...regPass("currentPassword")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                    id="newPassword"
                    type="password"
                    error={passErrors.newPassword?.message}
                    {...regPass("newPassword")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      error={passErrors.confirmPassword?.message}
                      {...regPass("confirmPassword")}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" variant="outline" isLoading={passwordSaving} className="w-full sm:w-auto">
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

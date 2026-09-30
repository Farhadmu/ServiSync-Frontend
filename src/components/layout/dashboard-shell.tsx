"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandPalette } from "@/components/common/command-palette";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  FileText,
  Calendar,
  Users,
  Briefcase,
  Settings,
  ShieldAlert,
  LogOut,
  Bell,
  Menu,
  X,
  CreditCard,
  Star,
  FolderTree,
  ChevronDown,
  Loader2,
  Clock,
  Sliders,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, isLoading, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Query notifications for unread count badge
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: async () => {
      const res = await api.get<{ notifications: any[]; unreadCount: number }>("/notifications", {
        params: { unreadOnly: "true", limit: 5 },
      });
      return res.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const unreadCount = notificationsData?.unreadCount || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Verifying authorization...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Define role navigation items
  const navItemsByRole: Record<UserRole, NavItem[]> = {
    CUSTOMER: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "My Requests", href: "/dashboard/requests", icon: ClipboardList },
      { title: "New Service Request", href: "/dashboard/requests/new", icon: PlusCircle },
      { title: "Invoices & Payments", href: "/dashboard/invoices", icon: CreditCard },
      { title: "Feedback", href: "/dashboard/feedback", icon: Star },
    ],
    TECHNICIAN: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Assigned Jobs", href: "/dashboard/jobs", icon: Briefcase },
      { title: "My Schedule", href: "/dashboard/schedule", icon: Calendar },
      { title: "Service Reports", href: "/dashboard/reports", icon: FileText },
      { title: "Availability & Skills", href: "/dashboard/availability", icon: Sliders },
    ],
    MANAGER: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Service Requests", href: "/dashboard/requests", icon: ClipboardList },
      { title: "Dispatch & Schedule", href: "/dashboard/dispatch", icon: Calendar },
      { title: "Work Orders", href: "/dashboard/work-orders", icon: Briefcase },
      { title: "Invoices", href: "/dashboard/invoices", icon: CreditCard },
    ],
    ADMIN: [
      { title: "System Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "User Management", href: "/dashboard/admin/users", icon: Users },
      { title: "Service Categories", href: "/dashboard/admin/categories", icon: FolderTree },
      { title: "Website Content (CMS)", href: "/dashboard/admin/content", icon: FileText },
      { title: "All Work Orders", href: "/dashboard/work-orders", icon: Briefcase },
      { title: "Invoices & Revenue", href: "/dashboard/invoices", icon: CreditCard },
      { title: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: ShieldAlert },
    ],
  };

  const navItems = (role && navItemsByRole[role]) || [];

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/80 bg-card/90 backdrop-blur-md shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border/70">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                ServiSync
              </span>
              <span className="block text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                Field Operations
              </span>
            </div>
          </Link>
        </div>

        {/* Role Identity Tag */}
        <div className="p-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Portal
            </span>
            <Badge
              variant={
                role === "ADMIN"
                  ? "destructive"
                  : role === "MANAGER"
                  ? "secondary"
                  : role === "TECHNICIAN"
                  ? "warning"
                  : "default"
              }
              className="text-[10px] font-bold"
            >
              {role}
            </Badge>
          </div>
          <p className="mt-1 text-xs font-medium text-foreground truncate">
            {user.name}
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer profile & logout */}
        <div className="p-4 border-t border-border/70 bg-card">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/profile" className="flex items-center gap-2.5 overflow-hidden group">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {user.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </Link>
            <Button
              onClick={() => logout()}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive h-8 w-8"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="h-16 border-b border-border/80 bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground">
                ServiSync
              </span>
              <span className="hidden sm:inline-block text-muted-foreground/60">/</span>
              <span className="text-sm font-bold text-foreground capitalize">
                {pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CommandPalette />

            {/* Theme Toggle Button */}
            <ThemeToggle className="h-9 w-9 text-muted-foreground hover:text-foreground" />

            {/* Notifications Button */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-border/80 hover:bg-muted/50 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline-block text-xs font-semibold text-foreground max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground font-normal truncate">{user.email}</p>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-[9px]">
                      {role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/notifications">Notifications</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* MOBILE SLIDE-OUT DRAWER */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-card h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left">
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-base">ServiSync</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 border-b border-border/50 bg-muted/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="default" className="text-[10px]">
                  {role}
                </Badge>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? "bg-primary text-white font-bold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border">
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}

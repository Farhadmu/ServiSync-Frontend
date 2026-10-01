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
  Sliders,
  MapPin,
  HelpCircle,
  Activity,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, isLoading, logout, updateUser } = useAuthStore();
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
      { title: "System Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "My Requests & History", href: "/dashboard/requests", icon: ClipboardList },
      { title: "Book Service", href: "/dashboard/requests/new", icon: PlusCircle },
      { title: "Saved Addresses", href: "/dashboard/addresses", icon: MapPin },
      { title: "Support Tickets", href: "/dashboard/support", icon: HelpCircle },
      { title: "Invoices & Revenue", href: "/dashboard/invoices", icon: CreditCard },
      { title: "My Reviews", href: "/dashboard/feedback", icon: Star },
    ],
    TECHNICIAN: [
      { title: "System Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Assigned Jobs", href: "/dashboard/jobs", icon: Briefcase },
      { title: "My Schedule", href: "/dashboard/schedule", icon: Calendar },
      { title: "Service Reports", href: "/dashboard/reports", icon: FileText },
      { title: "Availability & Skills", href: "/dashboard/availability", icon: Sliders },
    ],
    MANAGER: [
      { title: "System Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Service Requests", href: "/dashboard/requests", icon: ClipboardList },
      { title: "Dispatch & Schedule", href: "/dashboard/dispatch", icon: Calendar },
      { title: "All Work Orders", href: "/dashboard/work-orders", icon: Briefcase },
      { title: "Invoices & Revenue", href: "/dashboard/invoices", icon: CreditCard },
      { title: "Support Tickets", href: "/dashboard/support", icon: HelpCircle },
    ],
    ADMIN: [
      { title: "System Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "User Management", href: "/dashboard/admin/users", icon: Users },
      { title: "Service Categories", href: "/dashboard/admin/categories", icon: FolderTree },
      { title: "Website Content (CMS)", href: "/dashboard/admin/content", icon: FileText },
      { title: "All Work Orders", href: "/dashboard/work-orders", icon: Briefcase },
      { title: "Invoices & Revenue", href: "/dashboard/invoices", icon: CreditCard },
      { title: "Support Tickets", href: "/dashboard/support", icon: HelpCircle },
      { title: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: ShieldAlert },
    ],
  };

  const navItems = (role && navItemsByRole[role]) || [];

  // Role display label
  const roleDisplayNames: Record<UserRole, string> = {
    ADMIN: "Administrator",
    MANAGER: "Operations Manager",
    TECHNICIAN: "Field Technician",
    CUSTOMER: "Verified Client",
  };

  const switchRole = (newRole: UserRole) => {
    updateUser({ role: newRole });
    toast.success(`Switched active view to ${newRole} dashboard`);
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SY";

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#070c18] text-foreground transition-colors duration-300">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#091021]/95 backdrop-blur-xl shrink-0 z-20">
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white block">
                ServiSync
              </span>
              <span className="block text-[9px] uppercase tracking-widest font-extrabold text-blue-600 dark:text-cyan-400">
                FIELD OPERATIONS
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="px-5 pt-6 pb-2">
          <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
            MAIN NAVIGATION
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
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
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 font-bold"
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-white/80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom System Online Widget */}
        <div className="p-4 space-y-3">
          <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1">
                  System Online
                </p>
                <p className="text-[10px] text-muted-foreground">All systems operational</p>
              </div>
            </div>

            {/* Glowing Live Heartbeat/ECG Wave SVG */}
            <div className="mt-2.5 w-full h-6 overflow-hidden">
              <svg
                viewBox="0 0 100 24"
                className="w-full h-full text-emerald-500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 12 H 30 L 35 2 L 40 22 L 45 6 L 50 16 L 55 12 H 100"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-ecg drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                />
              </svg>
            </div>
          </div>

          {/* Footer App Version & Settings */}
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span className="text-[11px] font-mono">ServiSync v1.0.0</span>
            <Link
              href="/dashboard/profile"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="h-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070c18]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                ServiSync
              </span>
              <span className="text-muted-foreground/40 font-normal">/</span>
              <span className="text-foreground font-bold capitalize">
                {pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Actions: Search, Notifications, Theme, User Pill */}
          <div className="flex items-center gap-3">
            <CommandPalette />

            {/* Notifications Button */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </Link>

            {/* Theme Toggle Button */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-0.5">
              <ThemeToggle className="h-8 w-8 text-muted-foreground hover:text-foreground" />
            </div>

            {/* User Profile Menu with Quick Role Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all text-left group">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-sm group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-foreground leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {role ? roleDisplayNames[role] : "Portal User"}
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-2xl">
                <DropdownMenuLabel className="p-2">
                  <p className="text-xs font-bold text-foreground">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                      {role} PORTAL
                    </span>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Quick Dashboard Preview Switcher */}
                <div className="px-2 py-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                    Switch Dashboard View
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {(["ADMIN", "MANAGER", "TECHNICIAN", "CUSTOMER"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => switchRole(r)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold text-left transition-colors ${
                          role === r
                            ? "bg-primary text-primary-foreground font-black"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer text-xs">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/notifications" className="cursor-pointer text-xs">Notifications</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer text-xs font-semibold"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
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
            <div className="relative w-72 max-w-[80vw] bg-card h-full flex flex-col z-10 shadow-2xl">
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-base">ServiSync</span>
                    <span className="block text-[8px] font-mono text-primary uppercase">FIELD OPERATIONS</span>
                  </div>
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

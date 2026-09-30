"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Search,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Truck,
  Briefcase,
  Calendar,
  CreditCard,
  Users,
  FolderTree,
  ShieldAlert,
  Moon,
  Sun,
  LogOut,
  UserCheck,
  FileText,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { role, user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const navItems = [
    { label: "Overview Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["CUSTOMER", "TECHNICIAN", "MANAGER", "ADMIN"] },
    { label: "My Service Requests", href: "/dashboard/requests", icon: ClipboardList, roles: ["CUSTOMER", "MANAGER", "ADMIN"] },
    { label: "Book New Service Request", href: "/dashboard/requests/new", icon: PlusCircle, roles: ["CUSTOMER"] },
    { label: "Dispatch Console", href: "/dashboard/dispatch", icon: Truck, roles: ["MANAGER", "ADMIN"] },
    { label: "Work Orders Roster", href: "/dashboard/work-orders", icon: Briefcase, roles: ["CUSTOMER", "TECHNICIAN", "MANAGER", "ADMIN"] },
    { label: "Invoices & Payments", href: "/dashboard/invoices", icon: CreditCard, roles: ["CUSTOMER", "MANAGER", "ADMIN"] },
    { label: "Assigned Jobs Queue", href: "/dashboard/jobs", icon: Briefcase, roles: ["TECHNICIAN"] },
    { label: "Technician Schedule", href: "/dashboard/schedule", icon: Calendar, roles: ["TECHNICIAN"] },
    { label: "Availability & Duty", href: "/dashboard/availability", icon: UserCheck, roles: ["TECHNICIAN"] },
    { label: "User Governance", href: "/dashboard/admin/users", icon: Users, roles: ["ADMIN"] },
    { label: "Service Categories Catalog", href: "/dashboard/admin/categories", icon: FolderTree, roles: ["ADMIN"] },
    { label: "Website Content (CMS)", href: "/dashboard/admin/content", icon: FileText, roles: ["ADMIN"] },
    { label: "Security Audit Logs", href: "/dashboard/admin/audit-logs", icon: ShieldAlert, roles: ["ADMIN"] },
  ];

  const filteredItems = navItems.filter((item) => {
    const hasRole = !role || item.roles.includes(role);
    const matchesSearch = item.label.toLowerCase().includes(search.toLowerCase());
    return hasRole && matchesSearch;
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open command palette (Ctrl+K)"
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted text-xs text-muted-foreground transition-colors max-w-[220px] w-full"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="truncate">Quick Jump...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-card px-1 font-mono text-[9px] font-medium text-muted-foreground">
          <span className="text-[10px]">Ctrl</span> K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden max-w-lg border-border shadow-2xl">
          <div className="flex items-center px-4 py-3 border-b border-border/80">
            <Search className="h-4 w-4 text-muted-foreground mr-2.5 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command, page, or action..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </p>
            {filteredItems.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                No matching pages found for &quot;{search}&quot;.
              </p>
            ) : (
              filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })
            )}

            <div className="pt-2 border-t border-border/60">
              <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </p>
              <button
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span>Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-slate-600" />
                    <span>Switch to Dark Mode</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out ({user?.name || "Account"})</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

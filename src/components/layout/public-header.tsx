"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Wrench, Shield, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export function PublicHeader() {
  const { isAuthenticated, user, role } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-all">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              ServiSync
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10">
              FSM
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#services" className="hover:text-foreground transition-colors">
            Services
          </a>
          <a href="#roles" className="hover:text-foreground transition-colors">
            Roles
          </a>
          <a href="#demo-access" className="text-primary font-semibold hover:underline">
            Demo Logins
          </a>
        </nav>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle className="h-9 w-9" />
          {isAuthenticated && user ? (
            <Button asChild variant="default" size="sm" className="shadow-sm">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard ({role})
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="default" size="sm" className="shadow-sm">
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background p-4 space-y-3 animate-in slide-in-from-top-2">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground"
          >
            How It Works
          </a>
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground"
          >
            Services
          </a>
          <a
            href="#roles"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground"
          >
            Roles
          </a>
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Button asChild variant="default" size="sm">
                <Link href="/dashboard">Dashboard ({role})</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

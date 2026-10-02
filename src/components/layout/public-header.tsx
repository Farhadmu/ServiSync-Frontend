"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Wrench, Shield, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";

import { ServiSyncLogo } from "@/components/common/servisync-logo";

export function PublicHeader() {
  const { isAuthenticated, user, role } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-all">
      <div className="container flex h-16 items-center justify-between">
        <ServiSyncLogo href="/" size="md" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#services" className="hover:text-foreground transition-colors">
            Services
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            Workflow
          </a>
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#roles" className="hover:text-foreground transition-colors">
            Roles
          </a>
          <a href="#showcase" className="hover:text-foreground transition-colors">
            Portals
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            FAQ
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
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground"
          >
            Services
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground"
          >
            Workflow
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#roles"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground"
          >
            Roles
          </a>
          <a
            href="#showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground"
          >
            Portals
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-muted-foreground hover:text-foreground"
          >
            FAQ
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

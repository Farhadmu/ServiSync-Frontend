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
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-muted-foreground">
          <a href="#services" className="hover:text-foreground transition-colors">
            Services
          </a>
          <a href="#instant-booking" className="hover:text-foreground transition-colors text-primary font-bold">
            Live Booking
          </a>
          <a href="#technicians" className="hover:text-foreground transition-colors">
            Technicians
          </a>
          <a href="#track-service" className="hover:text-foreground transition-colors">
            Track Order
          </a>
          <a href="#seasonal" className="hover:text-foreground transition-colors">
            Seasonal Care
          </a>
          <a href="#pricing-quotes" className="hover:text-foreground transition-colors">
            Quotes
          </a>
          <a href="#technician-hub" className="hover:text-foreground transition-colors">
            For Technicians
          </a>
          <a href="#trust-quality" className="hover:text-foreground transition-colors">
            Trust & FAQs
          </a>
        </nav>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle className="h-9 w-9" />
          {isAuthenticated && user ? (
            <Button asChild variant="default" size="sm" className="shadow-xs font-bold text-xs">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                Dashboard ({role})
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="default" size="sm" className="shadow-xs font-bold text-xs">
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
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background/95 backdrop-blur-xl p-4 space-y-2.5 animate-in slide-in-from-top-2">
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold py-1.5 text-muted-foreground hover:text-foreground"
          >
            Services Catalog
          </a>
          <a
            href="#instant-booking"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold py-1.5 text-primary"
          >
            ⚡ Live Booking & Availability
          </a>
          <a
            href="#technicians"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold py-1.5 text-muted-foreground hover:text-foreground"
          >
            Meet Our Technicians
          </a>
          <a
            href="#track-service"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold py-1.5 text-muted-foreground hover:text-foreground"
          >
            Track Service Order
          </a>
          <a
            href="#seasonal"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold py-1.5 text-muted-foreground hover:text-foreground"
          >
            Seasonal Collections
          </a>
          <a
            href="#pricing-quotes"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold py-1.5 text-muted-foreground hover:text-foreground"
          >
            Transparent Quotes & Pricing
          </a>
          <a
            href="#technician-hub"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold py-1.5 text-muted-foreground hover:text-foreground"
          >
            Technician Opportunity Hub
          </a>
          <a
            href="#trust-quality"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold py-1.5 text-muted-foreground hover:text-foreground"
          >
            Trust, Reviews & FAQs
          </a>
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Button asChild variant="default" size="sm" className="font-bold text-xs">
                <Link href="/dashboard">Dashboard ({role})</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="default" size="sm" className="font-bold text-xs">
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

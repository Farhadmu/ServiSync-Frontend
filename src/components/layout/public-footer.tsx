"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowRight,
  Globe,
  Activity,
  HeartHandshake,
  FileCheck,
} from "lucide-react";
import { FooterContent } from "@/types";
import { ServiSyncLogo } from "@/components/common/servisync-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PublicFooterProps {
  content?: FooterContent;
}

export function PublicFooter({ content }: PublicFooterProps) {
  const currentYear = new Date().getFullYear();
  const companyName = content?.companyName || "ServiSync Systems Inc.";
  const tagline =
    content?.tagline ||
    "Smartly Connecting Customers, Field Technicians, and Service Operations.";
  const copyright =
    content?.copyright || `© ${currentYear} ${companyName}. All rights reserved.`;
  const contactEmail = content?.contactEmail || "support@servisync.com";
  const contactPhone = content?.contactPhone || "+880 1712-345678";
  const address = content?.address || "Banani C/A, Dhaka 1213, Bangladesh";

  // Legal Modals state
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | "security" | null>(null);

  return (
    <footer className="relative border-t border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-slate-50/50 via-white to-slate-100/80 dark:from-[#070c18] dark:via-[#091122] dark:to-[#050811] text-foreground mt-auto overflow-hidden">
      {/* Subtle background ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        {/* Top Feature Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 shadow-sm">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Verified Field Technicians</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Certified trade specialists with strict background screening.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 shadow-sm">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Stripe Verified Checkout</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Automated itemized invoices with 256-bit SSL encrypted billing.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 shadow-sm">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Real-Time State Machine</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Audited state transitions from dispatch to digital service reports.</p>
            </div>
          </div>
        </div>

        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 py-14 border-b border-slate-200/80 dark:border-slate-800/80">
          {/* Brand & Corporate Presence (Col 1-4) */}
          <div className="lg:col-span-4 space-y-5">
            <ServiSyncLogo size="lg" />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              {tagline} Designed for property owners, commercial facilities, independent trades, and multi-hub operational enterprises.
            </p>

            {/* Live System Health Indicator */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational (Core API & DB)</span>
            </div>

            {/* Detailed Contact List */}
            <div className="space-y-2.5 pt-2 text-xs text-muted-foreground">
              {contactEmail && (
                <div className="flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-primary transition-colors font-medium"
                  >
                    {contactEmail}
                  </a>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <a
                    href={`tel:${contactPhone}`}
                    className="hover:text-primary transition-colors font-medium"
                  >
                    {contactPhone}
                  </a>
                </div>
              )}
              {address && (
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Platform Navigation (Col 5-6) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <a href="#services" className="hover:text-primary transition-colors flex items-center gap-1 group">
                  <span>Service Catalog</span>
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary transition-colors">
                  Workflow Lifecycle
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Platform Architecture
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-primary transition-colors">
                  Stakeholder Portals
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-primary transition-colors">
                  Product Showcase
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  FAQ & Knowledge Base
                </a>
              </li>
            </ul>
          </div>

          {/* Role Portals (Col 7-8) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Role Access & Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/login?role=customer"
                  className="hover:text-primary transition-colors flex items-center justify-between group"
                >
                  <span>Customer Service Booking</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              </li>
              <li>
                <Link
                  href="/login?role=technician"
                  className="hover:text-primary transition-colors flex items-center justify-between group"
                >
                  <span>Technician Mobile Field Hub</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              </li>
              <li>
                <Link
                  href="/login?role=manager"
                  className="hover:text-primary transition-colors flex items-center justify-between group"
                >
                  <span>Operations Dispatch Console</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              </li>
              <li>
                <Link
                  href="/login?role=admin"
                  className="hover:text-primary transition-colors flex items-center justify-between group"
                >
                  <span>Admin Control & Website CMS</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                >
                  <span>Register Free Account →</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & System Trust (Col 9-12) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Trust & Governance
            </h4>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-foreground">Enterprise Compliance</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Server-enforced role authorization, immutable cryptographic audit logs with IP tracking, and verified Stripe webhooks.
              </p>
              <div className="pt-1 flex flex-wrap gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setActiveModal("security")}
                  className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted font-medium transition-colors"
                >
                  Security Specs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal("privacy")}
                  className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted font-medium transition-colors"
                >
                  Privacy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal("terms")}
                  className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted font-medium transition-colors"
                >
                  Terms
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Social & Technology Stack */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p>{copyright}</p>
            <span className="hidden sm:inline text-muted-foreground/40">•</span>
            <button
              onClick={() => setActiveModal("privacy")}
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-muted-foreground/40">•</span>
            <button
              onClick={() => setActiveModal("terms")}
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </button>
            <span className="text-muted-foreground/40">•</span>
            <button
              onClick={() => setActiveModal("security")}
              className="hover:text-foreground transition-colors"
            >
              Security Policy
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-muted-foreground">Built for Mission-Critical Field Services</span>
            <a
              href="https://github.com/Farhadmu/ServiSync-Frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-muted-foreground hover:text-foreground"
              title="GitHub Repository"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Compliance / Legal Policy Dialogs */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              {activeModal === "privacy" && "Privacy Policy & Data Protection"}
              {activeModal === "terms" && "Terms of Service & SLA"}
              {activeModal === "security" && "System Security & Compliance Architecture"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Last updated: October 2026 • Enterprise Production Guidelines
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 text-xs text-muted-foreground leading-relaxed space-y-3 max-h-96 overflow-y-auto pr-1">
            {activeModal === "privacy" && (
              <>
                <p>
                  ServiSync values your privacy and enforces strict access restrictions. Customer contact information, service addresses, and equipment notes are strictly shared only with authorized managers and the assigned field technician.
                </p>
                <p>
                  We do not sell, license, or distribute your personal or commercial property data to third parties. All financial data is directly processed by Stripe, and ServiSync does not store raw credit card numbers.
                </p>
              </>
            )}

            {activeModal === "terms" && (
              <>
                <p>
                  By accessing ServiSync, you agree to fair commercial usage. Customers receive verified on-site service reports upon job completion, followed by an itemized digital invoice.
                </p>
                <p>
                  Technician arrival windows are managed with automated conflict-free dispatch checks to minimize cancellations. Dispute resolutions can be initiated directly via the integrated support tickets desk.
                </p>
              </>
            )}

            {activeModal === "security" && (
              <>
                <p>
                  <strong>Role-Based Access Control (RBAC):</strong> Authenticated requests are enforced server-side via JSON Web Tokens (JWT) across CUSTOMER, TECHNICIAN, MANAGER, and ADMIN tiers.
                </p>
                <p>
                  <strong>Audit Log Trail:</strong> Critical mutations including status updates, dispatch decisions, and invoice issuances produce immutable audit logs recording timestamp, action, entity, user ID, and IP address.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}

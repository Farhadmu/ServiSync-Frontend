import Link from "next/link";
import { Wrench, Shield, Mail, Phone, MapPin } from "lucide-react";
import { FooterContent } from "@/types";

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
  const address = content?.address || "Dhaka, Bangladesh";
  const links = content?.links || [
    { label: "Service Catalog", href: "#services" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Platform Features", href: "#features" },
    { label: "Role Portals", href: "#roles" },
    { label: "Product Showcase", href: "#showcase" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <footer className="border-t border-border/80 bg-card/60 backdrop-blur-sm mt-auto">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-sm">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-foreground">ServiSync</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{tagline}</p>
            <div className="space-y-1.5 pt-1 text-xs text-muted-foreground">
              {contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {contactEmail}
                  </a>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{contactPhone}</span>
                </div>
              )}
              {address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Nav Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {links.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Role Portals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Role Portals
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Customer Portal & Requests
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Technician Field Hub
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Manager Operations Dispatch
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Admin System Governance & CMS
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Security Badge */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              System Architecture
            </h4>
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border/80 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Enterprise RBAC</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Integrated PostgreSQL, Prisma ORM, Stripe webhook processing, and server-side authorization.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>{copyright}</p>
          <p className="flex items-center gap-1">
            Engineered with Next.js 15 App Router, Tailwind CSS & TanStack Query
          </p>
        </div>
      </div>
    </footer>
  );
}

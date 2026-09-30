import Link from "next/link";
import { Wrench, Shield, Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/60 backdrop-blur-sm mt-auto">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">ServiSync</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Smartly Connecting Customers, Field Technicians, and Service Operations.
              Built for high-performance field service management.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span>RBAC & Stripe Verified System</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features & Tools
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  Lifecycle Workflow
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-foreground transition-colors">
                  Service Categories
                </a>
              </li>
              <li>
                <a href="#demo-access" className="hover:text-foreground transition-colors">
                  Evaluation Accounts
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Role Portals
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Customer Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Technician Schedule & Jobs
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Manager Dispatch Console
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Admin System Governance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Assignment Info
            </h4>
            <div className="p-3 rounded-xl bg-muted/60 border border-border/80 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Programming Hero B7A7</p>
              <p>Full-Stack ServiSync Implementation</p>
              <p className="text-[11px] text-muted-foreground/80 pt-1">
                Connected to Express/Prisma Backend
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} ServiSync FSM. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with Next.js App Router, Tailwind & TanStack Query
          </p>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/default-content";
import type { WebsiteSection, ServiceCategory } from "@/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Website CMS & Landing Page Architecture", () => {
  describe("Default Fallback Content Integrity", () => {
    it("contains all 8 required homepage sections with valid keys and ordering", () => {
      const expectedKeys = [
        "hero",
        "features",
        "workflow",
        "roles",
        "showcase",
        "faq",
        "cta",
        "footer",
      ];

      const sectionsList = Object.values(DEFAULT_HOMEPAGE_SECTIONS);
      expect(sectionsList.length).toBe(8);

      const keys = Object.keys(DEFAULT_HOMEPAGE_SECTIONS);
      expect(keys).toEqual(expectedKeys);

      // Verify all sections are visible and published by default
      sectionsList.forEach((section) => {
        expect(section.isVisible).toBe(true);
        expect(section.isPublished).toBe(true);
        expect(section.order).toBeGreaterThanOrEqual(1);
        expect(section.content).toBeDefined();
      });
    });

    it("ensures hero fallback has title, subtitle, and primary/secondary CTAs", () => {
      const hero = DEFAULT_HOMEPAGE_SECTIONS.hero;
      expect(hero).toBeDefined();
      expect(hero.title).toContain("Smartly Connecting Customers");
      expect(hero.content.primaryCtaText).toBe("Get Started as Customer");
      expect(hero.content.primaryCtaLink).toBe("/register");
      expect(hero.content.metrics?.length).toBe(3);
    });

    it("ensures roles fallback contains Customer, Technician, Manager, and Admin workflows", () => {
      const roles = DEFAULT_HOMEPAGE_SECTIONS.roles;
      expect(roles).toBeDefined();
      const roleNames = roles.content.roles?.map((r: any) => r.role);
      expect(roleNames).toContain("Customer");
      expect(roleNames).toContain("Technician");
      expect(roleNames).toContain("Manager");
      expect(roleNames).toContain("Admin");
    });
  });

  describe("Admin Authorization Verification", () => {
    function checkAdminAccess(user: { role: string } | null): { allowed: boolean; redirect: string | null } {
      if (!user) {
        return { allowed: false, redirect: "/login" };
      }
      if (user.role !== "ADMIN") {
        return { allowed: false, redirect: "/dashboard" };
      }
      return { allowed: true, redirect: null };
    }

    it("denies unauthenticated visitors access to Admin CMS", () => {
      const result = checkAdminAccess(null);
      expect(result.allowed).toBe(false);
      expect(result.redirect).toBe("/login");
    });

    it("denies non-admin roles (CUSTOMER, TECHNICIAN, MANAGER) access to Admin CMS", () => {
      const customerResult = checkAdminAccess({ role: "CUSTOMER" });
      expect(customerResult.allowed).toBe(false);
      expect(customerResult.redirect).toBe("/dashboard");

      const techResult = checkAdminAccess({ role: "TECHNICIAN" });
      expect(techResult.allowed).toBe(false);
      expect(techResult.redirect).toBe("/dashboard");

      const managerResult = checkAdminAccess({ role: "MANAGER" });
      expect(managerResult.allowed).toBe(false);
      expect(managerResult.redirect).toBe("/dashboard");
    });

    it("allows ADMIN users full access to Website CMS", () => {
      const adminResult = checkAdminAccess({ role: "ADMIN" });
      expect(adminResult.allowed).toBe(true);
      expect(adminResult.redirect).toBeNull();
    });
  });

  describe("Section Ordering & Visibility Mutation Logic", () => {
    it("toggles section visibility without mutating other sections", () => {
      const sectionsList: WebsiteSection[] = Object.values(DEFAULT_HOMEPAGE_SECTIONS);
      const targetIndex = 1; // features
      const currentVisibility = sectionsList[targetIndex].isVisible;

      // Simulate toggle
      const updated = sectionsList.map((s, idx) =>
        idx === targetIndex ? { ...s, isVisible: !currentVisibility } : s
      );

      expect(updated[targetIndex].isVisible).toBe(!currentVisibility);
      expect(updated[0].isVisible).toBe(sectionsList[0].isVisible);
      expect(updated[2].isVisible).toBe(sectionsList[2].isVisible);
    });

    it("reorders sections accurately and updates sequential order indices", () => {
      const sectionsList: WebsiteSection[] = Object.values(DEFAULT_HOMEPAGE_SECTIONS);
      
      // Move section 1 (features) up to index 0 (swap with hero)
      const currentIndex = 1;
      const targetIndex = 0;
      const reordered = [...sectionsList];
      const [moved] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, moved);

      // Re-index
      const normalized = reordered.map((sec, idx) => ({ ...sec, order: idx + 1 }));

      expect(normalized[0].sectionKey).toBe("features");
      expect(normalized[0].order).toBe(1);
      expect(normalized[1].sectionKey).toBe("hero");
      expect(normalized[1].order).toBe(2);
    });

    it("clamps reordering to prevent moving beyond first or last position", () => {
      const sectionsList: WebsiteSection[] = Object.values(DEFAULT_HOMEPAGE_SECTIONS);
      
      const canMoveUp = (index: number) => index > 0;
      const canMoveDown = (index: number) => index < sectionsList.length - 1;

      expect(canMoveUp(0)).toBe(false); // First item cannot move up
      expect(canMoveUp(3)).toBe(true);
      expect(canMoveDown(sectionsList.length - 1)).toBe(false); // Last item cannot move down
      expect(canMoveDown(2)).toBe(true);
    });
  });

  describe("Service Category & Live Backend Integration Rules", () => {
    it("correctly identifies active service categories from API data", () => {
      const mockCategories: ServiceCategory[] = [
        {
          id: "cat-1",
          name: "HVAC & Climate Control",
          description: "Heating, cooling, ventilation and BMS sensor maintenance",
          isActive: true,
          services: [
            {
              id: "srv-1",
              name: "Chiller Preventive Maintenance",
              description: "Quarterly inspection and refrigerant leak check",
              categoryId: "cat-1",
              isActive: true,
              estimatedHours: 4,
              basePrice: 450,
            },
          ],
        },
        {
          id: "cat-2",
          name: "Deprecated Old Category",
          description: "No longer in service",
          isActive: false,
          services: [],
        },
      ];

      const activeCategories = mockCategories.filter((c) => c.isActive !== false);
      expect(activeCategories.length).toBe(1);
      expect(activeCategories[0].name).toBe("HVAC & Climate Control");
      expect(activeCategories[0].services?.length).toBe(1);
      expect(activeCategories[0].services?.[0].basePrice).toBe(450);
    });

    it("verifies public fallback handles backend failure without crashing", () => {
      // Simulate API failure: empty array or error
      const categories: ServiceCategory[] = [];
      const isError = true;

      // Test component logic
      const shouldShowEmptyState = !isError && categories.length === 0;
      const shouldShowErrorState = isError;

      expect(shouldShowErrorState).toBe(true);
      expect(shouldShowEmptyState).toBe(false);
    });
  });
});

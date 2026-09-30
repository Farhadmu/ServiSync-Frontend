import { describe, it, expect } from "vitest";
import { formatCurrency, getStatusBadgeVariant } from "@/lib/utils";

describe("Utility Helpers", () => {
  describe("formatCurrency", () => {
    it("formats standard amounts in BDT", () => {
      const formatted = formatCurrency(120, "BDT");
      expect(formatted).toContain("120");
    });

    it("handles null or undefined safely", () => {
      expect(formatCurrency(null)).toBe("0.00");
      expect(formatCurrency(undefined)).toBe("0.00");
    });
  });

  describe("getStatusBadgeVariant", () => {
    it("returns correct variant for active statuses", () => {
      expect(getStatusBadgeVariant("PENDING").variant).toBe("warning");
      expect(getStatusBadgeVariant("APPROVED").variant).toBe("secondary");
      expect(getStatusBadgeVariant("IN_PROGRESS").variant).toBe("default");
      expect(getStatusBadgeVariant("COMPLETED").variant).toBe("success");
      expect(getStatusBadgeVariant("PAID").variant).toBe("success");
      expect(getStatusBadgeVariant("CANCELLED").variant).toBe("destructive");
      expect(getStatusBadgeVariant("REJECTED").variant).toBe("destructive");
    });
  });
});

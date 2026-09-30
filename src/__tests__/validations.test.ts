import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  serviceRequestSchema,
  assignTechnicianSchema,
  generateInvoiceSchema,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  describe("loginSchema", () => {
    it("validates correct email and password", () => {
      const valid = { email: "customer1@example.com", password: "Customer@123" };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails on invalid email", () => {
      const invalid = { email: "not-an-email", password: "Customer@123" };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("fails on empty password", () => {
      const invalid = { email: "test@example.com", password: "" };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("validates customer registration with valid fields", () => {
      const valid = {
        name: "Alice Rahman",
        email: "alice@example.com",
        password: "Password123",
        role: "CUSTOMER",
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when password is shorter than 6 characters", () => {
      const invalid = {
        name: "Alice Rahman",
        email: "alice@example.com",
        password: "123",
        role: "CUSTOMER",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("serviceRequestSchema", () => {
    it("validates request with all required fields", () => {
      const valid = {
        categoryId: "cat-1",
        serviceTypeId: "type-1",
        title: "AC cooling fan not spinning",
        description: "Outdoor compressor fan is idle",
        location: "123 Main St, Dhaka",
        preferredDateTime: "2026-10-05T10:00",
      };
      const result = serviceRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects title with fewer than 3 characters", () => {
      const invalid = {
        categoryId: "cat-1",
        serviceTypeId: "type-1",
        title: "AC",
        location: "123 Main St",
        preferredDateTime: "2026-10-05T10:00",
      };
      const result = serviceRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("generateInvoiceSchema", () => {
    it("validates invoice with items and nonnegative amounts", () => {
      const valid = {
        items: [{ description: "Standard Labor", quantity: 2, unitPrice: 50 }],
        taxAmount: 10,
        discountAmount: 5,
      };
      const result = generateInvoiceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails when items list is empty", () => {
      const invalid = {
        items: [],
        taxAmount: 0,
        discountAmount: 0,
      };
      const result = generateInvoiceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

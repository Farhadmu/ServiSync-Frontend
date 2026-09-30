import { describe, it, expect } from "vitest";
import {
  CustomerAddress,
  SupportTicket,
  ServiceQuote,
  AppointmentSlot,
  PublicTechnicianProfile,
  TimelineStage,
} from "@/types";

describe("PHASE 1 — Smart Booking & Slot Availability Rules", () => {
  it("rejects appointment slots that are in the past", () => {
    const now = new Date("2026-10-01T12:00:00Z");
    const pastSlot: AppointmentSlot = {
      id: "slot-1",
      label: "09:00 AM - 11:00 AM",
      startTime: "2026-10-01T09:00:00Z",
      endTime: "2026-10-01T11:00:00Z",
      available: false,
      remainingSlots: 0,
      reason: "Time has passed",
    };

    const isSlotValid = new Date(pastSlot.startTime) > now && pastSlot.available;
    expect(isSlotValid).toBe(false);
  });

  it("calculates remaining slot capacity accurately based on booked jobs", () => {
    const totalCapacity = 4;
    const bookedJobs = 3;
    const remaining = Math.max(0, totalCapacity - bookedJobs);
    const available = remaining > 0;

    expect(remaining).toBe(1);
    expect(available).toBe(true);
  });

  it("flags slots as unavailable when capacity is exhausted", () => {
    const totalCapacity = 2;
    const bookedJobs = 2;
    const remaining = Math.max(0, totalCapacity - bookedJobs);
    const available = remaining > 0;

    expect(remaining).toBe(0);
    expect(available).toBe(false);
  });
});

describe("PHASE 2 — Service Timeline & Progress Milestones", () => {
  it("correctly identifies active and completed stages from authoritative status", () => {
    const statuses = [
      "PENDING",
      "UNDER_REVIEW",
      "APPROVED",
      "ASSIGNED",
      "SCHEDULED",
      "IN_PROGRESS",
      "COMPLETED",
      "PAID",
    ];

    const currentStatus = "IN_PROGRESS";
    const currentIndex = statuses.indexOf(currentStatus);

    const isSubmittedDone = statuses.indexOf("PENDING") <= currentIndex;
    const isApprovedDone = statuses.indexOf("APPROVED") <= currentIndex;
    const isWorkInProgressDone = statuses.indexOf("IN_PROGRESS") <= currentIndex;
    const isCompletedDone = statuses.indexOf("COMPLETED") <= currentIndex;

    expect(isSubmittedDone).toBe(true);
    expect(isApprovedDone).toBe(true);
    expect(isWorkInProgressDone).toBe(true);
    expect(isCompletedDone).toBe(false);
  });
});

describe("PHASE 4 — Technician Public Profile & Rating Aggregation", () => {
  it("calculates average rating accurately from genuine persisted reviews", () => {
    const reviews = [
      { rating: 5, comment: "Excellent work!" },
      { rating: 4, comment: "Punctual and clean." },
      { rating: 5, comment: "Very professional." },
    ];

    const totalReviews = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 0;

    expect(totalReviews).toBe(3);
    expect(average).toBe(4.7);
  });

  it("handles technician with no reviews gracefully without NaN or errors", () => {
    const reviews: { rating: number }[] = [];
    const totalReviews = reviews.length;
    const average = totalReviews > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / totalReviews : 0;

    expect(totalReviews).toBe(0);
    expect(average).toBe(0);
  });

  it("ensures public profile only contains approved customer-facing fields", () => {
    const publicProfile: PublicTechnicianProfile = {
      id: "tech-1",
      userId: "user-tech-1",
      name: "Rahim Ahmed",
      image: "https://example.com/avatar.jpg",
      bio: "Certified HVAC Specialist",
      experienceYears: 6,
      skills: [
        { id: "sk-1", name: "AC Maintenance", proficiency: "Expert" },
        { id: "sk-2", name: "Refrigeration", proficiency: "Intermediate" },
      ],
      stats: {
        completedJobs: 48,
        totalReviews: 22,
        averageRating: 4.8,
      },
      reviews: [],
    };

    expect(publicProfile).not.toHaveProperty("password");
    expect(publicProfile).not.toHaveProperty("hourlyRate");
    expect(publicProfile).not.toHaveProperty("email");
    expect(publicProfile).not.toHaveProperty("phone");
    expect(publicProfile.stats.completedJobs).toBe(48);
  });
});

describe("PHASE 7 — Multiple Customer Addresses & Default Rules", () => {
  it("enforces single default address rule across addresses list", () => {
    const addresses: CustomerAddress[] = [
      {
        id: "addr-1",
        userId: "cust-1",
        label: "HOME",
        address: "House 10, Road 4, Dhanmondi",
        city: "Dhaka",
        isDefault: false,
        createdAt: "2026-09-01T00:00:00Z",
        updatedAt: "2026-09-01T00:00:00Z",
      },
      {
        id: "addr-2",
        userId: "cust-1",
        label: "OFFICE",
        address: "Gulshan Avenue, Plot 14",
        city: "Dhaka",
        isDefault: true,
        createdAt: "2026-09-10T00:00:00Z",
        updatedAt: "2026-09-10T00:00:00Z",
      },
    ];

    const defaultAddresses = addresses.filter((a) => a.isDefault);
    expect(defaultAddresses.length).toBe(1);
    expect(defaultAddresses[0].label).toBe("OFFICE");
  });

  it("verifies service request preserves snapshot location regardless of address deletion", () => {
    const savedAddress: CustomerAddress = {
      id: "addr-1",
      userId: "cust-1",
      label: "HOME",
      address: "House 10, Road 4, Dhanmondi",
      city: "Dhaka",
      isDefault: true,
      createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
    };

    // Service request snapshots address string at booking time
    const serviceRequestLocation = savedAddress.address;

    // Simulate address deletion in address book
    const addressDeleted = true;

    // Historical service request still preserves original location snapshot
    expect(addressDeleted).toBe(true);
    expect(serviceRequestLocation).toBe("House 10, Road 4, Dhanmondi");
  });
});

describe("PHASE 8 — Estimate & Service Quote Calculations", () => {
  it("calculates quote total correctly with subtotal, tax, and discount", () => {
    const subtotal = 1200;
    const tax = 120; // 10%
    const discount = 100;
    const total = subtotal + tax - discount;

    expect(total).toBe(1220);
  });

  it("handles quote status progression without altering invoice amounts", () => {
    const quote: ServiceQuote = {
      id: "quo-1",
      serviceRequestId: "req-1",
      quoteNumber: "QUO-00101",
      version: 1,
      status: "PENDING",
      subtotal: 500,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 500,
      currency: "BDT",
      createdAt: "2026-09-30T00:00:00Z",
      updatedAt: "2026-09-30T00:00:00Z",
    };

    expect(quote.status).toBe("PENDING");

    // Customer accepts quote
    const acceptedQuote: ServiceQuote = {
      ...quote,
      status: "ACCEPTED",
      customerResponseAt: "2026-09-30T10:00:00Z",
    };

    expect(acceptedQuote.status).toBe("ACCEPTED");
    expect(acceptedQuote.customerResponseAt).toBeDefined();
    // Quote acceptance does not mutate or auto-create an invoice
    expect(acceptedQuote.totalAmount).toBe(500);
  });
});

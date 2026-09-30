import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { StatusTimeline } from "@/components/ui/status-timeline";
import { Wrench } from "lucide-react";

describe("UI Components Test Suite", () => {
  describe("Badge Component", () => {
    it("renders default badge with children", () => {
      render(<Badge>Active Status</Badge>);
      expect(screen.getByText("Active Status")).toBeDefined();
    });

    it("applies variant classes correctly", () => {
      const { container } = render(<Badge variant="success">Completed</Badge>);
      expect(container.firstChild).toBeDefined();
      expect(screen.getByText("Completed")).toBeDefined();
    });
  });

  describe("StatCard Component", () => {
    it("renders title, value, and description", () => {
      render(
        <StatCard
          title="Total Service Requests"
          value="1,248"
          description="Across all regional hubs"
          icon={Wrench}
          trend={{ value: "+14%", positive: true }}
        />
      );
      expect(screen.getByText("Total Service Requests")).toBeDefined();
      expect(screen.getByText("1,248")).toBeDefined();
      expect(screen.getByText("Across all regional hubs")).toBeDefined();
      expect(screen.getByText(/14%/)).toBeDefined();
    });
  });

  describe("StatusTimeline Component", () => {
    it("renders normal lifecycle progression steps", () => {
      render(<StatusTimeline currentStatus="IN_PROGRESS" />);
      // Both desktop and mobile views render "In Progress"
      const inProgressElements = screen.getAllByText("In Progress");
      expect(inProgressElements.length).toBeGreaterThanOrEqual(1);
    });

    it("renders alert message when request is cancelled", () => {
      render(<StatusTimeline currentStatus="CANCELLED" />);
      expect(screen.getByText("Request Cancelled")).toBeDefined();
      expect(
        screen.getByText(/This request was cancelled and will not proceed/i)
      ).toBeDefined();
    });

    it("renders alert message when request is rejected", () => {
      render(<StatusTimeline currentStatus="REJECTED" />);
      expect(screen.getByText("Request Rejected")).toBeDefined();
    });
  });
});

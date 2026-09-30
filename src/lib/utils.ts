import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | undefined | null, currency: string = "BDT") {
  if (amount === undefined || amount === null) return "0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "BDT" ? "BDT" : currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateString?: string | null) {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeVariant(status: string): {
  variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
  label: string;
} {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return { variant: "warning", label: "Pending" };
    case "UNDER_REVIEW":
      return { variant: "warning", label: "Under Review" };
    case "APPROVED":
      return { variant: "secondary", label: "Approved" };
    case "SCHEDULED":
      return { variant: "secondary", label: "Scheduled" };
    case "ACCEPTED":
      return { variant: "success", label: "Accepted" };
    case "ARRIVED":
      return { variant: "secondary", label: "Tech Arrived" };
    case "IN_PROGRESS":
      return { variant: "default", label: "In Progress" };
    case "COMPLETED":
      return { variant: "success", label: "Completed" };
    case "INVOICED":
      return { variant: "default", label: "Invoiced" };
    case "PAID":
    case "SUCCESS":
    case "CLOSED":
      return { variant: "success", label: status === "CLOSED" ? "Closed" : "Paid" };
    case "REJECTED":
    case "FAILED":
    case "CANCELLED":
      return { variant: "destructive", label: status };
    default:
      return { variant: "outline", label: status || "Unknown" };
  }
}

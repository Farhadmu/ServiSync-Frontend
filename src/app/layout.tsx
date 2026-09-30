import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BackendStatusBanner } from "@/components/common/backend-status-banner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ServiSync — Field Service Management System",
  description:
    "Smartly Connecting Customers, Field Technicians, and Service Operations. Real-time service tracking, technician dispatch, digital work orders, and integrated payments.",
  keywords: [
    "field service management",
    "technician dispatch",
    "work order tracking",
    "ServiSync",
    "service operations",
  ],
  authors: [{ name: "ServiSync Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
        <Providers>
          <BackendStatusBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}

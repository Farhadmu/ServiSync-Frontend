import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ServiSync — Field Service Management System",
    short_name: "ServiSync",
    description: "Smartly Connecting Customers, Field Technicians, and Service Operations",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
  };
}

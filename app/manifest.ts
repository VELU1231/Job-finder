import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JobFinder",
    short_name: "JobFinder",
    description: "Global job discovery app",
    start_url: "/",
    display: "standalone",
    background_color: "#faf5ff",
    theme_color: "#7c3aed",
    icons: []
  };
}

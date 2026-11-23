import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VeTwo — Open-Source VetTech",
    short_name: "VeTwo",
    description: "Revolutionizing Veterinary care through Engineering & Code.",
    start_url: "/en",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}

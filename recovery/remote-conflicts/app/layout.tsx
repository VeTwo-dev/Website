import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://vetwo.dev"),
  title: {
    template: "%s — VeTwo | Open-Source VetTech",
    default: "VeTwo — Open-Source Solutions for Animal Healthcare",
  },
  description: "Revolutionizing Veterinary care through Engineering & Code. Open-source VetTech, scientific tooling, and developer infrastructure.",
  alternates: { canonical: "https://vetwo.dev" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

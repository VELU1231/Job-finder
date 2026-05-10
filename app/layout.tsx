import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "JobFinder",
    template: "%s | JobFinder"
  },
  description: "Global job discovery with unified search across multiple sources.",
  applicationName: "JobFinder",
  openGraph: {
    title: "JobFinder",
    description: "Global job discovery with unified search across multiple sources.",
    url: "/",
    siteName: "JobFinder",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "JobFinder",
    description: "Global job discovery with unified search across multiple sources."
  },
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}

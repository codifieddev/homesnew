import { Navbar } from "@/components/public/navigation/Navbar";
import { Footer } from "@/components/public/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Homes — Premium Real Estate Advisory in Lucknow",
    template: "%s | Homes",
  },
  description:
    "Discover RERA-verified residential plots, premium villas, and apartments in Lucknow. Expert property advisory with transparent pricing and hassle-free site visits.",
  keywords: [
    "real estate Lucknow",
    "residential plots Sushant Golf City",
    "RERA verified properties Lucknow",
    "flats in Lucknow",
    "villas Lucknow",
    "property for sale Lucknow",
    "plots Sultanpur Road",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Homes",
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

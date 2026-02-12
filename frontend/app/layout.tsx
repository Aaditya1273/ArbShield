import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { env } from "@/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "ArbShield - Privacy-Preserving Compliance Verification on Arbitrum",
    template:
      "%s | ArbShield - Privacy-Preserving Compliance on Arbitrum",
  },
  description:
    "ArbShield - Privacy-Preserving Compliance Verification Engine for Institutional RWAs on Arbitrum using Stylus Rust and ZK Proofs",
  keywords: ["arbshield", "arbitrum", "stylus", "zk proofs", "compliance", "rwa", "privacy"],
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: env.NEXT_PUBLIC_APP_URL,
    title:
      "ArbShield - Privacy-Preserving Compliance Verification on Arbitrum",
    description:
      "ArbShield - Privacy-Preserving Compliance Verification Engine for Institutional RWAs on Arbitrum using Stylus Rust and ZK Proofs",
    siteName:
      "ArbShield - Privacy-Preserving Compliance on Arbitrum",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "ArbShield - Privacy-Preserving Compliance Verification on Arbitrum",
    description:
      "ArbShield - Privacy-Preserving Compliance Verification Engine for Institutional RWAs on Arbitrum using Stylus Rust and ZK Proofs",
    site: "@arbshield",
    creator: "@arbshield",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}

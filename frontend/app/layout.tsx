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
      "LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
    template:
      "%s | LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
  },
  description:
    "LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
  keywords: ["liquidmesh", "liquidmesh ai", "somnia", "concentrated liquidity"],
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: env.NEXT_PUBLIC_APP_URL,
    title:
      "LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
    description:
      "LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
    siteName:
      "LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
    description:
      "LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
    site: "@liquidmesh",
    creator: "@liquidmesh",
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

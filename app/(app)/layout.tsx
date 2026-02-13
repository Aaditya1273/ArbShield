"use client";

import { ThemeProvider } from "next-themes";
import type React from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import AppFooter from "@/components/app-footer";
import AppHeader from "@/components/app-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected } = useAccount();

  useEffect(() => {
    // If user disconnects wallet while on a protected page, redirect to home
    if (!isConnected && pathname !== "/") {
      router.push("/");
    }
  }, [isConnected, pathname, router]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="liquidmesh-app-theme"
    >
      <div>
        <AppHeader />
        <main className="container mx-auto px-4 py-8">{children}</main>
        <AppFooter />
      </div>
    </ThemeProvider>
  );
}

"use client";

import { ThemeProvider } from "next-themes";
import type React from "react";
import AppFooter from "@/components/app-footer";
import AppHeader from "@/components/app-header";
// ProtectedRoute no longer used; pages handle auth gating at action level

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

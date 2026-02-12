"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function HeroHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-[#34A4FF] via-[#6D6BFF] to-[#A855FF] bg-clip-text text-transparent">
            ArbShield
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/verify">Launch App</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

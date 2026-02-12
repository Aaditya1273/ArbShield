"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function HeroHeader() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to /verify when wallet is connected
  useEffect(() => {
    if (isConnected) {
      router.push("/verify");
    }
  }, [isConnected, router]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleProtectedNavigation = (path: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first", {
        description: "You need to connect your wallet to access this page",
        duration: 3000,
      });
      return;
    }
    router.push(path);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-white dark:text-black">
            ArbShield
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("features")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("faqs")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQs
          </button>
          <button
            onClick={() => handleProtectedNavigation("/verify")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Verify
          </button>
          <button
            onClick={() => handleProtectedNavigation("/compliance")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <WalletConnect />
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border shadow-lg">
          <nav className="container py-4 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("faqs")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              FAQs
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleProtectedNavigation("/verify");
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              Verify
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleProtectedNavigation("/compliance");
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              Dashboard
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { WalletConnect } from "./wallet-connect";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected } = useAccount();

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

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full">
      <div className="container mx-auto">
        <nav className="flex h-16 items-center justify-between px-4 gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="ArbShield"
              width={24}
              height={24}
              priority
              className="rounded-full"
            />
            <span className="text-xl font-bold">ArbShield</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleProtectedNavigation("/identity")}
              className={`relative text-sm transition-colors font-medium ${
                isActive("/identity")
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Identity
            </button>
            <button
              onClick={() => handleProtectedNavigation("/verify")}
              className={`relative text-sm transition-colors font-medium ${
                isActive("/verify")
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Verify
            </button>
            <button
              onClick={() => handleProtectedNavigation("/portal")}
              className={`relative text-sm transition-colors font-medium ${
                isActive("/portal")
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => handleProtectedNavigation("/compliance")}
              className={`relative text-sm transition-colors font-medium ${
                isActive("/compliance")
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleProtectedNavigation("/analytics")}
              className={`relative text-sm transition-colors font-medium ${
                isActive("/analytics")
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Analytics
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <WalletConnect />
          </div>
        </nav>
      </div>

      {/* Thin divider line */}
      <div className="border-b border-border/50 w-full"></div>
    </header>
  );
}

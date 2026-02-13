"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { WalletConnect } from "./wallet-connect";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { User, Shield, Briefcase, BarChart3, Activity } from "lucide-react";

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
              className={`group relative text-sm transition-all duration-300 font-medium flex items-center gap-2 ${
                isActive("/identity")
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              }`}
            >
              <User className={`size-4 transition-all duration-300 ${
                isActive("/identity") 
                  ? "text-primary" 
                  : "group-hover:rotate-12 group-hover:text-primary"
              }`} />
              Identity
            </button>
            <button
              onClick={() => handleProtectedNavigation("/verify")}
              className={`group relative text-sm transition-all duration-300 font-medium flex items-center gap-2 ${
                isActive("/verify")
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              }`}
            >
              <Shield className={`size-4 transition-all duration-300 ${
                isActive("/verify") 
                  ? "text-primary" 
                  : "group-hover:scale-110 group-hover:text-primary"
              }`} />
              Verify
            </button>
            <button
              onClick={() => handleProtectedNavigation("/portal")}
              className={`group relative text-sm transition-all duration-300 font-medium flex items-center gap-2 ${
                isActive("/portal")
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              }`}
            >
              <Briefcase className={`size-4 transition-all duration-300 ${
                isActive("/portal") 
                  ? "text-primary" 
                  : "group-hover:-rotate-12 group-hover:text-primary"
              }`} />
              Portfolio
            </button>
            <button
              onClick={() => handleProtectedNavigation("/compliance")}
              className={`group relative text-sm transition-all duration-300 font-medium flex items-center gap-2 ${
                isActive("/compliance")
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              }`}
            >
              <Activity className={`size-4 transition-all duration-300 ${
                isActive("/compliance") 
                  ? "text-primary" 
                  : "group-hover:scale-110 group-hover:text-primary"
              }`} />
              Dashboard
            </button>
            <button
              onClick={() => handleProtectedNavigation("/analytics")}
              className={`group relative text-sm transition-all duration-300 font-medium flex items-center gap-2 ${
                isActive("/analytics")
                  ? "text-foreground after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              }`}
            >
              <BarChart3 className={`size-4 transition-all duration-300 ${
                isActive("/analytics") 
                  ? "text-primary" 
                  : "group-hover:rotate-12 group-hover:text-primary"
              }`} />
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

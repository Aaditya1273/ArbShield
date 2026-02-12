import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { WalletConnect } from "./wallet-connect";

export default function AppHeader() {
  return (
    <header className="w-full">
      <div className="container mx-auto">
        <nav className="flex h-16 items-center justify-between px-4 gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="LiquidMesh"
              width={24}
              height={24}
              priority
              className="rounded-full"
            />
            <span className="text-xl font-bold">LiquidMesh</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="relative text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Dashboard
            </Link>
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

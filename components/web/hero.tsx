"use client";

import { useRouter } from "next/navigation";
import { LavaLamp } from "@/components/ui/fluid-blob";
import { HeroHeader } from "@/components/web/header";
import { WalletConnect } from "@/components/wallet-connect";
import { useAccount } from "wagmi";
import { useEffect } from "react";

export default function Hero() {
  const router = useRouter();
  const { isConnected } = useAccount();

  // Redirect to /verify when wallet is connected
  useEffect(() => {
    if (isConnected) {
      router.push("/verify");
    }
  }, [isConnected, router]);

  return (
    <>
      <HeroHeader />
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <LavaLamp />
        </div>
        <div className="flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mix-blend-exclusion text-white whitespace-nowrap">
            Privacy-First <br />
            Compliance Unlocked
          </h1>
          <p className="mt-4 text-lg lg:text-xl text-center text-white mix-blend-exclusion max-w-2xl leading-relaxed">
          ArbShield is a privacy-preserving compliance verification engine powered by Stylus Rust — enabling institutions to verify user attributes using zero-knowledge proofs without revealing sensitive data on Arbitrum.
          </p>
          <div className="mt-6 scale-110">
            <WalletConnect />
          </div>
        </div>
      </section>
    </>
  );
}

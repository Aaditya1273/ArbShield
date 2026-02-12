"use client";

import { useRouter } from "next/navigation";
import { LavaLamp } from "@/components/ui/fluid-blob";
import { WalletConnect } from "@/components/wallet-connect";
import { useAccount } from "wagmi";
import { useEffect } from "react";

export function CallToAction() {
  const router = useRouter();
  const { isConnected } = useAccount();

  // Redirect to /verify when wallet is connected
  useEffect(() => {
    if (isConnected) {
      router.push("/verify");
    }
  }, [isConnected, router]);

  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl py-16 px-8 md:py-20 md:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <LavaLamp />
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mix-blend-exclusion text-white whitespace-nowrap">
              Join the Revolution
            </h1>
            <p className="mt-4 text-lg lg:text-xl text-center text-white mix-blend-exclusion max-w-2xl leading-relaxed">
              Experience privacy-preserving compliance verification on Arbitrum with Stylus Rust.
            </p>
            <div className="mt-6">
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

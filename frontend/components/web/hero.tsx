"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LavaLamp } from "@/components/ui/fluid-blob";
import { env } from "@/env";
import { HeroHeader } from "@/components/web/header";

export default function Hero() {
  return (
    <>
      <HeroHeader />
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <LavaLamp />
        </div>
        <div className="flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mix-blend-exclusion text-white whitespace-nowrap">
            Autonomous <br />
            Liquidity Unlocked
          </h1>
          <p className="mt-4 text-lg lg:text-xl text-center text-white mix-blend-exclusion max-w-2xl leading-relaxed">
          LiquidMesh is a decentralized, non-custodial liquidity protocol powered by our multi-agent orchestration framework — enabling LPs to achieve maximum capital efficiency and superior risk-adjusted yields across Somnia.
          </p>
          <div className="mt-6">
            <Button
              asChild
              size="lg"
              variant="gradient"
              className="px-8 py-3 rounded-md text-base font-medium"
            >
              <Link href="/dashboard" target="_blank" rel="noopener noreferrer">Launch AgentMesh</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

import {
  ArrowUp,
  Brain,
  Globe,
  Network,
  Play,
  Plus,
  Signature,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works">
      <div className="bg-muted/50 py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div>
            <h2 className="font-heading text-foreground text-balance text-center text-4xl font-semibold tracking-tight">
              How It Works
            </h2>
            <p className="text-muted-foreground mb-12 mt-4 text-balance text-center text-lg">
              Multi-agent AI orchestration that autonomously manages your
              concentrated liquidity positions across Somnia DEXes.
            </p>
          </div>
          <div className="mt-16 space-y-12">
            <div className="grid items-center gap-6 sm:grid-cols-5">
              <LiquidGlassCard className="p-6 sm:col-span-2">
                <WatcherIllustration />
              </LiquidGlassCard>
              <div className="max-w-md sm:col-span-3">
                <h3 className="font-heading text-foreground text-lg font-semibold tracking-tight">
                  01 Watcher Agent
                </h3>
                <p className="text-muted-foreground mt-3 text-balance">
                  Continuously monitors pool metrics (price, volume, volatility,
                  range status) and sends structured data to the Strategist
                  agent.
                </p>
              </div>
            </div>

            <div className="grid items-center gap-6 sm:grid-cols-5">
              <LiquidGlassCard className="overflow-hidden p-6 sm:col-span-2 sm:overflow-clip">
                <StrategistIllustration />
              </LiquidGlassCard>
              <div className="max-w-md sm:col-span-3">
                <h3 className="font-heading text-foreground text-lg font-semibold tracking-tight">
                  02 Strategist Agent
                </h3>
                <p className="text-muted-foreground mt-3 text-balance">
                  Analyzes market data and decides optimal liquidity range and
                  rebalance strategy, explaining the reasoning behind each
                  decision.
                </p>
              </div>
            </div>

            <div className="grid items-center gap-6 sm:grid-cols-5">
              <LiquidGlassCard className="overflow-hidden px-6 sm:col-span-2">
                <div className="mask-b-from-75% -mx-2 -mt-2 px-2 pt-6">
                  <ExecutorIllustration />
                </div>
              </LiquidGlassCard>
              <div className="max-w-md sm:col-span-3">
                <h3 className="font-heading text-foreground text-lg font-semibold tracking-tight">
                  03 Executor Agent
                </h3>
                <p className="text-muted-foreground mt-3 text-balance">
                  Prepares and signs transaction payloads for optimal strategy
                  execution on Somnia, returning results and status updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const WatcherIllustration = () => {
  return (
    <LiquidGlassCard aria-hidden className="aspect-video p-4">
      <div className="mb-0.5 text-sm font-semibold">Watcher Agent</div>
      <div className="mb-4 flex gap-2 text-sm">
        <span className="text-muted-foreground">Monitoring Pool Metrics</span>
      </div>
      <div className="mb-2 flex -space-x-1.5">
        <div className="flex -space-x-1.5">
          {[
            { color: "bg-blue-500", label: "Price" },
            { color: "bg-red-500", label: "Volume" },
            { color: "bg-green-500", label: "Volatility" },
            { color: "bg-purple-500", label: "Range" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-background size-7 rounded-full border p-0.5 shadow shadow-zinc-950/5"
            >
              <div className={`${item.color} aspect-square rounded-full`}></div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-muted-foreground text-sm font-medium">
        Real-time Data Collection
      </div>
    </LiquidGlassCard>
  );
};

const StrategistIllustration = () => {
  return (
    <div aria-hidden className="relative">
      <LiquidGlassCard className="aspect-video w-4/5 p-3 transition-transform duration-200 ease-in-out group-hover:-rotate-3">
        <div className="mb-3 grid grid-cols-[auto_1fr] gap-2">
          <div className="bg-background size-6 rounded-full border p-0.5 shadow shadow-zinc-950/5">
            <Brain className="size-4 text-[#6D6BFF]" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground line-clamp-1 text-sm font-medium">
              AI Reasoning
            </span>
            <span className="text-muted-foreground/75 text-xs">Strategy</span>
          </div>
        </div>

        <div className="ml-8 space-y-2">
          <div className="h-2 rounded-full bg-white/10"></div>
          <div className="h-2 w-3/5 rounded-full bg-white/10"></div>
          <div className="h-2 w-1/2 rounded-full bg-white/10"></div>
        </div>

        <Brain className="ml-8 mt-3 size-5 text-[#6D6BFF]" />
      </LiquidGlassCard>
      <LiquidGlassCard className="aspect-3/5 absolute right-0 top-4 flex w-2/5 translate-y-4 p-2 transition-transform duration-200 ease-in-out group-hover:rotate-3">
        <div className="bg-foreground/5 m-auto flex size-10 rounded-full">
          <Network className="fill-foreground/50 stroke-foreground/50 m-auto size-4" />
        </div>
      </LiquidGlassCard>
    </div>
  );
};

const ExecutorIllustration = () => {
  return (
    <LiquidGlassCard
      aria-hidden
      className="aspect-video p-4 transition-transform duration-200 group-hover:translate-y-0"
    >
      <div className="w-fit">
        <Zap className="size-3.5 text-[#6D6BFF]" />
        <p className="mt-2 line-clamp-2 text-sm">
          Executing transactions on Somnia for optimal liquidity management
        </p>
      </div>
      <div className="bg-white/5 -mx-3 -mb-3 mt-3 space-y-3 rounded-lg p-3 backdrop-blur">
        <div className="text-muted-foreground text-sm">
          Transaction Status: Success
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-7 rounded-2xl bg-transparent shadow-none"
            >
              <Signature />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7 rounded-2xl bg-transparent shadow-none"
            >
              <Network />
            </Button>
          </div>

          <Button
            size="icon"
            className="size-7 rounded-2xl bg-gradient-to-r from-[#34A4FF] via-[#6D6BFF] to-[#A855FF] hover:brightness-110"
          >
            <Zap strokeWidth={3} className="text-white" />
          </Button>
        </div>
      </div>
    </LiquidGlassCard>
  );
};

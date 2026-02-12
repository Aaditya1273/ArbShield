"use client";

import { useState } from "react";

export default function FAQs() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqItems = [
    {
      id: "item-1",
      question: "What is LiquidMesh?",
      answer:
        "LiquidMesh is a decentralized, non-custodial autonomous liquidity protocol built on Somnia powered by a multi-agent orchestration framework. It enables liquidity providers to achieve maximum capital efficiency and superior risk-adjusted yield.",
    },
    {
      id: "item-2",
      question: "How does the multi-agent system work?",
      answer:
        "LiquidMesh coordinates three specialized AI agents: the Watcher monitors pool metrics, the Strategist analyzes market conditions and decides optimal ranges, and the Executor prepares and executes transactions on Somnia.",
    },
    {
      id: "item-3",
      question:
        "What makes LiquidMesh different from traditional liquidity management?",
      answer:
        "Unlike manual liquidity management, LiquidMesh uses autonomous AI agents that continuously reason, execute, and optimize your concentrated liquidity positions across Somnia DEXes with zero manual intervention.",
    },
    {
      id: "item-4",
      question: "What tokens are supported on Somnia?",
      answer:
        "LiquidMesh is optimized for Somnia's ecosystem and supports all major tokens available on Somnia DEXes. The agents automatically identify and optimize opportunities across supported trading pairs.",
    },
    {
      id: "item-5",
      question: "How does the AgentMesh Orchestrator work?",
      answer:
        "The AgentMesh Orchestrator routes messages between agents, manages shared state, handles execution logic and retries, and logs all decisions and outcomes for full transparency and auditability.",
    },
    {
      id: "item-6",
      question: "Is my liquidity safe and self-custodial?",
      answer:
        "Yes, LiquidMesh is fully self-custodial and on-chain. You maintain full control of your funds with no third-party custody or withdrawal limits. All operations are fully on-chain and transparent.",
    },
  ];

  return (
    <section id="faqs" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
          {/* Left side - Title */}
          <div>
            <h2 className="font-heading text-foreground text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Frequently
              <br />
              asked
              <br />
              questions
            </h2>
          </div>

          {/* Right side - FAQ Items */}
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={item.id} className="border-b border-muted/30 pb-6">
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index + 1 ? null : index + 1)
                  }
                  className="flex items-center space-x-4 w-full text-left hover:text-primary transition-colors"
                >
                  <div className="text-2xl font-bold text-primary">
                    {openFaq === index + 1 ? "−" : "+"}
                  </div>
                  <h3 className="text-xl font-semibold">{item.question}</h3>
                </button>
                {openFaq === index + 1 && (
                  <div className="mt-4 pl-10 text-muted-foreground">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

export default function FAQs() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqItems = [
    {
      id: "item-1",
      question: "What is ArbShield?",
      answer:
        "ArbShield is a privacy-preserving compliance verification engine built on Arbitrum using Stylus Rust. It enables institutions to verify user attributes (credit score, accreditation, KYC) using zero-knowledge proofs without revealing sensitive data.",
    },
    {
      id: "item-2",
      question: "How does the ZK proof verification work?",
      answer:
        "Users generate proofs off-chain for required attributes. ArbShield's Stylus Rust verifier validates these proofs on-chain at ~200k gas (10x cheaper than Solidity), enabling privacy-preserving compliance checks.",
    },
    {
      id: "item-3",
      question:
        "What makes ArbShield different from traditional compliance solutions?",
      answer:
        "Unlike traditional KYC that requires sharing sensitive data, ArbShield uses zero-knowledge proofs to verify compliance without revealing personal information. Built with Stylus for 10x gas efficiency and RIP-7212 for biometric passkey authentication.",
    },
    {
      id: "item-4",
      question: "What compliance attributes are supported?",
      answer:
        "ArbShield supports credit score verification, accredited investor status, KYC claims, US person status, and age verification. The system is extensible for custom institutional requirements.",
    },
    {
      id: "item-5",
      question: "How does the Orbit L3 compliance chain work?",
      answer:
        "ArbShield operates on a permissioned Orbit L3 where transactions are only sequenced if they include a valid compliance proof. This creates a regulated, compliant environment isolated from public chain risks.",
    },
    {
      id: "item-6",
      question: "Is my data safe and private?",
      answer:
        "Yes, ArbShield uses zero-knowledge proofs so your sensitive data never leaves your device. Only the proof of compliance is verified on-chain, ensuring complete privacy while maintaining regulatory compliance.",
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

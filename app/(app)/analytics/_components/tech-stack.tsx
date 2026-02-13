"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Layers, Shield, Zap } from "lucide-react";

export function TechStack() {
  const technologies = [
    {
      category: "Smart Contracts",
      icon: Code2,
      color: "text-blue-500",
      items: [
        { name: "Stylus Rust", description: "WASM-based smart contracts", badge: "Core" },
        { name: "Solidity", description: "EVM compatibility layer", badge: "Wrapper" },
        { name: "OpenZeppelin", description: "Security standards", badge: "Library" },
      ],
    },
    {
      category: "Arbitrum Features",
      icon: Layers,
      color: "text-purple-500",
      items: [
        { name: "ArbOS Dia", description: "RIP-7212 precompile support", badge: "New" },
        { name: "Stylus Cache Manager", description: "WASM caching for efficiency", badge: "New" },
        { name: "Orbit SDK", description: "Custom L3 deployment", badge: "L3" },
      ],
    },
    {
      category: "Zero-Knowledge",
      icon: Shield,
      color: "text-green-500",
      items: [
        { name: "snarkjs", description: "Groth16 proof generation", badge: "ZK" },
        { name: "arkworks", description: "Rust cryptography library", badge: "Rust" },
        { name: "Poseidon Hash", description: "ZK-friendly hash function", badge: "Crypto" },
      ],
    },
    {
      category: "Authentication",
      icon: Zap,
      color: "text-yellow-500",
      items: [
        { name: "WebAuthn", description: "Passkey authentication", badge: "Web" },
        { name: "RIP-7212", description: "secp256r1 precompile", badge: "99% gas ↓" },
        { name: "SimpleWebAuthn", description: "Browser integration", badge: "Library" },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology Stack</CardTitle>
        <CardDescription>
          Cutting-edge technologies powering ArbShield
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {technologies.map((tech) => (
            <div key={tech.category} className="space-y-3">
              <div className="flex items-center gap-2">
                <tech.icon className={`size-5 ${tech.color}`} />
                <h3 className="font-semibold">{tech.category}</h3>
              </div>
              <div className="space-y-2">
                {tech.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-start justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.badge}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

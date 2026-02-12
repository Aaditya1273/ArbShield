# ArbShield
**Privacy-Preserving Compliance Verification Engine for Institutional Real-World Assets (RWAs) on Arbitrum**

**Deployed on**: Arbitrum Sepolia + Custom Permissioned "Compliance Orbit" L3  
**Core Tech**: Stylus Rust (arkworks/Poseidon) + RIP-7212 Precompile + Stylus Cache Manager  
**Hackathon**: Arbitrum Open House NYC Online Buildathon (Feb 2026)  
**Builder**: Aaditya  
**Goal**: 1st Place – The strategic compliance primitive unlocking $B+ institutional flows on Arbitrum

## Introduction
ArbShield is a generalized, on-chain privacy engine that enables institutions to verify user attributes (e.g., credit score range, accredited investor status, KYC claims, US person status) using zero-knowledge proofs **without revealing any sensitive data**.

Built as a dedicated "Compliance Orbit" L3 with Stylus Rust at its core, ArbShield unifies the latest 2026 Arbitrum upgrades (Stylus, ArbOS Dia with RIP-7212, Stylus Cache Manager, and permissioned Orbit) into a single institutional-grade product. It directly addresses the privacy bottleneck preventing BlackRock, Ondo, Franklin Templeton, and NYC asset managers from scaling RWAs on Arbitrum's $760M+ TVL to trillions.

**Vision**: "Wall Street is coming to Arbitrum, but privacy is the wall. ArbShield is the door."

## The Problem
Real-World Assets (RWAs) are exploding on Arbitrum — BlackRock BUIDL (~$1.7–$2.9B AUM), Franklin Templeton BENJI (~$897M), Ondo USDY, and others have driven ~$760M+ in TVL across 200+ assets. Institutions want to bring billions more, using tokenized Treasuries as collateral in DeFi or enabling compliant lending.

**The Core Blocker**:  
- Banks and funds must verify compliance (SEC accreditation, credit checks, geography) to meet regulations.  
- Traditional on-chain solutions require doxxing (sharing passports/PII with third parties) or leaking data — violating privacy laws and exposing users.  
- Existing ZK verifiers in Solidity are gas-expensive (~2–3M gas for complex proofs), impractical for high-frequency or mobile/enterprise use.  
- No native way to create isolated, regulated environments without compromising on speed, cost, or security.

Result: $500M+ in Arbitrum USDC/DeFi liquidity remains "stuck" — unable to legally flow into institutional RWA products.

## The Solution
ArbShield solves this with a **privacy-first compliance engine**:

1. **ZK-Proof Verification**: Users generate proofs off-chain (e.g., "credit score > 700" or "accredited investor") → submit to Stylus Rust contract → verified privately on-chain.
2. **Mock Institutional Portal**: A "BUIDL Portal" demo where users log in with biometric passkeys → generate proof → gain access to simulated RWA yield/collateral flows.
3. **Permissioned Compliance Orbit L3**: A custom Orbit chain where ArbShield acts as a gatekeeper — transactions are only sequenced if they include a valid proof.
4. **High-Performance Primitives**: Stylus-optimized Poseidon hashes, cached verifications for HFT-scale, and RIP-7212 for near-free passkey checks.

**User Flow**:
- Institutional user opens mobile/web portal.
- Authenticates with FaceID/passkey (ArbOS Dia + RIP-7212).
- Generates ZK proof for required attribute.
- Submits → ArbShield verifies (cached Stylus) → unlocks RWA access (mock BUIDL/Ondo integration).

## Uniqueness: Why ArbShield Can Only Exist on Arbitrum (2026 Alpha)
ArbShield is the **first protocol to unify the full post-Bianca/Dia Arbitrum stack** into a compliance product:

1. **Stylus (WASM via Bianca)**: Native Rust execution → Poseidon hashes at ~11.8k gas (18x cheaper than Solidity) → full ZK verifiers at ~200k gas vs 2.5M+ in EVM.
2. **ArbOS Dia + RIP-7212 Precompile**: 99% gas reduction for secp256r1 passkeys → biometric FaceID logins at pennies, enabling true enterprise UX.
3. **Stylus Cache Manager (ArbOS 32+)**: ArbShield WASM cached in node memory → repeat verifications near-instant and even cheaper (ideal for HFT compliance checks).
4. **Orbit Custom L3**: Dedicated permissioned chain with ArbShield as sequencer gatekeeper → "Compliance-First" regulated environment, isolated from public risks.

No other L2 combines these for institutional privacy at this efficiency.

**Gas Benchmarks Dashboard** (Live):
- Solidity verifier: ~2.5M gas
- ArbShield Stylus: ~200k gas (10–12x savings)
- Passkey verify (RIP-7212): <1k gas
- Cached repeat verify: Near-zero marginal cost

**Comparison vs Alternatives**:

| Feature                     | ArbShield (Arbitrum)          | Polygon ID / WorldID          | Why ArbShield Wins for Institutions |
|-----------------------------|-------------------------------|-------------------------------|-------------------------------------|
| ZK Verification Gas         | ~200k (Stylus + Poseidon)    | High (EVM limits)            | 10x cheaper for complex proofs     |
| Onboarding UX               | FaceID/Passkey (RIP-7212)    | Often seed phrases           | Enterprise-grade, biometric        |
| Repeat Verification Speed   | Near-instant (Cache Manager) | Standard                     | HFT-scale compliance               |
| Regulated Environment       | Permissioned Orbit L3        | General chains               | Walled garden + proof gatekeeper   |

## Key Features (MVP)
- Live Stylus Rust verifier (arkworks for Groth16-style proofs).
- Interactive mock BUIDL portal with passkey login.
- Permissioned Orbit L3 with proof-required sequencer.
- Full benchmarks dashboard (gas, speed, cache effects).
- OpenZeppelin Rust SDK + 100% test coverage.

## Tech Stack
- **Contracts**: Stylus Rust (arkworks, bellman, Poseidon)
- **Chain**: Arbitrum Orbit SDK (permissioned validators)
- **Upgrades**: RIP-7212 precompile, Stylus Cache Manager
- **Frontend**: React/Vite (passkey integration + mock portal)
- **Tools**: Alchemy RPCs, cargo-stylus, OpenZeppelin Rust

## Demo & Submission Assets
- **Video Pitch** (2–3 min): Hook → Live FaceID demo → Proof verify on gated Orbit → Benchmarks → Roadmap ("Arbitrum grant → audit → mainnet Q3 2026").
- **Deployed Links**: Sepolia verifier, Compliance Orbit testnet, frontend URL.
- **Benchmarks**: Live Dune/static dashboard.

## Judging Criteria Alignment (100/100 Target)
- **Smart Contract Quality**: Structured Rust, full tests, cargo-stylus checks.
- **Innovation**: First unified Bianca/Dia/Orbit compliance primitive.
- **Product-Market Fit**: Directly unblocks NYC institutional RWAs.
- **Real Problem Solving**: Eliminates doxxing without legal changes for banks.

## 95%+ Probability Checklist
- [ ] 10–12x Stylus savings + RIP-7212 passkey demo
- [ ] Stylus Cache Manager for repeat efficiency
- [ ] Permissioned Orbit with verifier gatekeeper
- [ ] Mock BUIDL/Ondo integration
- [ ] Live performance dashboard + video

ArbShield isn't just a hackathon project — it's the reference compliance layer for Arbitrum's institutional future. Let's make privacy the default for Wall Street onchain. 🚀

**Repo includes**: Source, tests, deployment scripts, video link.
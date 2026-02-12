# ArbShield Migration Guide

## ✅ Completed Changes

### 1. Core Configuration
- ✅ Updated `frontend/env.ts` - Chain ID to Arbitrum Sepolia (421614)
- ✅ Updated `frontend/.env.example` - Arbitrum RPC URLs
- ✅ Updated `frontend/lib/config.ts` - Arbitrum chain config
- ✅ Updated `frontend/lib/contracts.ts` - New ArbShield contracts
- ✅ Updated `frontend/lib/types.ts` - Compliance types added
- ✅ Updated `frontend/package.json` - Project name to arbshield

### 2. Branding & Metadata
- ✅ Updated `frontend/app/manifest.ts` - ArbShield branding
- ✅ Updated `frontend/app/layout.tsx` - Meta tags for ArbShield
- ✅ Updated `frontend/README.md` - Complete documentation

### 3. Landing Page Components
- ✅ Updated `frontend/components/web/hero.tsx` - Privacy-first messaging
- ✅ Updated `frontend/components/web/features.tsx` - ZK proofs, Stylus features
- ✅ Updated `frontend/components/web/faqs.tsx` - Compliance FAQs
- ✅ Updated `frontend/components/web/logo-cloud.tsx` - Arbitrum ecosystem logos
- ✅ Updated `frontend/components/web/footer.tsx` - Arbitrum branding
- ✅ Updated `frontend/components/web/cta.tsx` - Compliance messaging
- ✅ Updated `frontend/components/web/how-it-works.tsx` - ZK verification flow
- ✅ Updated `frontend/components/app-footer.tsx` - GitHub links

## 🔄 Remaining Tasks

### 1. Rename & Update Pages

#### A. Deposit → Verify Page
```bash
# Rename folder
mv frontend/app/(app)/deposit frontend/app/(app)/verify

# Update components:
- prepare-tokens-step.tsx → passkey-auth-step.tsx (FaceID/Passkey login)
- deposit-step.tsx → generate-proof-step.tsx (Generate ZK proof)
- automation-step.tsx → verify-proof-step.tsx (Submit & verify proof)
- deposit-form.tsx → verification-form.tsx
- deposit-stats.tsx → compliance-stats.tsx
```

#### B. Dashboard Updates
```bash
# Update components:
- agent-activity.tsx → verification-activity.tsx (Show proof verifications)
- positions-table.tsx → compliance-table.tsx (Show verified attributes)
- stats-cards.tsx → compliance-stats-cards.tsx (Gas savings, verification count)
```

### 2. API Routes Migration
```bash
# Rename folders:
mv frontend/app/api/agents frontend/app/api/verifier
mv frontend/app/api/thoughts frontend/app/api/proofs
mv frontend/app/api/positions frontend/app/api/compliance

# Update route handlers:
- /api/verifier/status → Check verifier status
- /api/verifier/verify → Submit proof for verification
- /api/proofs → Get all verification proofs
- /api/proofs/[user] → Get user-specific proofs
- /api/compliance/status → Get user compliance status
- /api/benchmarks → Get gas benchmarks
```

### 3. Add RainbowKit (Replace Privy)

```bash
# Install dependencies
bun add @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query

# Update files:
- frontend/components/providers.tsx → Add RainbowKit provider
- frontend/components/wallet-connect.tsx → Use ConnectButton from RainbowKit
- Remove Privy imports everywhere
```

### 4. Smart Contracts (New Folder)

Create `contracts/` folder with:
```
contracts/
├── src/
│   ├── ZKVerifier.sol (Stylus Rust wrapper)
│   ├── ComplianceRegistry.sol
│   └── MockBUIDL.sol
├── lib/ (Stylus Rust)
│   ├── verifier/
│   │   ├── src/lib.rs (arkworks, Poseidon)
│   │   └── Cargo.toml
├── script/
│   └── Deploy.s.sol
├── foundry.toml
└── README.md
```

### 5. Demo Data Updates
```bash
# Update files:
- frontend/public/demo/thoughts.json → proofs.json
- frontend/public/demo/positions.json → compliance.json
- frontend/public/demo/pools.json → benchmarks.json
```

### 6. Hooks Updates
```bash
# Rename and update:
- frontend/hooks/use-agent-data.ts → use-compliance-data.ts
  - useAgentThoughts → useVerificationProofs
  - useLiquidityPositions → useComplianceStatus
  - usePoolMetrics → useGasBenchmarks
```

## 📝 Component Content Changes

### Verify Page Flow (3 Steps):

**Step 1: Passkey Authentication**
- FaceID/TouchID login using RIP-7212
- Biometric verification
- Wallet connection

**Step 2: Generate ZK Proof**
- Select attribute to prove (credit score, accreditation, etc.)
- Generate proof off-chain
- Show proof generation progress

**Step 3: Verify Proof**
- Submit proof to Stylus verifier
- Show gas usage (compare with Solidity)
- Display verification result
- Link to Arbiscan

### Dashboard Content:

**Stats Cards:**
- Total Verifications
- Gas Saved (vs Solidity)
- Compliance Score
- Active Attributes

**Verification Activity:**
- Recent proof verifications
- Arbiscan links
- Gas usage per verification
- Cached vs non-cached

**Compliance Table:**
- Verified attributes
- Verification timestamps
- Proof hashes
- Status (active/expired)

## 🎨 Design Notes

- Keep all LiquidMesh UI components (LiquidGlassCard, FluidBlob, etc.)
- Keep color scheme (gradient blues/purples #6D6BFF)
- Keep animations and transitions
- Only change content/text, not design

## 🚀 Next Steps Priority

1. **High Priority:**
   - Rename deposit → verify folder
   - Update dashboard page content
   - Add RainbowKit
   - Update API routes

2. **Medium Priority:**
   - Create smart contracts folder
   - Update demo data
   - Update hooks

3. **Low Priority:**
   - Add protocol logos (Arbitrum, Stylus, etc.)
   - Update images
   - Add benchmarks dashboard

## 📦 New Dependencies Needed

```json
{
  "@rainbow-me/rainbowkit": "^2.0.0",
  "wagmi": "^2.16.8",
  "viem": "^2.38.3",
  "@tanstack/react-query": "^5.85.5"
}
```

Remove:
```json
{
  "@privy-io/react-auth": "^3.3.0",
  "@privy-io/wagmi": "^1.0.6"
}
```

## ✨ Key Messaging Changes

**Old (LiquidMesh):**
- "Autonomous Liquidity"
- "Multi-Agent Orchestration"
- "Concentrated Liquidity Management"
- "Somnia DEXes"

**New (ArbShield):**
- "Privacy-Preserving Compliance"
- "Zero-Knowledge Verification"
- "Institutional RWA Access"
- "Stylus Rust Efficiency"
- "10x Gas Savings"
- "Biometric Passkeys (RIP-7212)"

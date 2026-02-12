# ArbShield Web

Arbitrum Sepolia UI for ArbShield Privacy-Preserving Compliance Verification Engine.

## ✨ Features

-   Next.js 15 (App Router) + React 19
-   Wagmi v2 + Privy wallet connect for Arbitrum
-   TanStack Query for data fetching
-   Tailwind CSS + shadcn/ui
-   Error boundaries and loading states
-   Passkey authentication (RIP-7212)

## 📁 Structure

```
frontend/
├── app/
│   ├── (app)/dashboard/          # Compliance Dashboard UI
│   ├── (app)/verify/             # Stepper: Passkey → Generate Proof → Verify
│   └── api/                      # Next.js API routes (proxy to verifier)
├── components/                   # ui/, layout/, web/
├── hooks/                        # use-compliance-data.ts (TanStack Query)
└── public/                       # assets + demo fallback data
```

## 🚀 Quick Start

```bash
bun install
bun dev
```

Open http://localhost:3000.

### Environment

Create `.env.local` in `frontend/`:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_CHAIN_ID=421614
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Verifier backend URL (Stylus Rust), used by Next.js API proxy routes
NEXT_PUBLIC_VERIFIER_API_URL=http://localhost:8000
```

## 🧭 App Structure

-   `/verify` – Passkey Auth, Generate ZK Proof, Verify Compliance (stepper)
-   `/dashboard` – Compliance verification feed with Arbiscan Explorer links
-   `/api/verifier/*` – Proxies to Stylus verifier backend (uses `NEXT_PUBLIC_VERIFIER_API_URL`)

### API proxy routes

-   `GET /api/proofs` – Get all verification proofs
-   `GET /api/proofs/[user]` – Get user-specific proofs
-   `GET /api/compliance/status` – Check compliance status
-   `POST /api/verify/proof` – Submit ZK proof for verification
-   `GET /api/benchmarks` – Get gas benchmarks

### Demo fallback

If the verifier API is unavailable, the dashboard silently falls back to `public/demo/*` snapshots for proofs and benchmarks to keep the demo stable.

## 🔗 Useful Links

-   Arbiscan Sepolia: https://sepolia.arbiscan.io
-   Arbitrum Docs: https://docs.arbitrum.io
-   Stylus Docs: https://docs.arbitrum.io/stylus/stylus-gentle-introduction
-   Wagmi: https://wagmi.sh
-   Privy: https://docs.privy.io
-   shadcn/ui: https://ui.shadcn.com

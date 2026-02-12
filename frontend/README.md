# LiquidMesh Web

Somnia Testnet UI for the LiquidMesh Coordinated Liquidity Manager (CLM).

## ✨ Features

-   Next.js 15 (App Router) + React 19
-   Wagmi v2 + Privy wallet connect for Somnia
-   TanStack Query for data fetching
-   Tailwind CSS + shadcn/ui
-   Error boundaries and loading states

## 📁 Structure

```
frontend/
├── app/
│   ├── (app)/dashboard/          # Dashboard UI
│   ├── (app)/deposit/            # Stepper: Faucet → Deposit → Activate
│   └── api/                      # Next.js API routes (proxy to agents)
├── components/                   # ui/, layout/, web/
├── hooks/                        # use-agent-data.ts (TanStack Query)
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
NEXT_PUBLIC_CHAIN_ID=50312
NEXT_PUBLIC_RPC_URL=https://dream-rpc.somnia.network

# Agents backend URL (Hono/Bun), used by Next.js API proxy routes
NEXT_PUBLIC_AGENTS_API_URL=http://localhost:8000
```

## 🧭 App Structure

-   `/deposit` – Wrap/Mint, Approve, Deposit, Enable Automation (stepper)
-   `/dashboard` – Agent activity feed with Shannon Explorer links
-   `/api/agents/*` – Proxies to agents backend (uses `NEXT_PUBLIC_AGENTS_API_URL`)

### API proxy routes

-   `GET /api/thoughts`
-   `GET /api/thoughts/[agent]`
-   `GET /api/positions`
-   `GET /api/positions/pools`
-   `GET /api/agents/status`
-   `POST /api/agents/start`, `POST /api/agents/stop`

### Demo fallback

If the agents API or OpenAI quota is unavailable, the dashboard silently falls back to `public/demo/*` snapshots for thoughts, positions, and pools to keep the demo stable.

## 🔗 Useful Links

-   Shannon Explorer: https://shannon-explorer.somnia.network
-   Wagmi: https://wagmi.sh
-   Privy: https://docs.privy.io
-   shadcn/ui: https://ui.shadcn.com

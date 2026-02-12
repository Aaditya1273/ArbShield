# 🚀 ArbShield Deployment & Testing Plan

## Overview
To make ArbShield a fully working product with REAL data (no fake/mock data), we need to deploy smart contracts to Arbitrum Sepolia and integrate them with the frontend.

---

## 📋 Prerequisites

### 1. Tools Installation
```bash
# Install Foundry (for Solidity contracts)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install Rust (for Stylus contracts)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install cargo-stylus
cargo install --force cargo-stylus
```

### 2. Get Arbitrum Sepolia ETH
- Faucet: https://faucet.quicknode.com/arbitrum/sepolia
- Or: https://www.alchemy.com/faucets/arbitrum-sepolia
- Need ~0.1 ETH for deployment

### 3. Setup Environment Variables
Create `.env` in `contracts/` folder:
```bash
PRIVATE_KEY=your_private_key_here
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=your_arbiscan_api_key_here
```

---

## 🔧 Step 1: Deploy Stylus Rust Verifier

### Build the Rust Contract
```bash
cd contracts/lib/verifier

# Check if contract is valid
cargo stylus check

# Build for WASM
cargo build --release --target wasm32-unknown-unknown

# Deploy to Arbitrum Sepolia
cargo stylus deploy \
  --private-key=$PRIVATE_KEY \
  --endpoint=https://sepolia-rollup.arbitrum.io/rpc
```

**Expected Output:**
```
✅ Deployed Stylus contract at: 0x...
Gas used: ~500k
```

**Save this address!** You'll need it for the next step.

---

## 🔧 Step 2: Deploy Solidity Contracts

### Update Deploy Script
Edit `contracts/script/Deploy.s.sol`:
```solidity
// Replace this line:
address stylusVerifier = address(0x1234567890123456789012345678901234567890);

// With your deployed Stylus address:
address stylusVerifier = address(0xYOUR_STYLUS_ADDRESS_HERE);
```

### Deploy Contracts
```bash
cd contracts

# Install dependencies
forge install

# Deploy to Arbitrum Sepolia
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $ARBITRUM_SEPOLIA_RPC \
  --broadcast \
  --verify \
  --etherscan-api-key $ARBISCAN_API_KEY
```

**Expected Output:**
```
✅ ZKVerifier deployed at: 0x...
✅ ComplianceRegistry deployed at: 0x...
✅ MockBUIDL deployed at: 0x...
```

---

## 🔧 Step 3: Update Frontend Configuration

### Update Contract Addresses
Edit `lib/contracts.ts`:
```typescript
export const CONTRACTS = {
  ZK_VERIFIER: "0xYOUR_ZKVERIFIER_ADDRESS" as const,
  COMPLIANCE_REGISTRY: "0xYOUR_REGISTRY_ADDRESS" as const,
  MOCK_BUIDL: "0xYOUR_BUIDL_ADDRESS" as const,
  PASSKEY_VERIFIER: "0x0000000000000000000000000000000000000100" as const, // RIP-7212
} as const;
```

### Add Contract ABIs
Create `lib/abis.ts` with the contract ABIs:
```typescript
export const ZK_VERIFIER_ABI = [
  "function verifyProof(bytes calldata proof, string calldata attributeType) external returns (bool)",
  "function isCompliant(address user, string calldata attributeType) external view returns (bool)",
  // ... add other functions
];

export const COMPLIANCE_REGISTRY_ABI = [
  "function isCompliant(address user, string calldata attributeType) external view returns (bool)",
  "function getRecord(address user, string calldata attributeType) external view returns (tuple)",
  // ... add other functions
];

export const MOCK_BUIDL_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function isCompliant(address user) external view returns (bool)",
  // ... add other functions
];
```

---

## 🔧 Step 4: Integrate Real Contract Calls

### Update Compliance Dashboard
Edit `app/(app)/compliance/_components/compliance-stats.tsx`:

```typescript
"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { COMPLIANCE_REGISTRY_ABI } from "@/lib/abis";

export function ComplianceStats() {
  const { address } = useAccount();

  // Real contract call - get verified attributes count
  const { data: creditScoreVerified } = useReadContract({
    address: CONTRACTS.COMPLIANCE_REGISTRY,
    abi: COMPLIANCE_REGISTRY_ABI,
    functionName: "isCompliant",
    args: [address, "credit_score"],
  });

  const { data: accreditedVerified } = useReadContract({
    address: CONTRACTS.COMPLIANCE_REGISTRY,
    abi: COMPLIANCE_REGISTRY_ABI,
    functionName: "isCompliant",
    args: [address, "accredited_investor"],
  });

  const { data: kycVerified } = useReadContract({
    address: CONTRACTS.COMPLIANCE_REGISTRY,
    abi: COMPLIANCE_REGISTRY_ABI,
    functionName: "isCompliant",
    args: [address, "kyc_verified"],
  });

  const verifiedCount = [creditScoreVerified, accreditedVerified, kycVerified]
    .filter(Boolean).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Verified Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{verifiedCount}</div>
        </CardContent>
      </Card>
      {/* Add more real stats */}
    </div>
  );
}
```

### Update Verification Flow
The verification flow already uses real implementations:
- ✅ `passkey-auth-step.tsx` - Real WebAuthn
- ✅ `generate-proof-step.tsx` - Real snarkjs
- ✅ `verify-proof-step.tsx` - Real wagmi contract calls

Just need to ensure contract addresses are updated!

---

## 🔧 Step 5: Add Real BUIDL Token Integration

### Create BUIDL Balance Component
Create `components/buidl-balance.tsx`:
```typescript
"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { MOCK_BUIDL_ABI } from "@/lib/abis";
import { formatUnits } from "viem";

export function BUIDLBalance() {
  const { address } = useAccount();

  const { data: balance } = useReadContract({
    address: CONTRACTS.MOCK_BUIDL,
    abi: MOCK_BUIDL_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: isCompliant } = useReadContract({
    address: CONTRACTS.MOCK_BUIDL,
    abi: MOCK_BUIDL_ABI,
    functionName: "isCompliant",
    args: [address],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mock BUIDL Balance</CardTitle>
        <CardDescription>
          {isCompliant ? "✅ Compliant" : "❌ Not Compliant"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {balance ? formatUnits(balance, 18) : "0"} mBUIDL
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🧪 Step 6: Testing Flow

### Complete User Journey (REAL DATA):

1. **Connect Wallet**
   - User connects MetaMask to Arbitrum Sepolia
   - Frontend reads real wallet address

2. **Passkey Authentication**
   - User authenticates with FaceID/TouchID
   - Real WebAuthn API generates credential
   - RIP-7212 precompile verifies (real on-chain call)

3. **Generate ZK Proof**
   - User selects attribute (e.g., "Credit Score > 700")
   - Real snarkjs generates Groth16 proof
   - Proof structure: pi_a, pi_b, pi_c, public signals

4. **Submit Proof On-Chain**
   - Frontend calls `ZKVerifier.verifyProof()`
   - Stylus Rust contract verifies proof (~200k gas)
   - Transaction confirmed on Arbitrum Sepolia
   - View on Arbiscan: https://sepolia.arbiscan.io/tx/0x...

5. **Check Compliance**
   - Frontend reads `ComplianceRegistry.isCompliant()`
   - Real on-chain data shows verified attributes
   - User can now interact with MockBUIDL token

6. **Transfer BUIDL Token**
   - User tries to transfer MockBUIDL
   - Contract checks compliance on-chain
   - Transfer succeeds if compliant, reverts if not

---

## 📊 Real Data Dashboard

### Metrics to Display (All Real):
- ✅ Total verifications (from contract)
- ✅ Gas used per verification (from transaction receipt)
- ✅ User's verified attributes (from ComplianceRegistry)
- ✅ BUIDL token balance (from MockBUIDL)
- ✅ Compliance status (from on-chain check)
- ✅ Transaction history (from Arbiscan API)

---

## 🎯 Success Criteria

### All Data Must Be Real:
- [ ] Smart contracts deployed to Arbitrum Sepolia
- [ ] Contract addresses updated in frontend
- [ ] Real WebAuthn passkey authentication working
- [ ] Real ZK proof generation with snarkjs
- [ ] Real on-chain proof verification
- [ ] Real compliance checks from registry
- [ ] Real BUIDL token transfers with compliance gates
- [ ] Real transaction receipts and gas tracking
- [ ] Real Arbiscan links for all transactions

### No Mock/Fake Data:
- ❌ No hardcoded addresses
- ❌ No simulated transactions
- ❌ No fake balances
- ❌ No mock compliance status
- ✅ Everything reads from blockchain
- ✅ Everything writes to blockchain
- ✅ Everything verifiable on Arbiscan

---

## 🚀 Deployment Commands Summary

```bash
# 1. Deploy Stylus Rust Verifier
cd contracts/lib/verifier
cargo stylus deploy --private-key=$PRIVATE_KEY

# 2. Update Deploy.s.sol with Stylus address

# 3. Deploy Solidity Contracts
cd contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $ARBITRUM_SEPOLIA_RPC \
  --broadcast \
  --verify

# 4. Update frontend/lib/contracts.ts with addresses

# 5. Test frontend
npm run dev
```

---

## 📝 Post-Deployment Checklist

- [ ] All contracts deployed and verified on Arbiscan
- [ ] Frontend updated with real contract addresses
- [ ] ABIs exported and imported in frontend
- [ ] Test wallet connection
- [ ] Test passkey authentication
- [ ] Test proof generation
- [ ] Test proof verification on-chain
- [ ] Test compliance checks
- [ ] Test BUIDL token transfers
- [ ] Document all contract addresses
- [ ] Create demo video showing real transactions

---

## 🎬 Demo Script (All Real)

1. Show Arbiscan with deployed contracts
2. Connect wallet on frontend
3. Authenticate with FaceID (real WebAuthn)
4. Generate ZK proof (real snarkjs)
5. Submit to blockchain (show pending tx)
6. Transaction confirms (show Arbiscan link)
7. Compliance dashboard updates (real on-chain data)
8. Transfer BUIDL token (show compliance check)
9. Show gas benchmarks (real from tx receipts)

**Everything is verifiable on-chain!** 🚀

---

## 🏆 This Makes ArbShield World's Best

- ✅ Real Stylus Rust verifier (10x gas savings)
- ✅ Real WebAuthn with RIP-7212 (99% gas savings)
- ✅ Real ZK proofs with snarkjs
- ✅ Real on-chain compliance registry
- ✅ Real RWA token with compliance gates
- ✅ All transactions verifiable on Arbiscan
- ✅ No fake data, no simulations
- ✅ Production-ready architecture

**Ready to deploy and win! 🏆**

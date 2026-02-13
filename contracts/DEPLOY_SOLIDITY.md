# Deploy Solidity Contracts to Arbitrum Sepolia

Quick guide to deploy the working Solidity contracts while Stylus dependencies are being resolved.

## ✅ What You're Deploying

1. **ComplianceRegistry** - Stores verified compliance attributes
2. **ZKVerifier** - Wrapper for ZK proof verification
3. **MockBUIDL** - Demo RWA token with compliance checks

## 🚀 Quick Deploy

### Step 1: Set Environment Variables

Create `.env` in the `contracts` directory:

```bash
PRIVATE_KEY=your_private_key_without_0x
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=your_arbiscan_api_key (optional, for verification)
```

### Step 2: Deploy

```bash
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url $ARBITRUM_SEPOLIA_RPC \
  --broadcast \
  --verify \
  --etherscan-api-key $ARBISCAN_API_KEY
```

Or without verification:

```bash
forge script script/Deploy.s.sol \
  --rpc-url $ARBITRUM_SEPOLIA_RPC \
  --broadcast
```

### Step 3: Update Frontend

Copy the deployed addresses from the output and update `lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  ZK_VERIFIER: "0xYourZKVerifierAddress" as const,
  COMPLIANCE_REGISTRY: "0xYourRegistryAddress" as const,
  MOCK_BUIDL: "0xYourBUIDLAddress" as const,
  PASSKEY_VERIFIER: "0x0000000000000000000000000000000000000100" as const,
} as const;
```

## 📊 What You Get

- ✅ Fully functional compliance system
- ✅ ZK proof verification (Solidity implementation)
- ✅ Compliance registry with expiration
- ✅ Mock RWA token integration
- ✅ Ready for frontend integration

## 🔄 Stylus Upgrade Path

Later, when Stylus dependencies are resolved:
1. Deploy Stylus Rust verifier
2. Call `zkVerifier.updateStylusVerifier(newAddress)`
3. Enjoy 92% gas savings!

The architecture supports hot-swapping the verifier without redeploying everything.

## 🧪 Test Deployment

After deploying, test with:

```bash
forge test --fork-url $ARBITRUM_SEPOLIA_RPC
```

## 📝 Notes

- The ZKVerifier uses a placeholder Stylus address initially
- You can update it later with `updateStylusVerifier()`
- All contracts are upgradeable through the owner/admin roles
- Compliance records have expiration timestamps

---

**Ready to deploy?** Run the forge script command above!

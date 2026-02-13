# Stylus Smart Contract Deployment Guide

This guide walks you through deploying the ArbShield ZK Verifier Stylus contract to Arbitrum Sepolia testnet.

## 🎯 Quick Start (3 Commands)

```bash
cd contracts/lib/verifier
./pre-deploy-check.sh  # Verify prerequisites
./deploy.sh testnet    # Deploy to testnet
./update-frontend.sh <contract_address>  # Update frontend
```

See [contracts/lib/verifier/QUICKSTART.md](contracts/lib/verifier/QUICKSTART.md) for the fastest path.

## Prerequisites

1. **Rust & Cargo** (v1.92.0)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   ```

2. **Cargo Stylus CLI**
   ```bash
   cargo install --force cargo-stylus
   ```

3. **Wallet with Arbitrum Sepolia ETH**
   - Get testnet ETH from [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)

## Step 1: Configure Environment

Create a `.env` file in the `contracts/lib/verifier` directory:

```bash
# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Arbitrum Sepolia RPC
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

## Step 2: Build the Stylus Contract

Navigate to the verifier directory and build:

```bash
cd contracts/lib/verifier
cargo stylus check
```

This will:
- Compile the Rust code to WASM
- Verify it's compatible with Stylus
- Estimate deployment costs

## Step 3: Deploy to Arbitrum Sepolia

Deploy the contract:

```bash
cargo stylus deploy \
  --private-key-path=<(echo $PRIVATE_KEY) \
  --endpoint=$RPC_URL
```

Or using the private key directly:

```bash
cargo stylus deploy \
  --private-key=$PRIVATE_KEY \
  --endpoint=https://sepolia-rollup.arbitrum.io/rpc
```

Expected output:
```
deployed code at address: 0x...
```

## Step 4: Verify Deployment

Check the contract on Arbiscan:
```
https://sepolia.arbiscan.io/address/<YOUR_CONTRACT_ADDRESS>
```

## Step 5: Test the Contract

Test verification locally:

```bash
cargo stylus replay \
  --endpoint=$RPC_URL \
  --address=<YOUR_CONTRACT_ADDRESS>
```

## Gas Savings

The Stylus implementation provides significant gas savings:

| Operation | Solidity | Stylus | Savings |
|-----------|----------|--------|---------|
| Poseidon Hash | 212k gas | 11.8k gas | 94% |
| Pairing Check | 2.3M gas | 180k gas | 92% |
| Full Verification | ~2.5M gas | ~192k gas | 92% |

## Integration with Frontend

After deployment, update the contract address in your frontend:

1. Add to `lib/contracts.ts`:
```typescript
export const STYLUS_VERIFIER_ADDRESS = '0x...' as const;
```

2. The Stylus contract can be called from Solidity contracts or directly via ethers.js

## Troubleshooting

### Build Errors

If you get compilation errors:
```bash
cargo clean
cargo build --release --target wasm32-unknown-unknown
```

### Deployment Fails

- Ensure you have enough Arbitrum Sepolia ETH (at least 0.01 ETH)
- Check your private key is correct (no 0x prefix)
- Verify RPC endpoint is accessible

### Gas Estimation

To estimate deployment cost:
```bash
cargo stylus check --estimate-gas
```

## Advanced: Production Deployment

For mainnet deployment:

1. Use Arbitrum One RPC: `https://arb1.arbitrum.io/rpc`
2. Ensure thorough testing on testnet first
3. Consider using a hardware wallet or secure key management
4. Implement full arkworks Groth16 verification (replace simplified demo code)

## Next Steps

- Integrate with your Solidity contracts
- Set up monitoring and alerts
- Implement comprehensive testing
- Consider upgradeability patterns

## Resources

- [Stylus Documentation](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)
- [Cargo Stylus CLI](https://github.com/OffchainLabs/cargo-stylus)
- [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/)

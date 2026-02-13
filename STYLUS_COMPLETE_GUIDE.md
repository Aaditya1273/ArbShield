# Complete Stylus Deployment Guide

Complete guide for deploying and integrating the ArbShield ZK Verifier Stylus contract.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Deployment](#quick-deployment)
4. [Manual Deployment](#manual-deployment)
5. [Testing](#testing)
6. [Frontend Integration](#frontend-integration)
7. [Troubleshooting](#troubleshooting)

## Overview

The ArbShield ZK Verifier is a Rust-based smart contract compiled to WASM and deployed on Arbitrum using Stylus. It provides 92% gas savings compared to Solidity implementations.

**Key Benefits:**
- 92% lower gas costs for ZK proof verification
- Poseidon hashing: 11.8k gas (vs 212k in Solidity)
- Pairing checks: 180k gas (vs 2.3M in Solidity)

## Prerequisites

### 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown
```

Verify installation:
```bash
rustc --version  # Should show 1.92.0 or higher
```

### 2. Install Cargo Stylus

```bash
cargo install --force cargo-stylus
```

Verify installation:
```bash
cargo stylus --version
```

### 3. Get Testnet ETH

You need Arbitrum Sepolia ETH for deployment:
- Faucet: https://faucet.quicknode.com/arbitrum/sepolia
- Minimum: 0.01 ETH (recommended: 0.05 ETH)

### 4. Prepare Your Wallet

Export your private key from MetaMask or your wallet:
1. Open MetaMask
2. Click account menu → Account details → Show private key
3. Copy the private key (without 0x prefix)

## Quick Deployment

### Step 1: Navigate to Verifier Directory

```bash
cd contracts/lib/verifier
```

### Step 2: Configure Environment

```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

Add your private key:
```bash
PRIVATE_KEY=your_private_key_without_0x_prefix
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

### Step 3: Run Pre-Deployment Check

```bash
./pre-deploy-check.sh
```

This verifies:
- ✓ Rust installation
- ✓ WASM target
- ✓ Cargo Stylus
- ✓ Environment configuration
- ✓ Contract builds
- ✓ Stylus compatibility

### Step 4: Deploy

```bash
./deploy.sh testnet
```

Expected output:
```
🚀 ArbShield Stylus Verifier Deployment
==========================================
Deploying to Arbitrum Sepolia testnet

Building contract...
Checking Stylus compatibility...
Estimating deployment cost...
Deploying contract...

✅ Deployment successful!
==========================================
Contract Address: 0x1234...5678

View on Explorer:
https://sepolia.arbiscan.io/address/0x1234...5678
```

### Step 5: Update Frontend

```bash
./update-frontend.sh 0x1234...5678
```

This updates `lib/contracts.ts` with your new contract address.

## Manual Deployment

If you prefer manual control:

### 1. Build the Contract

```bash
cd contracts/lib/verifier
cargo build --release --target wasm32-unknown-unknown
```

### 2. Check Stylus Compatibility

```bash
cargo stylus check --endpoint=https://sepolia-rollup.arbitrum.io/rpc
```

### 3. Estimate Gas

```bash
cargo stylus check --estimate-gas --endpoint=https://sepolia-rollup.arbitrum.io/rpc
```

### 4. Deploy

```bash
cargo stylus deploy \
  --private-key=$PRIVATE_KEY \
  --endpoint=https://sepolia-rollup.arbitrum.io/rpc
```

### 5. Save Contract Address

Copy the deployed contract address from the output:
```
deployed code at address: 0x...
```

## Testing

### Automated Testing

```bash
./test-deployment.sh 0xYourContractAddress
```

### Manual Testing

```bash
cargo stylus replay \
  --endpoint=https://sepolia-rollup.arbitrum.io/rpc \
  --address=0xYourContractAddress
```

### Verify on Explorer

Visit: `https://sepolia.arbiscan.io/address/0xYourContractAddress`

You should see:
- Contract bytecode
- Transaction history
- Contract creation transaction

## Frontend Integration

### 1. Update Contract Address

Edit `lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  ZK_VERIFIER: "0xYourNewAddress" as const,
  // ... other contracts
};
```

Or use the automated script:
```bash
cd contracts/lib/verifier
./update-frontend.sh 0xYourNewAddress
```

### 2. Test Integration

Start your development server:
```bash
npm run dev
```

Navigate to the verification page and test:
1. Connect wallet
2. Generate a proof
3. Submit for verification
4. Check transaction on Arbiscan

### 3. Monitor Gas Usage

Compare gas costs:
- Check transaction on Arbiscan
- Look for "Gas Used" field
- Should be ~192k gas for verification

## Troubleshooting

### Build Errors

**Error: "cannot find crate for `std`"**
```bash
rustup target add wasm32-unknown-unknown
```

**Error: "linker error"**
```bash
cargo clean
cargo build --release --target wasm32-unknown-unknown
```

### Deployment Errors

**Error: "insufficient funds"**
- Get more testnet ETH from faucet
- Check your wallet balance on Arbiscan

**Error: "invalid private key"**
- Ensure no 0x prefix in .env file
- Check for extra spaces or newlines

**Error: "RPC endpoint unreachable"**
```bash
# Try alternative RPC
RPC_URL=https://arbitrum-sepolia.blockpi.network/v1/rpc/public
```

### Verification Errors

**Contract not showing on Arbiscan**
- Wait 1-2 minutes for indexing
- Check transaction hash on Arbiscan
- Verify you're on correct network (Sepolia)

**Gas estimation too high**
- This is normal for first deployment
- Actual gas usage will be lower
- Check similar transactions on Arbiscan

### Integration Errors

**Frontend can't find contract**
- Verify contract address in lib/contracts.ts
- Check network ID matches (421614 for Sepolia)
- Ensure wallet is connected to Arbitrum Sepolia

**Transaction fails**
- Check contract is initialized
- Verify proof format is correct
- Check gas limit is sufficient (300k recommended)

## Advanced Topics

### Mainnet Deployment

⚠️ **Only deploy to mainnet after thorough testing!**

```bash
./deploy.sh mainnet
```

Or manually:
```bash
cargo stylus deploy \
  --private-key=$PRIVATE_KEY \
  --endpoint=https://arb1.arbitrum.io/rpc
```

### Production Considerations

Before mainnet deployment:

1. **Security Audit**
   - Full code review
   - Third-party audit
   - Bug bounty program

2. **Testing**
   - Comprehensive unit tests
   - Integration tests
   - Testnet stress testing

3. **Monitoring**
   - Set up alerts for contract calls
   - Monitor gas usage
   - Track verification success rate

4. **Upgradeability**
   - Consider proxy pattern
   - Plan for emergency pause
   - Document upgrade process

### Gas Optimization

Current implementation is already optimized, but for production:

1. **Batch Verification**
   - Verify multiple proofs in one transaction
   - Amortize fixed costs

2. **Proof Compression**
   - Use compressed proof format
   - Reduce calldata costs

3. **Caching**
   - Cache verification keys
   - Reuse computation results

## Resources

### Documentation
- [Stylus Documentation](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)
- [Cargo Stylus CLI](https://github.com/OffchainLabs/cargo-stylus)
- [Arkworks Libraries](https://github.com/arkworks-rs)

### Tools
- [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
- [Arbiscan Sepolia](https://sepolia.arbiscan.io/)
- [Arbitrum Discord](https://discord.gg/arbitrum)

### Support
- GitHub Issues: [Your repo issues]
- Discord: [Your Discord]
- Email: [Your email]

## Next Steps

After successful deployment:

1. ✅ Test verification flow end-to-end
2. ✅ Monitor gas costs and performance
3. ✅ Integrate with compliance registry
4. ✅ Set up monitoring and alerts
5. ✅ Document API for other developers
6. ✅ Plan for mainnet deployment

## Appendix

### File Structure

```
contracts/lib/verifier/
├── src/
│   └── lib.rs              # Main Stylus contract
├── Cargo.toml              # Rust dependencies
├── rust-toolchain.toml     # Rust version config
├── .env.example            # Environment template
├── deploy.sh               # Deployment script
├── test-deployment.sh      # Testing script
├── update-frontend.sh      # Frontend update script
├── pre-deploy-check.sh     # Pre-deployment checks
├── QUICKSTART.md           # Quick start guide
└── README.md               # Detailed documentation
```

### Environment Variables

```bash
# Required
PRIVATE_KEY=              # Your wallet private key (no 0x)
RPC_URL=                  # Arbitrum RPC endpoint

# Optional
ARBISCAN_API_KEY=         # For contract verification
GAS_PRICE=                # Override gas price
```

### Common Commands

```bash
# Build
cargo build --release --target wasm32-unknown-unknown

# Check compatibility
cargo stylus check

# Estimate gas
cargo stylus check --estimate-gas

# Deploy
cargo stylus deploy --private-key=$PRIVATE_KEY --endpoint=$RPC_URL

# Test
cargo stylus replay --endpoint=$RPC_URL --address=$CONTRACT_ADDRESS

# Clean build
cargo clean
```

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.

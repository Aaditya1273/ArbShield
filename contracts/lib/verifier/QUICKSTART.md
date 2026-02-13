# Stylus Verifier - Quick Start

Deploy your ZK verifier to Arbitrum in 3 steps!

## 1️⃣ Install Dependencies

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install Cargo Stylus
cargo install --force cargo-stylus
```

## 2️⃣ Configure

Create `.env` file in this directory:

```bash
PRIVATE_KEY=your_private_key_without_0x_prefix
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

Get testnet ETH: https://faucet.quicknode.com/arbitrum/sepolia

## 3️⃣ Deploy

```bash
./deploy.sh testnet
```

That's it! 🎉

## Test Your Deployment

```bash
./test-deployment.sh <your_contract_address>
```

## Manual Deployment

If you prefer manual steps:

```bash
# Check compatibility
cargo stylus check

# Deploy
cargo stylus deploy \
  --private-key=$PRIVATE_KEY \
  --endpoint=https://sepolia-rollup.arbitrum.io/rpc
```

## Troubleshooting

**"cargo-stylus not found"**
```bash
cargo install --force cargo-stylus
```

**"insufficient funds"**
- Get more testnet ETH from the faucet
- Need at least 0.01 ETH for deployment

**Build errors**
```bash
cargo clean
cargo build --release --target wasm32-unknown-unknown
```

## Next Steps

1. Copy the deployed contract address
2. Update `lib/contracts.ts` in the frontend
3. Test integration with your dApp

## Resources

- [Full Deployment Guide](../../../STYLUS_DEPLOYMENT_GUIDE.md)
- [Stylus Docs](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)
- [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/)

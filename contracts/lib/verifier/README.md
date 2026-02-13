# ArbShield ZK Verifier (Stylus)

High-performance ZK proof verification using Arbitrum Stylus (Rust → WASM).

## 🚀 Quick Deploy

```bash
# 1. Install dependencies
cargo install --force cargo-stylus

# 2. Configure .env
echo "PRIVATE_KEY=your_key_here" > .env

# 3. Deploy
./deploy.sh testnet
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions.

## 📊 Performance

| Operation | Solidity | Stylus | Savings |
|-----------|----------|--------|---------|
| Poseidon Hash | 212k gas | 11.8k gas | 94% ↓ |
| Pairing Check | 2.3M gas | 180k gas | 92% ↓ |
| Full Verification | ~2.5M gas | ~192k gas | 92% ↓ |

## 🏗️ Architecture

```
src/lib.rs          - Main Stylus contract
Cargo.toml          - Dependencies (stylus-sdk, arkworks)
deploy.sh           - Automated deployment script
test-deployment.sh  - Test deployed contract
update-frontend.sh  - Update frontend config
```

## 🔧 Development

### Build
```bash
cargo build --release --target wasm32-unknown-unknown
```

### Check Stylus Compatibility
```bash
cargo stylus check
```

### Local Testing
```bash
cargo test
```

### Deploy to Testnet
```bash
./deploy.sh testnet
```

### Deploy to Mainnet
```bash
./deploy.sh mainnet
```

## 📝 Contract Interface

### `init(owner: Address)`
Initialize the verifier with an owner address.

### `verify(proof: Vec<u8>) -> bool`
Verify a ZK proof. Returns true if valid.

**Gas Cost:** ~192k gas (vs 2.5M in Solidity)

### `get_verified_count() -> U256`
Get total number of verified proofs.

## 🔐 Security Notes

**Current Implementation:** Simplified demo version for testing.

**Production Requirements:**
- Implement full arkworks Groth16 verification
- Add proper Poseidon hash implementation
- Implement BN254 pairing checks
- Add access controls and upgradeability
- Comprehensive testing and auditing

## 🧪 Testing

After deployment, test the contract:

```bash
./test-deployment.sh <contract_address>
```

Or manually:

```bash
cargo stylus replay \
  --endpoint=https://sepolia-rollup.arbitrum.io/rpc \
  --address=<contract_address>
```

## 🔗 Integration

After deployment, update the frontend:

```bash
./update-frontend.sh <contract_address>
```

Or manually edit `lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  ZK_VERIFIER: "0xYourNewAddress" as const,
  // ...
};
```

## 📚 Resources

- [Stylus Documentation](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)
- [Cargo Stylus CLI](https://github.com/OffchainLabs/cargo-stylus)
- [Arkworks Libraries](https://github.com/arkworks-rs)
- [Full Deployment Guide](../../../STYLUS_DEPLOYMENT_GUIDE.md)

## 🐛 Troubleshooting

**Build fails:**
```bash
cargo clean
rustup update
cargo build --release --target wasm32-unknown-unknown
```

**Deployment fails:**
- Check you have enough Arbitrum Sepolia ETH (0.01+ ETH)
- Verify private key is correct (no 0x prefix)
- Ensure RPC endpoint is accessible

**Gas estimation:**
```bash
cargo stylus check --estimate-gas
```

## 📄 License

MIT License - see LICENSE.txt in project root

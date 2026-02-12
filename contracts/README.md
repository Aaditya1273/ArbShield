# ArbShield Smart Contracts

Privacy-preserving compliance verification contracts built with Stylus Rust for Arbitrum.

## 📦 Contracts Overview

| Contract | Type | Purpose |
|----------|------|---------|
| `ZKVerifier.sol` | Solidity | Wrapper for Stylus Rust verifier |
| `ComplianceRegistry.sol` | Solidity | Stores verified compliance attributes |
| `MockBUIDL.sol` | Solidity | Mock RWA token for demo |
| `verifier/` | Stylus Rust | ZK proof verification (arkworks) |

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ZKVerifier.sol │ ◄─── Solidity wrapper
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Stylus Rust     │ ◄─── WASM verifier
│ (arkworks)      │      ~200k gas
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Rust + cargo
- cargo-stylus
- Foundry

### Install Dependencies

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install cargo-stylus
cargo install --force cargo-stylus

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Build Contracts

```bash
# Build Solidity contracts
forge build

# Build Stylus Rust verifier
cd lib/verifier
cargo build --release --target wasm32-unknown-unknown
cargo stylus check
```

### Deploy

```bash
# Deploy to Arbitrum Sepolia
forge script script/Deploy.s.sol:DeployScript --rpc-url $ARBITRUM_SEPOLIA_RPC --broadcast
```

## 📊 Gas Benchmarks

| Operation | Solidity | Stylus Rust | Savings |
|-----------|----------|-------------|---------|
| Poseidon Hash | 212,000 | 11,800 | 94% |
| ZK Verification | 2,500,000 | 198,543 | 92% |
| Passkey Verify (RIP-7212) | 100,000 | 980 | 99% |

## 🔐 Security

- OpenZeppelin contracts for Solidity
- arkworks for ZK proofs
- RIP-7212 precompile for passkeys
- Stylus Cache Manager for repeat verifications

## 📝 License

MIT

#!/bin/bash
# deploy.sh - Deploy Stylus Groth16 Verifier to Arbitrum Sepolia

set -e

echo "🚀 Deploying Stylus Groth16 Verifier..."
echo ""

# Check prerequisites
if ! command -v cargo &> /dev/null; then
    echo "❌ cargo not found. Install Rust: https://rustup.rs/"
    exit 1
fi

if ! command -v cargo-stylus &> /dev/null; then
    echo "❌ cargo-stylus not found. Install: cargo install cargo-stylus"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY environment variable not set"
    echo "   Export your private key: export PRIVATE_KEY=0x..."
    exit 1
fi

# Build optimized WASM
echo "📦 Building optimized WASM..."
cargo build --release --target wasm32-unknown-unknown

WASM_FILE="target/wasm32-unknown-unknown/release/arbshield_verifier.wasm"

if [ ! -f "$WASM_FILE" ]; then
    echo "❌ WASM file not found: $WASM_FILE"
    exit 1
fi

# Check size
echo ""
echo "📊 WASM file size:"
ls -lh "$WASM_FILE"

# Optimize with wasm-opt (if available)
if command -v wasm-opt &> /dev/null; then
    echo ""
    echo "⚡ Optimizing with wasm-opt..."
    wasm-opt "$WASM_FILE" -O3 -o optimized.wasm
    echo "📊 Optimized size:"
    ls -lh optimized.wasm
    WASM_FILE="optimized.wasm"
fi

# Check contract
echo ""
echo "🔍 Checking contract..."
cargo stylus check --wasm-file="$WASM_FILE" --endpoint https://sepolia-rollup.arbitrum.io/rpc

# Deploy to Arbitrum Sepolia
echo ""
echo "🚀 Deploying to Arbitrum Sepolia..."
cargo stylus deploy \
    --private-key "$PRIVATE_KEY" \
    --wasm-file="$WASM_FILE" \
    --endpoint https://sepolia-rollup.arbitrum.io/rpc

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Copy the contract address"
echo "  2. Update .env.local: NEXT_PUBLIC_ZK_VERIFIER=0x..."
echo "  3. Update lib/contracts.ts"
echo "  4. Test verification flow"

#!/bin/bash
# deploy_production.sh - Production-grade deployment with safety checks

set -e

echo "🔒 PRODUCTION DEPLOYMENT - Stylus Groth16 Verifier"
echo "=================================================="
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
    exit 1
fi

# Check VK hash matches
echo "🔍 Checking VK hash..."
VK_HASH_IN_CODE=$(grep 'pub const VK_HASH' src/lib.rs | cut -d'"' -f2)
VK_HASH_FROM_JSON=$(node -e "
const crypto = require('crypto');
const fs = require('fs');
const vk = JSON.parse(fs.readFileSync('../../../circuits/build/verification_key.json', 'utf8'));
console.log(crypto.createHash('sha256').update(JSON.stringify(vk)).digest('hex'));
")

if [ "$VK_HASH_IN_CODE" != "$VK_HASH_FROM_JSON" ]; then
    echo "❌ VK HASH MISMATCH!"
    echo "   Code:  $VK_HASH_IN_CODE"
    echo "   JSON:  $VK_HASH_FROM_JSON"
    echo ""
    echo "   Run: cd ../../../circuits && node extract_vk.js > vk_output.txt"
    echo "   Then update src/lib.rs with the new VK constants"
    exit 1
fi

echo "✅ VK hash matches: $VK_HASH_IN_CODE"
echo ""

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
else
    echo "⚠️  wasm-opt not found. Install for better optimization:"
    echo "   npm install -g wasm-opt"
fi

# Check contract
echo ""
echo "🔍 Checking contract..."
cargo stylus check --wasm-file="$WASM_FILE" --endpoint https://sepolia-rollup.arbitrum.io/rpc

# Confirm deployment
echo ""
echo "⚠️  READY TO DEPLOY TO ARBITRUM SEPOLIA"
echo ""
echo "VK Hash: $VK_HASH_IN_CODE"
echo "WASM Size: $(ls -lh $WASM_FILE | awk '{print $5}')"
echo ""
read -p "Continue with deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy to Arbitrum Sepolia
echo ""
echo "🚀 Deploying to Arbitrum Sepolia..."
DEPLOY_OUTPUT=$(cargo stylus deploy \
    --private-key "$PRIVATE_KEY" \
    --wasm-file="$WASM_FILE" \
    --endpoint https://sepolia-rollup.arbitrum.io/rpc 2>&1)

echo "$DEPLOY_OUTPUT"

# Extract contract address
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oP '0x[a-fA-F0-9]{40}' | head -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Could not extract contract address"
    exit 1
fi

echo ""
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "=================================================="
echo ""
echo "Contract Address: $CONTRACT_ADDRESS"
echo "VK Hash: $VK_HASH_IN_CODE"
echo "Network: Arbitrum Sepolia"
echo "Explorer: https://sepolia.arbiscan.io/address/$CONTRACT_ADDRESS"
echo ""
echo "📝 Next steps:"
echo "  1. Update .env.local:"
echo "     NEXT_PUBLIC_ZK_VERIFIER=$CONTRACT_ADDRESS"
echo ""
echo "  2. Update lib/contracts.ts:"
echo "     ZK_VERIFIER: \"$CONTRACT_ADDRESS\""
echo ""
echo "  3. Test with real proof:"
echo "     cd ../../../circuits"
echo "     export CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
echo "     node test_real_proof.js"
echo ""
echo "=================================================="

# Save deployment info
cat > deployment_info.json <<EOF
{
  "contractAddress": "$CONTRACT_ADDRESS",
  "vkHash": "$VK_HASH_IN_CODE",
  "network": "Arbitrum Sepolia",
  "chainId": 421614,
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "wasmSize": "$(ls -lh $WASM_FILE | awk '{print $5}')"
}
EOF

echo "💾 Deployment info saved to deployment_info.json"

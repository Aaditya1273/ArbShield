#!/bin/bash

# ArbShield Stylus Verifier Deployment Script
# Usage: ./deploy.sh [testnet|mainnet]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to testnet
NETWORK=${1:-testnet}

echo -e "${GREEN}🚀 ArbShield Stylus Verifier Deployment${NC}"
echo "=========================================="

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command -v cargo &> /dev/null; then
    echo -e "${RED}❌ Cargo not found. Please install Rust.${NC}"
    exit 1
fi

REQUIRED_CARGO_STYLUS_VERSION="0.4.2"
REQUIRED_CARGO_STYLUS_CHECK_VERSION="0.4.2"
if ! command -v cargo-stylus &> /dev/null; then
    echo -e "${RED}❌ cargo-stylus not found. Installing...${NC}"
    cargo install --force --locked cargo-stylus --version $REQUIRED_CARGO_STYLUS_VERSION
else
    INSTALLED_CARGO_STYLUS_VERSION=$(cargo stylus --version | awk '{print $2}')
    if [ "$INSTALLED_CARGO_STYLUS_VERSION" != "$REQUIRED_CARGO_STYLUS_VERSION" ]; then
        echo -e "${YELLOW}⚠️  cargo-stylus $INSTALLED_CARGO_STYLUS_VERSION found; downgrading to $REQUIRED_CARGO_STYLUS_VERSION...${NC}"
        cargo install --force --locked cargo-stylus --version $REQUIRED_CARGO_STYLUS_VERSION
    fi
fi

if ! command -v cargo-stylus-check &> /dev/null; then
    echo -e "${YELLOW}⚠️  cargo-stylus-check not found. Installing...${NC}"
    cargo install --force --locked cargo-stylus-check --version $REQUIRED_CARGO_STYLUS_CHECK_VERSION
else
    INSTALLED_CARGO_STYLUS_CHECK_VERSION=$(cargo stylus-check --version | awk '{print $2}')
    if [ "$INSTALLED_CARGO_STYLUS_CHECK_VERSION" != "$REQUIRED_CARGO_STYLUS_CHECK_VERSION" ]; then
        echo -e "${YELLOW}⚠️  cargo-stylus-check $INSTALLED_CARGO_STYLUS_CHECK_VERSION found; downgrading to $REQUIRED_CARGO_STYLUS_CHECK_VERSION...${NC}"
        cargo install --force --locked cargo-stylus-check --version $REQUIRED_CARGO_STYLUS_CHECK_VERSION
    fi
fi

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Creating .env template..."
    cat > .env << EOF
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
EOF
    echo -e "${YELLOW}⚠️  Please edit .env with your private key${NC}"
    exit 1
fi

# Load environment variables
source .env

# Validate private key
if [ "$PRIVATE_KEY" = "your_private_key_here" ]; then
    echo -e "${RED}❌ Please set your PRIVATE_KEY in .env${NC}"
    exit 1
fi

# Set RPC based on network
if [ "$NETWORK" = "mainnet" ]; then
    RPC_URL="https://arb1.arbitrum.io/rpc"
    echo -e "${YELLOW}⚠️  Deploying to MAINNET${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
else
    RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"
    echo -e "${GREEN}Deploying to Arbitrum Sepolia testnet${NC}"
fi

# Build and check
echo -e "\n${YELLOW}Building contract...${NC}"
cargo build --release --target wasm32-unknown-unknown

echo -e "\n${YELLOW}Checking Stylus compatibility...${NC}"
cargo stylus check --endpoint=$RPC_URL

# Estimate gas
echo -e "\n${YELLOW}Estimating deployment cost...${NC}"
cargo stylus check --estimate-gas --endpoint=$RPC_URL

# Deploy
echo -e "\n${YELLOW}Deploying contract...${NC}"
DEPLOY_OUTPUT=$(cargo stylus deploy \
  --private-key=$PRIVATE_KEY \
  --endpoint=$RPC_URL 2>&1)

echo "$DEPLOY_OUTPUT"

# Extract contract address
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oP 'deployed code at address: \K0x[a-fA-F0-9]{40}' || echo "")

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Deployment successful!${NC}"
echo "=========================================="
echo -e "Contract Address: ${GREEN}$CONTRACT_ADDRESS${NC}"

# Save deployment info
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cat > "deployment_${NETWORK}_${TIMESTAMP}.json" << EOF
{
  "network": "$NETWORK",
  "contractAddress": "$CONTRACT_ADDRESS",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "rpcUrl": "$RPC_URL"
}
EOF

echo -e "\nDeployment info saved to: deployment_${NETWORK}_${TIMESTAMP}.json"

# Show explorer link
if [ "$NETWORK" = "mainnet" ]; then
    EXPLORER="https://arbiscan.io"
else
    EXPLORER="https://sepolia.arbiscan.io"
fi

echo -e "\n${GREEN}View on Explorer:${NC}"
echo "$EXPLORER/address/$CONTRACT_ADDRESS"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Update lib/contracts.ts with the contract address"
echo "2. Test the contract using cargo stylus replay"
echo "3. Integrate with your frontend"

echo -e "\n${GREEN}Done! 🎉${NC}"

#!/bin/bash

# Test deployed Stylus contract
# Usage: ./test-deployment.sh <contract_address>

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo "Usage: ./test-deployment.sh <contract_address>"
    exit 1
fi

CONTRACT_ADDRESS=$1

# Load environment
if [ -f .env ]; then
    source .env
else
    RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"
fi

echo -e "${GREEN}Testing Stylus Contract${NC}"
echo "Contract: $CONTRACT_ADDRESS"
echo "RPC: $RPC_URL"
echo "=========================================="

# Test replay
echo -e "\n${YELLOW}Running replay test...${NC}"
cargo stylus replay \
  --endpoint=$RPC_URL \
  --address=$CONTRACT_ADDRESS

echo -e "\n${GREEN}✅ Contract is working!${NC}"

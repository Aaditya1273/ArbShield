#!/bin/bash

# Pre-deployment checklist for Stylus contract
# Usage: ./pre-deploy-check.sh

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔍 Pre-Deployment Checklist${NC}"
echo "=========================================="

ERRORS=0
WARNINGS=0

# Check Rust installation
echo -n "Checking Rust installation... "
if command -v cargo &> /dev/null; then
    RUST_VERSION=$(rustc --version | cut -d' ' -f2)
    echo -e "${GREEN}✓${NC} ($RUST_VERSION)"
else
    echo -e "${RED}✗${NC}"
    echo "  Install: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    ((ERRORS++))
fi

# Check wasm32 target
echo -n "Checking wasm32-unknown-unknown target... "
if rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Install: rustup target add wasm32-unknown-unknown"
    ((ERRORS++))
fi

# Check cargo-stylus
echo -n "Checking cargo-stylus... "
if command -v cargo-stylus &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Install: cargo install --force cargo-stylus"
    ((ERRORS++))
fi

# Check .env file
echo -n "Checking .env configuration... "
if [ -f .env ]; then
    source .env
    if [ -n "$PRIVATE_KEY" ] && [ "$PRIVATE_KEY" != "your_private_key_here" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo "  Set PRIVATE_KEY in .env file"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC}"
    echo "  Create .env file with PRIVATE_KEY"
    ((ERRORS++))
fi

# Check if contract builds
echo -n "Checking contract builds... "
if cargo build --release --target wasm32-unknown-unknown &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Run: cargo build --release --target wasm32-unknown-unknown"
    ((ERRORS++))
fi

# Check Stylus compatibility
echo -n "Checking Stylus compatibility... "
if cargo stylus check &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "  Warning: Stylus check failed. Review output with: cargo stylus check"
    ((WARNINGS++))
fi

# Check wallet balance (if RPC is available)
if [ -n "$RPC_URL" ] && [ -n "$PRIVATE_KEY" ]; then
    echo -n "Checking wallet balance... "
    # This would require additional tooling, skip for now
    echo -e "${YELLOW}⊘${NC} (manual check required)"
    echo "  Ensure you have at least 0.01 ETH on Arbitrum Sepolia"
    echo "  Faucet: https://faucet.quicknode.com/arbitrum/sepolia"
fi

echo ""
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
    echo ""
    echo "Run: ./deploy.sh testnet"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s). You can proceed but review warnings.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found. Fix them before deploying.${NC}"
    exit 1
fi

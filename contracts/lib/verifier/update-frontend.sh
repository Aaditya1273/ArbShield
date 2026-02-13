#!/bin/bash

# Update frontend with deployed Stylus contract address
# Usage: ./update-frontend.sh <contract_address>

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Usage: ./update-frontend.sh <contract_address>${NC}"
    exit 1
fi

CONTRACT_ADDRESS=$1

# Validate address format
if [[ ! $CONTRACT_ADDRESS =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo -e "${RED}❌ Invalid contract address format${NC}"
    exit 1
fi

CONTRACTS_FILE="../../../lib/contracts.ts"

if [ ! -f "$CONTRACTS_FILE" ]; then
    echo -e "${RED}❌ contracts.ts not found at $CONTRACTS_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}Updating frontend configuration...${NC}"

# Backup original file
cp "$CONTRACTS_FILE" "$CONTRACTS_FILE.backup"

# Update the ZK_VERIFIER address
sed -i.tmp "s/ZK_VERIFIER: \"0x[a-fA-F0-9]\{40\}\"/ZK_VERIFIER: \"$CONTRACT_ADDRESS\"/" "$CONTRACTS_FILE"
rm "$CONTRACTS_FILE.tmp" 2>/dev/null || true

echo -e "${GREEN}✅ Updated ZK_VERIFIER address to: $CONTRACT_ADDRESS${NC}"
echo -e "${YELLOW}Backup saved to: $CONTRACTS_FILE.backup${NC}"

echo -e "\n${GREEN}Next steps:${NC}"
echo "1. Review the changes in lib/contracts.ts"
echo "2. Test the integration with your frontend"
echo "3. Commit the changes to git"

# ArbShield Troubleshooting Guide

## Common Issues and Solutions

### 1. MetaMask Shows Huge Gas Fee ($16M+)

**Symptom**: When trying to verify a proof, MetaMask shows an absurdly high gas fee like $16,181,640.84 ETH.

**Cause**: This happens when:
- The contract function signature doesn't match
- The contract call would revert
- MetaMask can't estimate gas properly

**Solution**: ✅ Fixed!
- Updated `verifyProof` function call to match contract signature
- Changed from `verifyProof(bytes, uint256[])` to `verifyProof(bytes, string)`
- Added explicit gas limit of 500,000 to prevent estimation errors
- Fixed `proofToBytes` to properly clean hex strings

**How to Test**:
1. Go to `/verify` page
2. Click "Skip Passkey Auth"
3. Select attribute and "Generate Proof"
4. Click "Verify Proof"
5. MetaMask should now show reasonable gas (~$0.01-0.05)

---

### 2. WebAuthn/Passkey Not Working on Localhost

**Symptom**: Passkey registration/authentication fails with security errors.

**Cause**: WebAuthn requires HTTPS or special browser configuration.

**Solution**: Use the skip button during development
- Click "Skip Passkey Auth (Dev Mode)" in Step 1
- For production: Deploy to HTTPS domain (Vercel, Netlify, etc.)

**Alternative for Testing**:
```bash
# Use ngrok to expose localhost over HTTPS
ngrok http 3000

# Then access via the HTTPS URL provided
```

---

### 3. "No Proof Found" Error in Step 3

**Symptom**: Step 3 shows "No proof found. Please go back and generate a proof first."

**Cause**: Session storage was cleared or you refreshed the page.

**Solution**: 
- Go back to Step 1 and complete the flow again
- Don't refresh the page during the verification flow
- The proof is stored in `sessionStorage` and cleared on refresh

---

### 4. Transaction Fails with "Proof Verification Failed"

**Symptom**: Transaction is submitted but reverts with "Proof verification failed".

**Cause**: The mock proof doesn't meet the contract's validation requirements.

**Solution**: The contract validates:
- Proof length must be >= 256 bytes
- Proof checksum must be > 0

Current implementation generates valid mock proofs that pass these checks.

---

### 5. Wallet Not Connecting

**Symptom**: RainbowKit modal doesn't open or wallet doesn't connect.

**Cause**: 
- Wrong network selected in wallet
- WalletConnect project ID missing
- Browser extension conflicts

**Solution**:
1. Check `.env.local` has `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
2. Switch MetaMask to Arbitrum Sepolia (Chain ID: 421614)
3. Add Arbitrum Sepolia network if not present:
   - Network Name: Arbitrum Sepolia
   - RPC URL: https://sepolia-rollup.arbitrum.io/rpc
   - Chain ID: 421614
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.arbiscan.io

---

### 6. "Insufficient Funds" Error

**Symptom**: Transaction fails with insufficient funds.

**Cause**: No testnet ETH in wallet.

**Solution**: Get free testnet ETH from faucets:
- Arbitrum Sepolia Faucet: https://faucet.quicknode.com/arbitrum/sepolia
- Alchemy Faucet: https://www.alchemy.com/faucets/arbitrum-sepolia
- Chainlink Faucet: https://faucets.chain.link/arbitrum-sepolia

---

### 7. Contract Not Found / Invalid Address

**Symptom**: Transaction fails with "contract not found" or similar error.

**Cause**: Contract addresses in `.env.local` are incorrect or contracts not deployed.

**Solution**: Verify contract addresses in `.env.local`:
```env
NEXT_PUBLIC_ZK_VERIFIER=0xEa53E2fF08CD18fD31B188a72079aE9Ca34856e4
NEXT_PUBLIC_COMPLIANCE_REGISTRY=0x464D37393C8D3991b493DBb57F5f3b8c31c7Fa60
NEXT_PUBLIC_MOCK_BUIDL=0x15Ef1E2E5899dBc374e5D7e147d57Fd032912eDC
NEXT_PUBLIC_STYLUS_VERIFIER=0xa2d6642f1f307a8144349d6fe2188bf764a08253
NEXT_PUBLIC_PASSKEY_REGISTRY=0xe047C063A0ed4ec577fa255De3456856e4455087
```

Check contracts on Arbiscan:
- https://sepolia.arbiscan.io/address/[CONTRACT_ADDRESS]

---

### 8. Page Shows "No Data" or Empty Dashboard

**Symptom**: Compliance dashboard shows no verified attributes.

**Cause**: No verifications have been completed yet.

**Solution**:
1. Complete the verification flow at `/verify`
2. Wait for transaction confirmation
3. Refresh the dashboard page
4. Data is fetched from blockchain events

---

### 9. Build Errors with TypeScript

**Symptom**: Build fails with TypeScript errors.

**Cause**: Missing types or incorrect imports.

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
bun install

# Rebuild
bun run build
```

---

### 10. Hydration Errors in Console

**Symptom**: Console shows "Hydration failed" warnings.

**Cause**: Server-rendered HTML doesn't match client-rendered HTML.

**Solution**: Already fixed with `suppressHydrationWarning` in `app/layout.tsx`.

If you see new hydration errors:
- Check for `localStorage` or `window` usage in components
- Use `useEffect` for client-only code
- Add `suppressHydrationWarning` to affected elements

---

## Development Tips

### Clear All State
```javascript
// In browser console
sessionStorage.clear();
localStorage.clear();
location.reload();
```

### Check Contract Events
```bash
# View recent ProofVerified events
# Go to Arbiscan > Contract > Events tab
https://sepolia.arbiscan.io/address/0xEa53E2fF08CD18fD31B188a72079aE9Ca34856e4#events
```

### Debug Transaction
```bash
# View transaction details
https://sepolia.arbiscan.io/tx/[TRANSACTION_HASH]

# Check:
# - Status (Success/Failed)
# - Gas Used
# - Input Data
# - Logs/Events
```

### Test Different Attributes
Each compliance attribute can be verified independently:
- `credit_score` - Credit score range proof
- `accredited_investor` - Accredited investor status
- `kyc_verified` - KYC completion proof
- `us_person` - US person status

---

## Getting Help

### Check Logs
1. Browser console (F12)
2. Network tab for failed requests
3. MetaMask activity log

### Useful Commands
```bash
# Check Next.js version
bun run next --version

# Check for outdated packages
bun outdated

# Run in debug mode
NODE_OPTIONS='--inspect' bun run dev
```

### Report Issues
When reporting issues, include:
- Browser and version
- Wallet and version
- Network (Arbitrum Sepolia)
- Transaction hash (if applicable)
- Console errors
- Steps to reproduce

---

**Last Updated**: February 14, 2026

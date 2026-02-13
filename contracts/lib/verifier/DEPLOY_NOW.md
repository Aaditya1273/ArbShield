# Deploy Your Stylus Contract Now

Everything is ready! Just follow these 3 steps:

## ✅ Prerequisites Verified

- ✓ Rust 1.92.0 installed
- ✓ wasm32-unknown-unknown target ready
- ✓ cargo-stylus CLI installed
- ✓ Contract builds successfully

## 🔑 Step 1: Add Your Private Key

Create the `.env` file:

```bash
cd contracts/lib/verifier
nano .env
```

Add this content (replace with your actual private key):

```bash
PRIVATE_KEY=your_private_key_without_0x_prefix
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

**Important:**
- Remove the `0x` prefix from your private key
- Never commit this file to git (it's already in .gitignore)
- Get testnet ETH from: https://faucet.quicknode.com/arbitrum/sepolia

## 🚀 Step 2: Deploy

```bash
./deploy.sh testnet
```

This will:
1. Build the Rust contract to WASM
2. Check Stylus compatibility
3. Estimate deployment cost
4. Deploy to Arbitrum Sepolia
5. Save deployment info to JSON

Expected output:
```
✅ Deployment successful!
==========================================
Contract Address: 0x...

View on Explorer:
https://sepolia.arbiscan.io/address/0x...
```

## 🔗 Step 3: Update Frontend

```bash
./update-frontend.sh 0xYourContractAddress
```

This automatically updates `lib/contracts.ts` with your new contract address.

## 🧪 Step 4: Test (Optional)

```bash
./test-deployment.sh 0xYourContractAddress
```

## 📊 What You'll Get

- Contract deployed to Arbitrum Sepolia
- ~92% gas savings vs Solidity
- Verification: ~192k gas (vs 2.5M)
- Contract address for frontend integration

## 🆘 Need Help?

**No private key?**
- Export from MetaMask: Account menu → Account details → Show private key
- Or create a new wallet for testing

**No testnet ETH?**
- Get free ETH: https://faucet.quicknode.com/arbitrum/sepolia
- Need at least 0.01 ETH

**Deployment fails?**
- Check private key has no 0x prefix
- Verify you have enough ETH
- Try alternative RPC: https://arbitrum-sepolia.blockpi.network/v1/rpc/public

## 🎉 After Deployment

1. Copy your contract address
2. View on Arbiscan: https://sepolia.arbiscan.io/address/0xYourAddress
3. Test the verification flow in your frontend
4. Monitor gas usage

---

**Ready?** Run `./deploy.sh testnet` now!

# Quick Start Guide

## Prerequisites

Install these tools first:

```powershell
# Install Node.js (if not installed)
# Download from: https://nodejs.org/

# Install circom
npm install -g circom

# Install snarkjs
npm install -g snarkjs

# Verify installation
circom --version
snarkjs --version
```

## Step-by-Step

### 1. Generate Circuit Keys (First Time Only)

```powershell
cd circuits
bash generate_vk.sh
```

This will:
- Compile the circuit
- Download powers of tau (~50MB)
- Generate proving key
- Generate verification key
- Create a test proof
- Verify it locally

**Time**: ~5 minutes (first time, includes download)

### 2. Run All Three Gates

```powershell
# Make sure you're in circuits directory
bash run_all_gates.sh
```

This runs:
- Gate 1: Public input ordering ✅
- Gate 2: Precompile vs arkworks ✅
- Gate 3: Parity test (THE KING) ✅

**Time**: ~10 minutes

### 3. If You Don't Have Contract Deployed Yet

Skip Gates 2 and 3 for now:

```powershell
# Just verify input ordering
node verify_input_order.js
```

Then deploy the contract and come back to run the full test.

## Common Issues

### "circom: command not found"
```powershell
npm install -g circom
```

### "snarkjs: command not found"
```powershell
npm install -g snarkjs
```

### "bash: command not found" (Windows)
Install Git Bash or use WSL:
- Git Bash: https://git-scm.com/download/win
- Or use PowerShell to run Node scripts directly:
  ```powershell
  node verify_input_order.js
  ```

### "No such file or directory"
Make sure you're in the `circuits/` directory:
```powershell
cd circuits
pwd  # Should show: .../liquidmesh-somnia-ai/circuits
```

## Quick Test (No Contract Needed)

```powershell
# 1. Generate keys
bash generate_vk.sh

# 2. Verify ordering
node verify_input_order.js

# 3. Extract VK for Rust
node extract_vk.js > vk_output.txt
cat vk_output.txt
```

## Full Test (Contract Required)

```powershell
# Set environment variables
$env:CONTRACT_ADDRESS = "0xa2d6642f1f307a8144349d6fe2188bf764a08253"
$env:PRIVATE_KEY = "0x..."

# Run all gates
bash run_all_gates.sh
```

## What Each File Does

- `multiplier.circom` - The ZK circuit (a * b = c)
- `generate_vk.sh` - Generates all keys and test proof
- `extract_vk.js` - Converts VK to Rust format
- `verify_input_order.js` - Gate 1: Checks input ordering
- `test_precompile_parity.js` - Gate 2: Precompile vs arkworks
- `parity_test.js` - Gate 3: THE KING (20-50 random proofs)
- `run_all_gates.sh` - Runs all three gates

## Next Steps After All Gates Pass

1. Copy VK to Rust contract:
   ```powershell
   node extract_vk.js > vk_output.txt
   # Copy contents to contracts/lib/verifier/src/lib.rs
   ```

2. Deploy contract:
   ```powershell
   cd ../contracts/lib/verifier
   $env:PRIVATE_KEY = "0x..."
   bash deploy_production.sh
   ```

3. Update frontend:
   ```powershell
   # Update .env.local with new contract address
   ```

4. Test end-to-end!

---

**You're ready!** 🚀

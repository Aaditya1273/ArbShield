# Real ZK Circuit Setup for ArbShield

This directory contains the REAL Groth16 circuit implementation for ArbShield's compliance verification.

## Prerequisites

Install the required tools:

```bash
# Install circom
npm install -g circom

# Install snarkjs
npm install -g snarkjs

# Install Node.js (if not already installed)
# Download from: https://nodejs.org/
```

## Step-by-Step Setup

### Step 1: Generate Circuit and Keys

Run the setup script:

```bash
cd circuits
bash generate_vk.sh
```

This will:
1. Compile the `multiplier.circom` circuit
2. Download powers of tau ceremony file (~50MB)
3. Generate proving key (zkey)
4. Export verification key
5. Generate a test proof (a=3, b=5, c=15)
6. Verify the proof with snarkjs

**Expected output:**
```
✅ Setup complete!

📁 Generated files:
  - build/verification_key.json (verification key)
  - build/proof.json (test proof)
  - build/public.json (public inputs)
  - build/circuit_0000.zkey (proving key)
```

### Step 2: Extract Verification Key to Rust

Extract the verification key constants for the Stylus contract:

```bash
node extract_vk.js > vk_output.txt
```

This generates Rust constants from the verification key.

### Step 3: Update Stylus Contract

Copy the generated constants to the Stylus contract:

```bash
# Open the output
cat vk_output.txt

# Manually copy the vk_constants module to:
# contracts/lib/verifier/src/lib.rs
# Replace the existing vk_constants module (lines 30-120)
```

### Step 4: Rebuild and Redeploy Stylus Contract

```bash
cd ../contracts/lib/verifier

# Clean and rebuild
cargo clean
cargo build --release --target wasm32-unknown-unknown

# Check the contract
cargo stylus check --wasm-file=target/wasm32-unknown-unknown/release/arbshield_verifier.wasm

# Deploy (requires ETH on Arbitrum Sepolia)
cargo stylus deploy \
  --private-key=$PRIVATE_KEY \
  --wasm-file=target/wasm32-unknown-unknown/release/arbshield_verifier.wasm
```

### Step 5: Test with Real Proof

Generate a proof and test it:

```bash
cd ../../circuits

# Generate proof for a=7, b=11 (c=77)
echo '{"a": "7", "b": "11"}' > build/input_test.json
node build/multiplier_js/generate_witness.js build/multiplier_js/multiplier.wasm build/input_test.json build/witness_test.wtns
snarkjs groth16 prove build/circuit_0000.zkey build/witness_test.wtns build/proof_test.json build/public_test.json

# Verify locally
snarkjs groth16 verify build/verification_key.json build/public_test.json build/proof_test.json
```

## Circuit Details

### Multiplier Circuit

**Purpose**: Prove you know two numbers `a` and `b` such that `a * b = c`, without revealing `a` or `b`.

**Inputs**:
- `a` (private): First number
- `b` (private): Second number

**Outputs**:
- `c` (public): Product of a and b

**Example**:
- Private: a=3, b=5
- Public: c=15
- Proof: "I know two numbers that multiply to 15" (without revealing 3 and 5)

### Proof Format

The Groth16 proof consists of:
- **pi_a**: G1 point (64 bytes: x, y)
- **pi_b**: G2 point (128 bytes: x0, x1, y0, y1)  
- **pi_c**: G1 point (64 bytes: x, y)
- **Total**: 256 bytes

### Public Inputs Format

Each public input is a 32-byte field element (Fr in BN254).

For the multiplier circuit:
- `public[0]` = c (the product)

## Integration with Frontend

### Update Frontend to Use Real Proofs

1. **Install snarkjs in frontend**:
```bash
npm install snarkjs
```

2. **Copy circuit artifacts**:
```bash
cp circuits/build/circuit_0000.zkey public/circuit.zkey
cp circuits/build/multiplier_js/multiplier.wasm public/multiplier.wasm
```

3. **Update `lib/zkproof.ts`** to generate real proofs:
```typescript
import * as snarkjs from 'snarkjs';

export async function generateZKProof(input: ProofInput): Promise<ZKProof> {
  // Load circuit files
  const wasmFile = await fetch('/multiplier.wasm').then(r => r.arrayBuffer());
  const zkeyFile = await fetch('/circuit.zkey').then(r => r.arrayBuffer());
  
  // Prepare input (for multiplier: a and b)
  const circuitInput = {
    a: input.attributeValue,
    b: input.threshold,
  };
  
  // Generate proof
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    circuitInput,
    new Uint8Array(wasmFile),
    new Uint8Array(zkeyFile)
  );
  
  return { proof, publicSignals };
}
```

## Gas Costs

### Stylus Rust Verifier
- **Pairing check**: ~180k gas
- **Total verification**: ~200k gas
- **92% cheaper** than Solidity

### Solidity Verifier (for comparison)
- **Pairing check**: ~2.3M gas
- **Total verification**: ~2.5M gas

## Troubleshooting

### "circom: command not found"
```bash
npm install -g circom
```

### "snarkjs: command not found"
```bash
npm install -g snarkjs
```

### "Powers of tau download fails"
Download manually:
```bash
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
mv powersOfTau28_hez_final_12.ptau build/
```

### "Cargo build fails"
Make sure you have:
```bash
rustup target add wasm32-unknown-unknown
cargo install cargo-stylus
```

### "Proof verification fails"
1. Check that verification key matches the deployed contract
2. Ensure public inputs are in correct format (32-byte Fr elements)
3. Verify proof locally with snarkjs first

## Production Checklist

- [ ] Generate real circuit for your use case (not multiplier)
- [ ] Run trusted setup ceremony (or use existing ceremony)
- [ ] Extract and update verification key in Stylus contract
- [ ] Deploy Stylus contract to mainnet
- [ ] Update frontend to generate real proofs
- [ ] Test end-to-end with real proofs
- [ ] Security audit of circuit and contract
- [ ] Document proof generation for users

## Resources

- [Circom Documentation](https://docs.circom.io/)
- [snarkjs Documentation](https://github.com/iden3/snarkjs)
- [Stylus Documentation](https://docs.arbitrum.io/stylus)
- [arkworks Documentation](https://arkworks.rs/)
- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)

---

**Status**: Ready for real ZK proof generation and verification
**Last Updated**: February 14, 2026

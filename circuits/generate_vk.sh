#!/bin/bash
# generate_vk.sh - Generate real verification key for multiplier circuit

set -e

echo "🔧 Setting up ZK circuit..."

# Create output directory
mkdir -p build

# Compile circuit
echo "📝 Compiling circuit..."
circom multiplier.circom --r1cs --wasm --sym -o build/

# Download powers of tau (if not exists)
if [ ! -f "build/powersOfTau28_hez_final_12.ptau" ]; then
    echo "⬇️  Downloading powers of tau..."
    wget -O build/powersOfTau28_hez_final_12.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
fi

# Generate zkey
echo "🔑 Generating proving key..."
snarkjs groth16 setup build/multiplier.r1cs build/powersOfTau28_hez_final_12.ptau build/circuit_0000.zkey

# Export verification key
echo "📤 Exporting verification key..."
snarkjs zkey export verificationkey build/circuit_0000.zkey build/verification_key.json

# Generate a test proof: a=3, b=5, c=15
echo "🧪 Generating test proof (a=3, b=5, c=15)..."
echo '{"a": "3", "b": "5"}' > build/input.json

# Generate witness
node build/multiplier_js/generate_witness.js build/multiplier_js/multiplier.wasm build/input.json build/witness.wtns

# Generate proof
snarkjs groth16 prove build/circuit_0000.zkey build/witness.wtns build/proof.json build/public.json

# Verify with snarkjs (sanity check)
echo "✅ Verifying proof with snarkjs..."
snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json

echo ""
echo "✅ Setup complete!"
echo ""
echo "📁 Generated files:"
echo "  - build/verification_key.json (verification key)"
echo "  - build/proof.json (test proof)"
echo "  - build/public.json (public inputs)"
echo "  - build/circuit_0000.zkey (proving key)"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: node extract_vk.js"
echo "  2. Copy the output to contracts/lib/verifier/src/lib.rs"
echo "  3. Redeploy Stylus contract"

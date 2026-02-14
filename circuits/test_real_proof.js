const { ethers } = require('ethers');
const fs = require('fs');

// Configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xa2d6642f1f307a8144349d6fe2188bf764a08253';
const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';

// Stylus Verifier ABI
const ABI = [
    "function verify(bytes calldata proof, bytes[] calldata publicInputs) external returns (bool)",
    "function verify_with_precompile(bytes calldata proof, bytes[] calldata publicInputs) external returns (bool)",
    "function get_verified_count() external view returns (uint256)",
    "function is_initialized() external view returns (bool)"
];

async function testRealProof() {
    console.log('🧪 Testing Real Groth16 Proof\n');
    
    // Load proof from snarkjs
    const proof = JSON.parse(fs.readFileSync('build/proof.json', 'utf8'));
    const publicSignals = JSON.parse(fs.readFileSync('build/public.json', 'utf8'));
    
    console.log('📄 Loaded proof:');
    console.log('  - Public output (c):', publicSignals[0]);
    console.log('  - Proof protocol:', proof.protocol);
    console.log('  - Proof curve:', proof.curve);
    console.log();
    
    // Convert to bytes
    const proofBytes = encodeProof(proof);
    const publicInputs = publicSignals.map(hexToBytes32);
    
    console.log('📦 Encoded for contract:');
    console.log('  - Proof bytes length:', proofBytes.length);
    console.log('  - Public inputs count:', publicInputs.length);
    console.log('  - Proof preview:', proofBytes.slice(0, 66) + '...');
    console.log();
    
    // Connect to contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const verifier = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    
    console.log('🔗 Connected to contract:', CONTRACT_ADDRESS);
    console.log('👤 Wallet:', wallet.address);
    
    // Check if initialized
    try {
        const initialized = await verifier.is_initialized();
        console.log('📊 Contract initialized:', initialized);
        
        if (initialized) {
            const count = await verifier.get_verified_count();
            console.log('📊 Verified count:', count.toString());
        }
    } catch (e) {
        console.log('⚠️  Could not check initialization (might not be deployed yet)');
    }
    
    console.log();
    
    // Verify proof
    try {
        console.log('🔍 Verifying proof...');
        const tx = await verifier.verify(proofBytes, publicInputs, {
            gasLimit: 500000
        });
        
        console.log('📝 Transaction hash:', tx.hash);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed!');
        console.log('   Block:', receipt.blockNumber);
        console.log('   Gas used:', receipt.gasUsed.toString());
        console.log('   Status:', receipt.status === 1 ? 'Success' : 'Failed');
        
        if (receipt.status === 1) {
            console.log('\n🎉 PROOF VERIFIED SUCCESSFULLY!');
        } else {
            console.log('\n❌ Proof verification failed');
        }
        
    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        if (error.data) {
            console.error('Error data:', error.data);
        }
        process.exit(1);
    }
    
    // Try precompile version (if available)
    try {
        console.log('\n🚀 Testing precompile version...');
        const txPrecompile = await verifier.verify_with_precompile(proofBytes, publicInputs, {
            gasLimit: 500000
        });
        
        const receiptPrecompile = await txPrecompile.wait();
        console.log('✅ Precompile verification:', receiptPrecompile.status === 1 ? 'Success' : 'Failed');
        console.log('   Gas used:', receiptPrecompile.gasUsed.toString());
        
    } catch (error) {
        console.log('⚠️  Precompile verification not available or failed');
    }
}

function encodeProof(proof) {
    // Convert snarkjs JSON proof to 256 bytes
    // Groth16 proof format:
    // - pi_a: G1 point (64 bytes: x, y)
    // - pi_b: G2 point (128 bytes: x0, x1, y0, y1)
    // - pi_c: G1 point (64 bytes: x, y)
    
    return ethers.concat([
        hexToBytes32(proof.pi_a[0]),  // pi_a.x
        hexToBytes32(proof.pi_a[1]),  // pi_a.y
        hexToBytes32(proof.pi_b[0][0]), // pi_b.x0
        hexToBytes32(proof.pi_b[0][1]), // pi_b.x1
        hexToBytes32(proof.pi_b[1][0]), // pi_b.y0
        hexToBytes32(proof.pi_b[1][1]), // pi_b.y1
        hexToBytes32(proof.pi_c[0]),  // pi_c.x
        hexToBytes32(proof.pi_c[1]),  // pi_c.y
    ]);
}

function hexToBytes32(hex) {
    // Convert hex string to 32-byte array (big-endian)
    return ethers.zeroPadValue(ethers.toBeHex(BigInt(hex)), 32);
}

// Run test
testRealProof()
    .then(() => {
        console.log('\n✅ Test complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });

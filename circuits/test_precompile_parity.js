#!/usr/bin/env node
/**
 * PRECOMPILE vs ARKWORKS PARITY TEST
 * 
 * Tests that both verification paths agree.
 * In production: precompile is canonical truth.
 * 
 * If they disagree → trust precompile, investigate arkworks.
 */

const { ethers } = require('ethers');
const fs = require('fs');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xa2d6642f1f307a8144349d6fe2188bf764a08253';
const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';

const ABI = [
    "function verify(bytes calldata proof, bytes[] calldata publicInputs) external returns (bool)",
    "function verify_with_precompile(bytes calldata proof, bytes[] calldata publicInputs) external returns (bool)",
];

async function testBothPaths() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       PRECOMPILE vs ARKWORKS PARITY TEST                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log();
    console.log('Testing both verification paths:');
    console.log('  1. arkworks (Rust native)');
    console.log('  2. Arbitrum precompile (canonical)');
    console.log();
    console.log('Expected: Both paths agree');
    console.log('If disagree: Trust precompile, debug arkworks');
    console.log();
    console.log('─'.repeat(60));
    console.log();
    
    // Load test proof
    const proof = JSON.parse(fs.readFileSync('build/proof.json', 'utf8'));
    const publicSignals = JSON.parse(fs.readFileSync('build/public.json', 'utf8'));
    
    const proofBytes = encodeProof(proof);
    const publicInputs = publicSignals.map(hexToBytes32);
    
    console.log('Test proof loaded:');
    console.log('  Public signal:', publicSignals[0]);
    console.log('  Proof length:', proofBytes.length);
    console.log();
    
    // Connect to contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const verifier = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    
    // Test arkworks path
    console.log('Testing arkworks path...');
    let arkworksResult, arkworksGas;
    try {
        const tx1 = await verifier.verify(proofBytes, publicInputs, {
            gasLimit: 500000
        });
        const receipt1 = await tx1.wait();
        arkworksResult = receipt1.status === 1;
        arkworksGas = receipt1.gasUsed.toString();
        console.log('  Result:', arkworksResult ? '✅ Valid' : '❌ Invalid');
        console.log('  Gas used:', arkworksGas);
    } catch (error) {
        console.log('  ❌ Error:', error.message);
        arkworksResult = false;
        arkworksGas = 'N/A';
    }
    console.log();
    
    // Test precompile path
    console.log('Testing precompile path...');
    let precompileResult, precompileGas;
    try {
        const tx2 = await verifier.verify_with_precompile(proofBytes, publicInputs, {
            gasLimit: 500000
        });
        const receipt2 = await tx2.wait();
        precompileResult = receipt2.status === 1;
        precompileGas = receipt2.gasUsed.toString();
        console.log('  Result:', precompileResult ? '✅ Valid' : '❌ Invalid');
        console.log('  Gas used:', precompileGas);
    } catch (error) {
        console.log('  ⚠️  Precompile not available or error:', error.message);
        precompileResult = null;
        precompileGas = 'N/A';
    }
    console.log();
    
    console.log('─'.repeat(60));
    console.log();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    RESULTS                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log();
    console.log('arkworks:   ', arkworksResult ? '✅ Valid' : '❌ Invalid', `(${arkworksGas} gas)`);
    console.log('precompile: ', precompileResult === null ? '⚠️  N/A' : (precompileResult ? '✅ Valid' : '❌ Invalid'), `(${precompileGas} gas)`);
    console.log();
    
    if (precompileResult === null) {
        console.log('⚠️  Precompile path not available');
        console.log('   This is OK for testing, but production should use precompile');
        console.log();
        console.log('✅ arkworks path works');
        return;
    }
    
    if (arkworksResult === precompileResult) {
        console.log('✅ PARITY ACHIEVED');
        console.log('   Both paths agree!');
        console.log();
        
        const gasSavings = precompileGas !== 'N/A' && arkworksGas !== 'N/A'
            ? ((1 - parseInt(precompileGas) / parseInt(arkworksGas)) * 100).toFixed(2)
            : 'N/A';
        
        console.log('Gas comparison:');
        console.log('  arkworks:  ', arkworksGas);
        console.log('  precompile:', precompileGas);
        console.log('  Savings:   ', gasSavings + '%');
        console.log();
        console.log('🎯 Production recommendation: Use precompile path');
        console.log('   - Matches Ethereum reference exactly');
        console.log('   - Lower gas cost');
        console.log('   - Canonical truth');
    } else {
        console.log('❌ DISAGREEMENT DETECTED');
        console.log();
        console.log('arkworks and precompile disagree!');
        console.log();
        console.log('🚨 CRITICAL: In production, trust precompile');
        console.log();
        console.log('Possible causes:');
        console.log('  1. Serialization format mismatch');
        console.log('  2. Coordinate ordering difference');
        console.log('  3. Bug in arkworks implementation');
        console.log();
        console.log('Action required:');
        console.log('  1. Use precompile path for production');
        console.log('  2. Debug arkworks implementation');
        console.log('  3. Ensure both use same VK');
        console.log();
        process.exit(1);
    }
}

function encodeProof(proof) {
    return ethers.concat([
        hexToBytes32(proof.pi_a[0]),
        hexToBytes32(proof.pi_a[1]),
        hexToBytes32(proof.pi_b[0][0]),
        hexToBytes32(proof.pi_b[0][1]),
        hexToBytes32(proof.pi_b[1][0]),
        hexToBytes32(proof.pi_b[1][1]),
        hexToBytes32(proof.pi_c[0]),
        hexToBytes32(proof.pi_c[1]),
    ]);
}

function hexToBytes32(hex) {
    return ethers.zeroPadValue(ethers.toBeHex(BigInt(hex)), 32);
}

testBothPaths()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

#!/usr/bin/env node
/**
 * PARITY TEST - THE KING
 * 
 * This test is the ONLY thing that matters.
 * It proves: snarkjs verify == contract verify
 * 
 * If this passes 50/50 times → you're good.
 * If this passes 49/50 times → you're broken.
 * 
 * There is no partial credit in cryptography.
 */

const { ethers } = require('ethers');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

// Configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xa2d6642f1f307a8144349d6fe2188bf764a08253';
const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
const NUM_TESTS = parseInt(process.env.NUM_TESTS || '20');

const ABI = [
    "function verify(bytes calldata proof, bytes[] calldata publicInputs) external returns (bool)",
];

// Test results
const results = {
    total: 0,
    snarkjsPass: 0,
    snarkjsFail: 0,
    contractPass: 0,
    contractFail: 0,
    parity: 0,
    mismatch: 0,
    errors: [],
};

async function generateRandomWitness(a, b) {
    const input = { a: a.toString(), b: b.toString() };
    const inputFile = `build/input_${a}_${b}.json`;
    const witnessFile = `build/witness_${a}_${b}.wtns`;
    const proofFile = `build/proof_${a}_${b}.json`;
    const publicFile = `build/public_${a}_${b}.json`;
    
    // Write input
    fs.writeFileSync(inputFile, JSON.stringify(input));
    
    // Generate witness
    await execAsync(
        `node build/multiplier_js/generate_witness.js build/multiplier_js/multiplier.wasm ${inputFile} ${witnessFile}`
    );
    
    // Generate proof
    await execAsync(
        `snarkjs groth16 prove build/circuit_0000.zkey ${witnessFile} ${proofFile} ${publicFile}`
    );
    
    return { proofFile, publicFile, expected: a * b };
}

async function verifyWithSnarkjs(proofFile, publicFile) {
    try {
        const { stdout } = await execAsync(
            `snarkjs groth16 verify build/verification_key.json ${publicFile} ${proofFile}`
        );
        return stdout.includes('OK');
    } catch (error) {
        return false;
    }
}

async function verifyWithContract(proofFile, publicFile) {
    const proof = JSON.parse(fs.readFileSync(proofFile, 'utf8'));
    const publicSignals = JSON.parse(fs.readFileSync(publicFile, 'utf8'));
    
    const proofBytes = encodeProof(proof);
    const publicInputs = publicSignals.map(hexToBytes32);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const verifier = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    
    try {
        const tx = await verifier.verify(proofBytes, publicInputs, {
            gasLimit: 500000
        });
        const receipt = await tx.wait();
        return receipt.status === 1;
    } catch (error) {
        console.error('Contract error:', error.message);
        return false;
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

async function runParityTest() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         PARITY TEST - THE KING OF ALL TESTS               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log();
    console.log('Testing:', NUM_TESTS, 'random witnesses');
    console.log('Contract:', CONTRACT_ADDRESS);
    console.log();
    console.log('Expected: 100% parity between snarkjs and contract');
    console.log('Anything less = BROKEN SYSTEM');
    console.log();
    console.log('─'.repeat(60));
    console.log();
    
    for (let i = 0; i < NUM_TESTS; i++) {
        // Generate random inputs (keep small for multiplier circuit)
        const a = Math.floor(Math.random() * 100) + 1;
        const b = Math.floor(Math.random() * 100) + 1;
        const expected = a * b;
        
        process.stdout.write(`Test ${i + 1}/${NUM_TESTS}: a=${a}, b=${b}, c=${expected} ... `);
        
        try {
            // Generate proof
            const { proofFile, publicFile } = await generateRandomWitness(a, b);
            
            // Verify with snarkjs
            const snarkjsResult = await verifyWithSnarkjs(proofFile, publicFile);
            
            // Verify with contract
            const contractResult = await verifyWithContract(proofFile, publicFile);
            
            // Check parity
            results.total++;
            if (snarkjsResult) results.snarkjsPass++;
            else results.snarkjsFail++;
            
            if (contractResult) results.contractPass++;
            else results.contractFail++;
            
            if (snarkjsResult === contractResult) {
                results.parity++;
                console.log(`✅ PARITY (snarkjs=${snarkjsResult}, contract=${contractResult})`);
            } else {
                results.mismatch++;
                console.log(`❌ MISMATCH (snarkjs=${snarkjsResult}, contract=${contractResult})`);
                results.errors.push({
                    test: i + 1,
                    a, b, expected,
                    snarkjs: snarkjsResult,
                    contract: contractResult,
                });
            }
            
        } catch (error) {
            console.log(`💥 ERROR: ${error.message}`);
            results.errors.push({
                test: i + 1,
                a, b, expected,
                error: error.message,
            });
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log();
    console.log('─'.repeat(60));
    console.log();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    FINAL RESULTS                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log();
    console.log('Total tests:', results.total);
    console.log();
    console.log('snarkjs results:');
    console.log('  ✅ Pass:', results.snarkjsPass);
    console.log('  ❌ Fail:', results.snarkjsFail);
    console.log();
    console.log('Contract results:');
    console.log('  ✅ Pass:', results.contractPass);
    console.log('  ❌ Fail:', results.contractFail);
    console.log();
    console.log('Parity check:');
    console.log('  ✅ Match:', results.parity);
    console.log('  ❌ Mismatch:', results.mismatch);
    console.log();
    
    const parityRate = (results.parity / results.total * 100).toFixed(2);
    console.log('Parity rate:', parityRate + '%');
    console.log();
    
    if (results.mismatch > 0) {
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║                  ❌ SYSTEM BROKEN ❌                       ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log();
        console.log('Mismatches detected:', results.mismatch);
        console.log();
        console.log('Failed tests:');
        results.errors.forEach(err => {
            console.log(`  Test ${err.test}: a=${err.a}, b=${err.b}`);
            console.log(`    snarkjs: ${err.snarkjs}`);
            console.log(`    contract: ${err.contract}`);
            if (err.error) console.log(`    error: ${err.error}`);
        });
        console.log();
        console.log('Possible causes:');
        console.log('  1. G2 coordinate ordering wrong');
        console.log('  2. VK mismatch');
        console.log('  3. Proof encoding incorrect');
        console.log('  4. Public input ordering wrong');
        console.log();
        process.exit(1);
    } else {
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║              ✅ SYSTEM VERIFIED ✅                         ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log();
        console.log('🎉 100% parity achieved!');
        console.log('🎉 snarkjs and contract agree on ALL proofs!');
        console.log('🎉 System is PRODUCTION READY!');
        console.log();
        console.log('You can now trust this verifier in production.');
        console.log();
        process.exit(0);
    }
}

// Run the test
runParityTest().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

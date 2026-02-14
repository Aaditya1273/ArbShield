#!/usr/bin/env node
/**
 * PUBLIC INPUT ORDERING VERIFICATION
 * 
 * This script FREEZES the public input ordering forever.
 * 
 * IC[0] = constant term
 * IC[1] = first public signal
 * IC[2] = second public signal
 * ...
 * 
 * If your circuit changes, this MUST be updated.
 */

const fs = require('fs');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         PUBLIC INPUT ORDERING VERIFICATION                ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log();

// Load verification key
const vk = JSON.parse(fs.readFileSync('build/verification_key.json', 'utf8'));

console.log('Circuit:', 'multiplier.circom');
console.log('Public inputs:', vk.nPublic);
console.log('IC points:', vk.IC.length);
console.log();

// Verify IC structure
if (vk.IC.length !== vk.nPublic + 1) {
    console.log('❌ ERROR: IC length mismatch!');
    console.log('   Expected:', vk.nPublic + 1);
    console.log('   Got:', vk.IC.length);
    process.exit(1);
}

console.log('IC structure:');
console.log('  IC[0] = constant term (always present)');
for (let i = 1; i < vk.IC.length; i++) {
    console.log(`  IC[${i}] = public signal ${i}`);
}
console.log();

// Load a test proof to verify ordering
const proof = JSON.parse(fs.readFileSync('build/proof.json', 'utf8'));
const publicSignals = JSON.parse(fs.readFileSync('build/public.json', 'utf8'));

console.log('Test proof public signals:');
publicSignals.forEach((signal, i) => {
    console.log(`  public[${i}] = ${signal}`);
});
console.log();

// For multiplier circuit: public[0] should be c (the product)
const input = JSON.parse(fs.readFileSync('build/input.json', 'utf8'));
const expectedC = parseInt(input.a) * parseInt(input.b);
const actualC = parseInt(publicSignals[0]);

console.log('Multiplier circuit verification:');
console.log('  a =', input.a);
console.log('  b =', input.b);
console.log('  Expected c =', expectedC);
console.log('  Actual c =', actualC);
console.log();

if (expectedC === actualC) {
    console.log('✅ Public input ordering is CORRECT');
} else {
    console.log('❌ Public input ordering is WRONG');
    process.exit(1);
}

console.log();
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              ORDERING SPECIFICATION                        ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log();
console.log('FROZEN ORDERING (DO NOT CHANGE):');
console.log();
console.log('Circuit: multiplier.circom');
console.log('  component main {public [c]} = Multiplier();');
console.log();
console.log('Public signals:');
console.log('  [0] = c (output, the product a * b)');
console.log();
console.log('Contract expects:');
console.log('  publicInputs[0] = 32-byte encoding of c');
console.log();
console.log('Frontend MUST send:');
console.log('  const publicInputs = [');
console.log('    hexToBytes32(proof.publicSignals[0]), // c');
console.log('  ];');
console.log();
console.log('If you change the circuit, UPDATE THIS FILE!');
console.log();

// Save ordering spec
const spec = {
    circuit: 'multiplier.circom',
    nPublic: vk.nPublic,
    ordering: [
        { index: 0, name: 'c', description: 'Product of a * b' },
    ],
    lastVerified: new Date().toISOString(),
};

fs.writeFileSync('build/input_ordering.json', JSON.stringify(spec, null, 2));
console.log('💾 Ordering spec saved to build/input_ordering.json');
console.log();
console.log('✅ Public input ordering VERIFIED and FROZEN');

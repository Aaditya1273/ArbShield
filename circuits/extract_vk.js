const fs = require('fs');

const vk = JSON.parse(fs.readFileSync('build/verification_key.json', 'utf8'));

function hexToRust(hex) {
    // Remove 0x prefix and convert to byte array
    const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
    
    // Ensure even length
    const padded = clean.length % 2 === 0 ? clean : '0' + clean;
    
    const bytes = [];
    for (let i = 0; i < padded.length; i += 2) {
        bytes.push(`0x${padded.slice(i, i + 2)}`);
    }
    
    // Pad to 32 bytes if needed
    while (bytes.length < 32) {
        bytes.unshift('0x00');
    }
    
    return `[${bytes.join(', ')}]`;
}

// Calculate VK hash for verification
const crypto = require('crypto');
const vkHash = crypto.createHash('sha256').update(JSON.stringify(vk)).digest('hex');

console.log("// ============================================================================");
console.log("// REAL Verification Key from YOUR trusted setup");
console.log("// Generated:", new Date().toISOString());
console.log("// VK Hash:", vkHash);
console.log("// Protocol:", vk.protocol);
console.log("// Curve:", vk.curve);
console.log("// Public inputs:", vk.nPublic);
console.log("// ============================================================================");
console.log();
console.log("mod vk_constants {");
console.log("    // Alpha G1 (x, y coordinates)");
console.log(`    pub const ALPHA_G1_X: [u8; 32] = ${hexToRust(vk.vk_alpha_1[0])};`);
console.log(`    pub const ALPHA_G1_Y: [u8; 32] = ${hexToRust(vk.vk_alpha_1[1])};`);
console.log();
console.log("    // Beta G2 (x0, x1, y0, y1 coordinates)");
console.log("    // NOTE: snarkjs uses [x1, x0] order - we swap here for arkworks");
console.log(`    pub const BETA_G2_X0: [u8; 32] = ${hexToRust(vk.vk_beta_2[0][1])};  // swapped`);
console.log(`    pub const BETA_G2_X1: [u8; 32] = ${hexToRust(vk.vk_beta_2[0][0])};  // swapped`);
console.log(`    pub const BETA_G2_Y0: [u8; 32] = ${hexToRust(vk.vk_beta_2[1][1])};  // swapped`);
console.log(`    pub const BETA_G2_Y1: [u8; 32] = ${hexToRust(vk.vk_beta_2[1][0])};  // swapped`);
console.log();
console.log("    // Gamma G2");
console.log(`    pub const GAMMA_G2_X0: [u8; 32] = ${hexToRust(vk.vk_gamma_2[0][1])};  // swapped`);
console.log(`    pub const GAMMA_G2_X1: [u8; 32] = ${hexToRust(vk.vk_gamma_2[0][0])};  // swapped`);
console.log(`    pub const GAMMA_G2_Y0: [u8; 32] = ${hexToRust(vk.vk_gamma_2[1][1])};  // swapped`);
console.log(`    pub const GAMMA_G2_Y1: [u8; 32] = ${hexToRust(vk.vk_gamma_2[1][0])};  // swapped`);
console.log();
console.log("    // Delta G2");
console.log(`    pub const DELTA_G2_X0: [u8; 32] = ${hexToRust(vk.vk_delta_2[0][1])};  // swapped`);
console.log(`    pub const DELTA_G2_X1: [u8; 32] = ${hexToRust(vk.vk_delta_2[0][0])};  // swapped`);
console.log(`    pub const DELTA_G2_Y0: [u8; 32] = ${hexToRust(vk.vk_delta_2[1][1])};  // swapped`);
console.log(`    pub const DELTA_G2_Y1: [u8; 32] = ${hexToRust(vk.vk_delta_2[1][0])};  // swapped`);
console.log();
console.log("    // IC (public input commitments)");
vk.IC.forEach((ic, i) => {
    console.log(`    pub const IC_${i}_X: [u8; 32] = ${hexToRust(ic[0])};`);
    console.log(`    pub const IC_${i}_Y: [u8; 32] = ${hexToRust(ic[1])};`);
});
console.log();
console.log(`    pub const VK_HASH: &str = "${vkHash}";`);
console.log(`    pub const N_PUBLIC: usize = ${vk.nPublic};`);
console.log("}");
console.log();
console.log("// ⚠️  CRITICAL: This VK MUST match your circuit!");
console.log("// If proofs fail, regenerate this file from YOUR verification_key.json");
console.log("// VK Hash:", vkHash);

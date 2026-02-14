/**
 * ZK Proof Generation using snarkjs
 * Client-side proof generation for compliance attributes
 */

// @ts-ignore - snarkjs types
import * as snarkjs from 'snarkjs';

export interface ZKProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
}

export interface ProofInput {
  attributeType: string;
  attributeValue: number;
  threshold: number;
  userSecret: string;
}

/**
 * Generate ZK proof for compliance attribute
 * This uses a simplified circuit for demo purposes
 */
export async function generateZKProof(
  input: ProofInput
): Promise<ZKProof> {
  try {
    console.log('Generating ZK proof for:', input.attributeType);

    // In production, you would:
    // 1. Load the circuit WASM and proving key
    // 2. Generate witness from input
    // 3. Generate proof using snarkjs

    // For demo, we create a realistic proof structure
    const proof = await generateMockGroth16Proof(input);

    console.log('ZK proof generated successfully');
    return proof;
  } catch (error) {
    console.error('ZK proof generation failed:', error);
    throw new Error('Failed to generate ZK proof');
  }
}

/**
 * Generate mock Groth16 proof with realistic structure
 * In production, replace with actual snarkjs.groth16.fullProve()
 */
async function generateMockGroth16Proof(
  input: ProofInput
): Promise<ZKProof> {
  // Simulate proof generation time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Generate deterministic proof based on input
  const seed = hashInput(input);

  // Generate proper 32-byte (64 hex chars) values for each component
  return {
    proof: {
      pi_a: [
        generateHex(seed, 64),
        generateHex(seed + 1, 64),
        padHex('1', 64), // Pad to 64 hex chars
      ],
      pi_b: [
        [generateHex(seed + 2, 64), generateHex(seed + 3, 64)],
        [generateHex(seed + 4, 64), generateHex(seed + 5, 64)],
        [padHex('1', 64), padHex('0', 64)], // Pad to 64 hex chars
      ],
      pi_c: [
        generateHex(seed + 6, 64),
        generateHex(seed + 7, 64),
        padHex('1', 64), // Pad to 64 hex chars
      ],
      protocol: 'groth16',
      curve: 'bn128',
    },
    publicSignals: [
      input.threshold.toString(),
      '1', // Proof is valid
      hashInput(input).toString(),
    ],
  };
}

/**
 * Verify ZK proof locally before submitting to chain
 */
export async function verifyZKProofLocally(
  proof: ZKProof
): Promise<boolean> {
  try {
    console.log('Verifying ZK proof locally...');

    // In production, you would:
    // 1. Load the verification key
    // 2. Verify using snarkjs.groth16.verify()

    // For demo, we validate proof structure
    const isValid =
      proof.proof.pi_a.length === 3 &&
      proof.proof.pi_b.length === 3 &&
      proof.proof.pi_c.length === 3 &&
      proof.publicSignals.length > 0;

    console.log('Local verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Local verification failed:', error);
    return false;
  }
}

/**
 * Convert ZK proof to bytes for on-chain submission (Stylus format)
 * Stylus expects uncompressed Groth16 proof:
 * - pi_a: G1 point (64 bytes: x, y)
 * - pi_b: G2 point (128 bytes: x0, x1, y0, y1)
 * - pi_c: G1 point (64 bytes: x, y)
 * Total: 256 bytes
 */
export function proofToBytes(proof: ZKProof): string {
  // For demo: Create a valid 256-byte proof structure
  // In production: Use actual snarkjs proof with proper encoding
  
  // Generate 256 bytes (8 * 32-byte field elements)
  const bytes = new Uint8Array(256);
  
  // Use proof data to seed the generation
  const seed = parseInt(proof.publicSignals[2] || '12345');
  
  // Fill with deterministic but valid-looking data
  for (let i = 0; i < 256; i++) {
    bytes[i] = ((seed + i) * 7) % 256;
  }
  
  // Ensure non-zero checksum (required by Stylus)
  bytes[0] = Math.max(1, bytes[0]);
  
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Estimate gas for proof verification
 */
export function estimateVerificationGas(proof: ZKProof): number {
  // Stylus Rust verifier: ~200k gas
  // Solidity verifier: ~2.5M gas
  const baseGas = 198543;

  // Add gas for public signals
  const signalGas = proof.publicSignals.length * 1000;

  return baseGas + signalGas;
}

/**
 * Get circuit info for attribute type
 */
export function getCircuitInfo(attributeType: string): {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
} {
  const circuits: Record<string, any> = {
    credit_score: {
      name: 'Credit Score Range Proof',
      description: 'Proves credit score is above threshold without revealing exact score',
      inputs: ['creditScore', 'threshold', 'userSecret'],
      outputs: ['isAboveThreshold', 'commitmentHash'],
    },
    accredited_investor: {
      name: 'Accredited Investor Proof',
      description: 'Proves accredited investor status per SEC requirements',
      inputs: ['netWorth', 'income', 'threshold', 'userSecret'],
      outputs: ['isAccredited', 'commitmentHash'],
    },
    kyc_verified: {
      name: 'KYC Verification Proof',
      description: 'Proves KYC completion without revealing identity',
      inputs: ['kycStatus', 'verificationDate', 'userSecret'],
      outputs: ['isVerified', 'commitmentHash'],
    },
    us_person: {
      name: 'US Person Status Proof',
      description: 'Proves US person status for regulatory compliance',
      inputs: ['countryCode', 'residencyStatus', 'userSecret'],
      outputs: ['isUSPerson', 'commitmentHash'],
    },
  };

  return (
    circuits[attributeType] || {
      name: 'Unknown Circuit',
      description: 'Circuit not found',
      inputs: [],
      outputs: [],
    }
  );
}

/**
 * Helper: Hash input for deterministic proof generation
 */
function hashInput(input: ProofInput): number {
  const str = JSON.stringify(input);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Helper: Generate deterministic hex string
 */
function generateHex(seed: number, length: number): string {
  let hex = '';
  let current = seed;
  for (let i = 0; i < length; i++) {
    current = (current * 1103515245 + 12345) & 0x7fffffff;
    hex += (current % 16).toString(16);
  }
  return '0x' + hex;
}

/**
 * Helper: Pad hex string to specified length (without 0x prefix)
 */
function padHex(value: string, length: number): string {
  // Remove 0x if present
  const cleanValue = value.startsWith('0x') ? value.slice(2) : value;
  // Pad with zeros to reach desired length
  return '0x' + cleanValue.padStart(length, '0');
}

/**
 * Production implementation guide:
 * 
 * 1. Create circuits using circom:
 *    ```circom
 *    template CreditScoreProof() {
 *      signal input creditScore;
 *      signal input threshold;
 *      signal input userSecret;
 *      signal output isAboveThreshold;
 *      signal output commitmentHash;
 *      
 *      isAboveThreshold <== creditScore >= threshold;
 *      commitmentHash <== Poseidon([creditScore, userSecret]);
 *    }
 *    ```
 * 
 * 2. Compile circuits:
 *    ```bash
 *    circom circuit.circom --r1cs --wasm --sym
 *    ```
 * 
 * 3. Generate proving/verification keys:
 *    ```bash
 *    snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey
 *    snarkjs zkey export verificationkey circuit_0000.zkey verification_key.json
 *    ```
 * 
 * 4. Use in production:
 *    ```typescript
 *    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
 *      input,
 *      'circuit.wasm',
 *      'circuit_0000.zkey'
 *    );
 *    ```
 */

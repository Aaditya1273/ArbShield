/**
 * ArbShield Contract Configuration
 * Deployed and verified contracts on Arbitrum Sepolia
 */

export const CONTRACTS = {
  // Stylus Rust Verifier Contract (ZK Proof Verification)
  ZK_VERIFIER: "0xa2d6642f1f307a8144349d6fe2188bf764a08253" as const,
  
  // Compliance Registry (stores verified attributes)
  COMPLIANCE_REGISTRY: "0x464D37393C8D3991b493DBb57F5f3b8c31c7Fa60" as const,
  
  // Mock RWA Token (for demo BUIDL portal)
  MOCK_BUIDL: "0x15Ef1E2E5899dBc374e5D7e147d57Fd032912eDC" as const,
  
  // Passkey Registry (multi-device passkey management)
  PASSKEY_REGISTRY: "0xe047C063A0ed4ec577fa255De3456856e4455087" as const,
  
  // Passkey Verifier (RIP-7212 precompile)
  PASSKEY_VERIFIER: "0x0000000000000000000000000000000000000100" as const, // RIP-7212 address
} as const;

/**
 * Compliance Attribute Types
 */
export const COMPLIANCE_ATTRIBUTES = {
  CREDIT_SCORE: "credit_score",
  ACCREDITED_INVESTOR: "accredited_investor",
  KYC_VERIFIED: "kyc_verified",
  US_PERSON: "us_person",
  AGE_VERIFICATION: "age_verification",
} as const;

/**
 * Arbitrum Sepolia Chain Configuration for Wagmi/Viem
 */
export const ARBITRUM_SEPOLIA = {
  id: 421614,
  name: "Arbitrum Sepolia",
  network: "arbitrum-sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://sepolia-rollup.arbitrum.io/rpc"] },
    public: { http: ["https://sepolia-rollup.arbitrum.io/rpc"] },
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://sepolia.arbiscan.io",
    },
  },
  testnet: true,
} as const;

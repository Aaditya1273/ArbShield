/**
 * ArbShield Contract Configuration
 * Deployed and verified contracts on Arbitrum Sepolia
 */

export const CONTRACTS = {
  // Stylus Rust Verifier Contract (ZK Proof Verification)
  ZKVerifier: "0x0000000000000000000000000000000000000000" as const, // TODO: Deploy
  
  // Compliance Registry (stores verified attributes)
  ComplianceRegistry: "0x0000000000000000000000000000000000000000" as const, // TODO: Deploy
  
  // Mock RWA Token (for demo BUIDL portal)
  MockBUIDL: "0x0000000000000000000000000000000000000000" as const, // TODO: Deploy
  
  // Passkey Verifier (RIP-7212 precompile)
  PasskeyVerifier: "0x0000000000000000000000000000000000000100" as const, // RIP-7212 address
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

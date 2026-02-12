/**
 * LiquidMesh Contract Configuration
 * Deployed and verified contracts on Somnia Testnet
 */

export const CONTRACTS = {
  WrappedSTT: "0x9e1B4FbB45F30b0628e4C406A6F4Eec1fadb54E1" as const,
  MockUSDC: "0x758dA18F8424f637f788a0CD0DAF8407069D380b" as const,
  LiquidityVault: "0x28205BB97e1BEe146E0b095D3cf62433D9bAb47d" as const,
  AgentExecutor: "0x5e639e2F345577514aFA0159AEdDf0A832e4139f" as const,
} as const;

/**
 * Token configurations
 */
export const TOKENS = {
  WSTT: {
    address: CONTRACTS.WrappedSTT,
    symbol: "wSTT",
    decimals: 18,
    name: "Wrapped STT",
  },
  USDC: {
    address: CONTRACTS.MockUSDC,
    symbol: "USDC",
    decimals: 6,
    name: "Mock USDC",
  },
} as const;

/**
 * Somnia Testnet Chain Configuration for Wagmi/Viem
 */
export const SOMNIA_TESTNET = {
  id: 50312,
  name: "Somnia Testnet",
  network: "somnia-testnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network"] },
    public: { http: ["https://dream-rpc.somnia.network"] },
  },
  blockExplorers: {
    default: {
      name: "Shannon Explorer",
      url: "https://shannon-explorer.somnia.network",
    },
  },
} as const;

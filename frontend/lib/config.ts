import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { env } from "@/env";
import { ARBITRUM_SEPOLIA } from "@/lib/contracts";

// Dynamic chain selection based on environment
export const getDefaultChain = () => {
  return env.NEXT_PUBLIC_CHAIN_ID === "421614" ? ARBITRUM_SEPOLIA : ARBITRUM_SEPOLIA;
};

// Chain configuration
export const chains = [ARBITRUM_SEPOLIA];
export const supportedChains = [ARBITRUM_SEPOLIA];

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [ARBITRUM_SEPOLIA],
  transports: {
    [ARBITRUM_SEPOLIA.id]: http(ARBITRUM_SEPOLIA.rpcUrls.default.http[0]),
  },
});

import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { env } from "@/env";
import { SOMNIA_TESTNET } from "@/lib/contracts";

// Dynamic chain selection based on environment
export const getDefaultChain = () => {
  return env.NEXT_PUBLIC_CHAIN_ID === "50312" ? SOMNIA_TESTNET : SOMNIA_TESTNET;
};

// Chain configuration
export const chains = [SOMNIA_TESTNET];
export const supportedChains = [SOMNIA_TESTNET];

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [SOMNIA_TESTNET],
  transports: {
    [SOMNIA_TESTNET.id]: http(SOMNIA_TESTNET.rpcUrls.default.http[0]),
  },
});

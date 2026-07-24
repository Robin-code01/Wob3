"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { config } from "../lib/auth/config";
import { sepolia } from "wagmi/chains";
import { SessionProvider } from "next-auth/react";
import { SiweAdapterProvider } from "../lib/auth/siwe-adapter";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <SiweAdapterProvider>
            <RainbowKitProvider initialChain={sepolia}>
              {children}
            </RainbowKitProvider>
          </SiweAdapterProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}

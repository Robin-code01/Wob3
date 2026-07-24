"use client";

import { useState, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  AuthenticationStatus,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, useAccount } from "wagmi";
import { getAccount } from "@wagmi/core";
import { config } from "../lib/auth/config";
import { sepolia } from "wagmi/chains";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { createSiweMessage } from "viem/siwe";

const queryClient = new QueryClient();

function RainbowKitAuthProvider({ children }: { children: React.ReactNode }) {
  const { status: sessionStatus, data: session } = useSession();
  const { address: connectedAddress } = useAccount();
  const [authStatus, setAuthStatus] = useState<AuthenticationStatus>("unauthenticated");

  const status: AuthenticationStatus = useMemo(() => {
    if (sessionStatus === "loading") return "loading";
    if (sessionStatus === "authenticated") return "authenticated";
    return authStatus;
  }, [sessionStatus, authStatus]);

  const authenticationAdapter = useMemo(() => {
    return createAuthenticationAdapter({
      // 1. Fetch nonce from Django API
      getNonce: async () => {
        console.log("➡️ [1/3] RainbowKit getNonce triggered");
        const address = connectedAddress || getAccount(config).address;

        if (!address) {
          console.error("❌ getNonce error: Wallet address is not available yet.");
          throw new Error("Wallet not connected");
        }

        try {
          const url = `https://wob3.onrender.com/web3/get_nonce/?address=${address}`;
          const response = await fetch(url);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data?.detail || data?.error || "Failed to fetch nonce");
          }

          const nonce = typeof data === "string" ? data : data.nonce || data.detail;
          console.log("Fetched Nonce:", nonce);
          return nonce;
        } catch (err) {
          console.error("❌ Error in getNonce:", err);
          throw err;
        }
      },

      // 2. Format as EIP-4361 SIWE message containing 'Nonce: <nonce>'
      createMessage: ({ nonce, address, chainId }) => {
        console.log("➡️ [2/3] RainbowKit createMessage triggered with nonce:", nonce);
        return createSiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in with Ethereum to NFTeach",
          uri: window.location.origin,
          version: "1",
          chainId,
          nonce,
        });
      },

      // 3. Verify signature with Django via NextAuth
      verify: async ({ message, signature }) => {
        console.log("➡️ [3/3] RainbowKit verify triggered");

        const address = connectedAddress || getAccount(config).address;

        if (!address) {
          setAuthStatus("unauthenticated");
          return false;
        }

        try {
          const result = await signIn("credentials", {
            message,
            signature,
            address,
            redirect: false,
          });

          if (result?.error) {
            console.error("❌ NextAuth Authentication Failed:", result.error);
            setAuthStatus("unauthenticated");
            return false;
          }

          const authenticated = Boolean(result?.ok);
          console.log("Is Authenticated:", authenticated);
          setAuthStatus(authenticated ? "authenticated" : "unauthenticated");
          return authenticated;
        } catch (err) {
          console.error("❌ Error during verification:", err);
          setAuthStatus("unauthenticated");
          return false;
        }
      },

      signOut: async () => {
        await signOut({ redirect: false });
        setAuthStatus("unauthenticated");
      },
    });
  }, [connectedAddress]);

  return (
    <RainbowKitAuthenticationProvider
      adapter={authenticationAdapter}
      status={status}
    >
      <RainbowKitProvider initialChain={sepolia}>
        {children}
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <RainbowKitAuthProvider>{children}</RainbowKitAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}
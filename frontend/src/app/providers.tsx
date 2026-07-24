"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { status: sessionStatus } = useSession();
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
        const rawAddress = connectedAddress || getAccount(config).address;

        if (!rawAddress) {
          console.error("❌ getNonce error: Wallet address is not available yet.");
          throw new Error("Wallet not connected");
        }

        const address = rawAddress.toLowerCase();

        try {
          const url = `https://wob3.onrender.com/web3/get_nonce/?address=${address}`;
          console.log(`📡 Fetching nonce from Django: ${url}`);
          
          const response = await fetch(url, {
            headers: { "Accept": "application/json" },
          });
          const text = await response.text();
          console.log("📡 Nonce response status:", response.status, "body:", text);

          if (!response.ok) {
            throw new Error(`Failed to fetch nonce (${response.status}): ${text}`);
          }

          let data: any;
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }

          const nonce = typeof data === "string" ? data : data.nonce || data.detail || data.result;
          if (!nonce) {
            throw new Error("Nonce missing in Django response");
          }

          console.log("✅ Fetched Nonce:", nonce);
          return nonce;
        } catch (err) {
          console.error("❌ Error in getNonce:", err);
          throw err;
        }
      },

      // 2. Format as EIP-4361 SIWE message
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

      // 3. Verify signature via NextAuth -> Django & Redirect to /home
      verify: async ({ message, signature }) => {
        console.log("➡️ [3/3] RainbowKit verify triggered");

        const rawAddress = connectedAddress || getAccount(config).address;

        if (!rawAddress) {
          console.error("❌ Verify failed: Wallet address unavailable");
          setAuthStatus("unauthenticated");
          return false;
        }

        const address = rawAddress.toLowerCase();

        try {
          console.log("🔄 Triggering NextAuth signIn for address:", address);
          const result = await signIn("credentials", {
            message,
            signature,
            address,
            redirect: false,
          });

          if (result?.error) {
            console.error("❌ NextAuth Authentication Failed:", result.error);
            console.error("💡 Check your Next.js server terminal logs to see Django's exact response status and body!");
            setAuthStatus("unauthenticated");
            return false;
          }

          const authenticated = Boolean(result?.ok);
          console.log("✅ NextAuth Authentication Result:", authenticated);
          setAuthStatus(authenticated ? "authenticated" : "unauthenticated");

          if (authenticated) {
            router.push("/home");
          }

          return authenticated;
        } catch (err) {
          console.error("❌ Error during verification:", err);
          setAuthStatus("unauthenticated");
          return false;
        }
      },

      // Sign out & Redirect back to landing page
      signOut: async () => {
        await signOut({ redirect: false });
        setAuthStatus("unauthenticated");
        router.push("/");
      },
    });
  }, [connectedAddress, router]);

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
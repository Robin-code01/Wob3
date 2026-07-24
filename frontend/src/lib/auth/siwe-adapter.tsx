"use client";

import {
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
} from "@rainbow-me/rainbowkit";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useMemo } from "react";
import { SiweMessage } from "siwe";

const DJANGO_API_URL =
  process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000";

interface SiweAdapterProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  getSiweMessageOptions?: () => Record<string, unknown>;
}

export function SiweAdapterProvider({
  children,
  enabled,
  getSiweMessageOptions,
}: SiweAdapterProviderProps) {
  const { status } = useSession();

  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        createMessage: ({ address, chainId, nonce }) => {
          const defaultConfigurableOptions = {
            domain: window.location.host,
            statement: "Sign in with Ethereum to the app.",
            uri: window.location.origin,
            version: "1",
          };
          const unconfigurableOptions = {
            address,
            chainId,
            nonce,
          };
          const siweMessage = new SiweMessage({
            ...defaultConfigurableOptions,
            ...(getSiweMessageOptions?.() as Record<string, unknown>),
            ...unconfigurableOptions,
          });
          return siweMessage.prepareMessage();
        },
        getNonce: async () => {
          const response = await fetch(`${DJANGO_API_URL}/web3/get_nonce/`);
          if (!response.ok) throw new Error("Failed to get nonce");
          const data = await response.json();
          return data.nonce;
        },
        signOut: async () => {
          await signOut({ redirect: false });
        },
        verify: async ({ message, signature }) => {
          const parsed = new SiweMessage(message);
          const address = parsed.address;

          const response = await signIn("credentials", {
            message,
            signature,
            address: address.toLowerCase(),
            redirect: false,
          });
          return response?.ok ?? false;
        },
      }),
    [getSiweMessageOptions, status],
  );

  return (
    <RainbowKitAuthenticationProvider adapter={adapter} enabled={enabled} status={status}>
      {children}
    </RainbowKitAuthenticationProvider>
  );
}

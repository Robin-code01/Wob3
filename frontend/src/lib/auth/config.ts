"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import {
  sepolia,
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from "wagmi/chains";

const config = getDefaultConfig({
  appName: "NFTeach",
  projectId: "1f3347decfd24d0aae1e188f62d2d504",
  // Put Sepolia first as your primary chain
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, base],
  // Override default transports with fast, reliable public RPCs
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [mainnet.id]: http("https://cloudflare-eth.com"),
  },
  ssr: true,
});

export { config };
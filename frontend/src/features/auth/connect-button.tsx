"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export function ConnectButtonCustom() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              className: "opacity-0 pointer-events-none user-select-none",
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="h-9 bg-[#F8FAFC] text-[#0B0E14] hover:bg-[#0B0E14] hover:text-[#F8FAFC] transition-colors border border-[#0B0E14] px-4 py-2 font-mono text-xs font-semibold hover:cursor-pointer"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="h-9 bg-primary text-[#0B0E14] transition-colors border border-[#0B0E14] px-4 py-2 font-mono text-xs font-semibold"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="h-9 flex items-center gap-2 bg-[#F8FAFC] text-[#0B0E14] hover:bg-[#0B0E14] hover:text-[#F8FAFC] transition-colors border border-[#0B0E14] px-4 py-2 font-mono text-xs font-semibold"
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-5 h-5 overflow-hidden rounded-full"
                        style={{ background: chain.iconBackground }}
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="w-5 h-5"
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="h-9 bg-[#F8FAFC] text-[#0B0E14] hover:bg-[#0B0E14] hover:text-[#F8FAFC] transition-colors border border-[#0B0E14] px-4 py-2 font-mono text-xs font-semibold"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

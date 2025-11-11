"use client";

import SectionHeader from "../../components/SectionHeader";
import { useWallet } from "@/lib/useWallet";

export default function SettingsPage() {
  const { walletAddress, connectWallet, isConnecting, error } = useWallet();

  const shortAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        description="Manage your wallet connection, encryption keys, and preferences."
      />

      <div className="grid gap-6 max-w-2xl">
        {/* Wallet Section */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold text-lg">Wallet</h3>

          <div className="mt-2 text-sm text-white/80">
            {walletAddress ? (
              <>
                <p>
                  <span className="text-white/60">Connected Wallet:</span>{" "}
                  <span className="font-mono text-white">
                    {shortAddress(walletAddress)}
                  </span>
                </p>
              </>
            ) : (
              <p>Not connected</p>
            )}
          </div>

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="mt-3 rounded-md bg-white text-black px-3 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {walletAddress
              ? "Reconnect Wallet"
              : isConnecting
              ? "Connecting..."
              : "Connect Wallet"}
          </button>

          {error && (
            <p className="mt-2 text-sm text-red-400 bg-red-500/20 px-3 py-1 rounded-md">
              {error}
            </p>
          )}
        </section>

        {/* Encryption Section (Placeholder for future feature) */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold text-lg">Encryption</h3>
          <div className="mt-2 text-sm text-white/80">
            No recovery email set
          </div>
          <button className="mt-3 rounded-md border border-white/20 px-3 py-2 text-sm hover:bg-white/10">
            Set Recovery Email
          </button>
        </section>
      </div>
    </div>
  );
}

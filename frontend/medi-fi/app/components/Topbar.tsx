"use client";

import Link from "next/link";
import { useState } from "react";
import { useWallet } from "@/lib/useWallet"; // 👈 import your wallet hook

export function Topbar() {
  const [open, setOpen] = useState(false);
  const { walletAddress, connectWallet, isConnecting, error } = useWallet();

  const shortAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/10 bg-black/60 sticky top-0 z-40">
      {/* Left: Logo + Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden rounded-md border border-white/20 px-3 py-2 text-sm"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle navigation"
        >
          Menu
        </button>
        <Link href="/dashboard" className="md:hidden text-lg font-semibold">
          MediFi
        </Link>
      </div>

      {/* Center: Search bar */}
      <div className="flex items-center gap-3">
        <input
          placeholder="Search"
          className="h-9 w-44 md:w-64 rounded-md bg-white/5 px-3 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>

      {/* Right: Wallet button + Profile */}
      <div className="flex items-center gap-3">
        {walletAddress ? (
          <div className="rounded-md border border-white/20 bg-white/10 px-3 py-1 text-sm font-mono text-white/80">
            {shortAddress(walletAddress)}
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="rounded-md bg-white text-black px-3 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
        <div className="h-8 w-8 rounded-full bg-white/90 text-black grid place-items-center text-sm font-semibold">
          M
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="absolute top-16 left-0 right-0 md:hidden bg-black/95 border-b border-white/10">
          <nav className="p-2 grid">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/records", label: "Records" },
              { href: "/share", label: "Share Access" },
              { href: "/doctors", label: "Doctors" },
              { href: "/settings", label: "Settings" },
            ].map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="px-3 py-2 text-sm hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {i.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Optional: show wallet error */}
      {error && (
        <p className="absolute top-16 right-4 text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-md">
          {error}
        </p>
      )}
    </header>
  );
}

export default Topbar;

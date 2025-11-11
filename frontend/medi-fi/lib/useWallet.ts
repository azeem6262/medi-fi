"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setError(null);

    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask not detected. Please install it first.");
      return;
    }

    try {
      setIsConnecting(true);

      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setWalletAddress(ethers.getAddress(accounts[0]));
      }

      // Listen for account change
      window.ethereum.on?.("accountsChanged", (accs: string[]) => {
        setWalletAddress(accs.length > 0 ? ethers.getAddress(accs[0]) : null);
      });
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(ethers.getAddress(accounts[0]));
          }
        })
        .catch((err) => console.error("Auto-connect error:", err));
    }
  }, []);

  return { walletAddress, isConnecting, connectWallet, error };
}

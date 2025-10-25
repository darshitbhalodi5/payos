"use client";

import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { Wallet, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [copied, setCopied] = useState(false);

  // handle wallet connect using privy
  const handleWalletConnect = () => {
    if (authenticated) {
      logout();
    } else {
      login();
    }
  };

  // format address to 6 characters and last 4 characters
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // handle copy wallet address
  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the wallet connect/logout
    if (user?.wallet?.address) {
      try {
        await navigator.clipboard.writeText(user.wallet.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  return (
    <nav className="bg-background border-b border-foreground sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <Link href="/">
              <Image
                src="/payos.svg"
                alt="Payos Logo"
                width={100}
                height={100}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Wallet Connect Button - Always visible */}
          <div className="flex items-center">
            {ready ? (
              <div className="flex items-center gap-2">
                {authenticated && user?.wallet?.address ? (
                  <>
                    <button
                      onClick={handleWalletConnect}
                      className="flex items-center gap-2 px-4 py-1 rounded-xl font-semibold bg-accent text-background shadow-sm hover:bg-accent/80 transition-colors duration-150 text-sm md:text-base md:px-6 focus:outline-none focus:ring-2 focus:ring-accent/50 border border-accent/20 hover:border-accent"
                    >
                      <span className="sm:inline tracking-wide">
                        {formatAddress(user.wallet.address)}
                      </span>
                    </button>
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50"
                      title={copied ? "Copied!" : "Copy address"}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-foreground" />
                      ) : (
                        <Copy className="w-4 h-4 text-foreground" />
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleWalletConnect}
                    className="flex items-center gap-2 px-4 py-1 rounded-xl font-semibold bg-accent text-background shadow-sm hover:bg-accent/80 transition-colors duration-150 text-sm md:text-base md:px-6 focus:outline-none focus:ring-2 focus:ring-accent/50 border border-accent/20 hover:border-accent"
                  >
                    <Wallet className="w-5 h-5 color-foreground" />
                    <span className="hidden sm:inline tracking-wide">Connect Wallet</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-muted/50 text-muted text-sm md:text-base animate-pulse">
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

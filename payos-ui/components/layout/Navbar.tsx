"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import Image from "next/image";
import { Wallet, MenuIcon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <nav className="bg-background border-b border-foreground/20 sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <Image
              src="/payos.svg"
              alt="Payos Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/payroll"
                className="flex items-center gap-2 px-4 py-1 rounded-xl font-semibold text-foreground hover:text-accent shadow-sm hover:bg-foreground/10 transition-colors duration-150 text-sm md:text-base md:px-6 focus:outline-none focus:ring-2 focus:ring-accent/50 border border-transparent hover:border-accent/20 "
              >
                Payroll
              </Link>
              <Link
                href="/split"
                className="flex items-center gap-2 px-4 py-1 rounded-xl font-semibold text-foreground hover:text-accent shadow-sm hover:bg-foreground/10 transition-colors duration-150 text-sm md:text-base md:px-6 focus:outline-none focus:ring-2 focus:ring-accent/50 border border-transparent hover:border-accent/20"
              >
                Split
              </Link>
            </div>
          </div>

          {/* Wallet Connect Button - Always visible */}
          <div className="flex items-center">
            {ready ? (
              <button
                onClick={handleWalletConnect}
                className="flex items-center gap-2 px-4 py-1 rounded-xl font-semibold bg-accent text-background shadow-sm hover:bg-accent/80 transition-colors duration-150 text-sm md:text-base md:px-6 focus:outline-none focus:ring-2 focus:ring-accent/50 border border-accent/20 hover:border-accent"
              >
                {authenticated ? (
                  <>
                    <span className="sm:inline tracking-wide">
                      {user?.wallet?.address ? formatAddress(user.wallet.address) : "Connected"}
                    </span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 color-foreground" />
                    <span className="hidden sm:inline tracking-wide">Connect Wallet</span>
                  </>
                )}
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-muted/50 text-muted text-sm md:text-base animate-pulse">
                Loading...
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="font-semibold bg-accent text-background transition-colors text-sm md:text-base md:px-6"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 border-t border-foreground/20">
              <Link
                href="/payroll"
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-foreground hover:text-accent shadow-sm hover:bg-foreground/10 transition-colors duration-150 text-base focus:outline-none focus:ring-2 focus:ring-accent/50 border border-transparent hover:border-accent/20"
              >
                Payroll
              </Link>
              <Link
                href="/split"
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-foreground hover:text-accent shadow-sm hover:bg-foreground/10 transition-colors duration-150 text-base focus:outline-none focus:ring-2 focus:ring-accent/50 border border-transparent hover:border-accent/20"
              >
                Split
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

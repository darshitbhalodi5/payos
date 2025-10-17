"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleWalletConnect = () => {
    if (authenticated) {
      logout();
    } else {
      login();
    }
  };

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
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#"
                className="text-foreground hover:text-accent transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-muted hover:text-accent transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-muted hover:text-accent transition-colors"
              >
                About
              </a>
            </div>
          </div>

          {/* Wallet Connect Button - Always visible */}
          <div className="flex items-center">
            {ready ? (
              <button
                onClick={handleWalletConnect}
                className="bg-accent text-background px-3 py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors text-sm md:px-4 md:text-base"
              >
                {authenticated ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="hidden sm:inline">
                      {user?.wallet?.address
                        ? formatAddress(user.wallet.address)
                        : "Connected"}
                    </span>
                    <span className="sm:hidden">Wallet</span>
                  </div>
                ) : (
                  <>
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                  </>
                )}
              </button>
            ) : (
              <div className="bg-muted/20 text-muted px-3 py-2 rounded-lg text-sm md:px-4 md:text-base">
                Loading...
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-accent transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-foreground/20">
              <a
                href="#"
                className="text-foreground hover:text-accent block px-3 py-2 rounded-md text-base font-medium"
              >
                Home
              </a>
              <a
                href="#"
                className="text-muted hover:text-accent block px-3 py-2 rounded-md text-base font-medium"
              >
                Features
              </a>
              <a
                href="#"
                className="text-muted hover:text-accent block px-3 py-2 rounded-md text-base font-medium"
              >
                About
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

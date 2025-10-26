'use client';

import Image from 'next/image';
import SupportedChains from '@/components/homepage/SupportedChains';
import SupportedTokens from '@/components/homepage/SupportedTokens';
import HowItWorks from '@/components/homepage/HowItWorks';
import SectionSeparator from '@/components/homepage/SectionSeparator';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react'

export default function HomePage() {

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
            <div className="max-w-4xl w-full mx-4">
                {/* Hero Section */}
                <div className="text-center mb-16 pt-12">
                    <Image
                        src="/payos.ico"
                        alt="Payos Logo"
                        width={24}
                        height={24}
                        className="w-24 h-24 object-contain border-2 border-white rounded-full mx-auto mb-4 flex items-center justify-center"
                    />
                    <h1 className="text-7xl font-black mb-6 tracking-tight text-white">
                        Payos
                    </h1>
                    <p className="text-lg mb-8 font-light max-w-3xl mx-auto">
                        Split expenses across any chain with seamless cross-chain transfers and stable coin settlement
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: 'var(--yellow)' }}>4</div>
                            <div className="text-sm opacity-80">Supported Chains</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: 'var(--yellow)' }}>3</div>
                            <div className="text-sm opacity-80">Token Types</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: 'var(--yellow)' }}>0</div>
                            <div className="text-sm opacity-80">Registration Fee</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: 'var(--yellow)' }}>∞</div>
                            <div className="text-sm opacity-80">Split Possibilities</div>
                        </div>
                    </div>

                    {/* Hero CTA Button */}
                    <div className="mb-8">
                        <Link
                            href="/split"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                        >
                            <span>Start Splitting Bills</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex items-center justify-center gap-8 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--yellow)' }}></div>
                            <span className="text-white/60">No Registration Required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--yellow)' }}></div>
                            <span className="text-white/60">Connect Wallet & Start</span>
                        </div>
                    </div>
                </div>

                <SectionSeparator variant="default" />

                {/* How It Works Section */}
                <div className="mb-2">
                    <HowItWorks />
                </div>

                <SectionSeparator variant="default" />

                {/* Supported Chains Section */}
                <div className="mb-2">
                    <SupportedChains />
                </div>

                <SectionSeparator variant="default" />

                {/* Supported Tokens Section */}
                <div className="mb-2">
                    <SupportedTokens />
                </div>

            </div>
        </div>
    );
}
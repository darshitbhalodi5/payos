'use client';

import Image from 'next/image';
import { SUPPORTED_CHAINS } from '@/lib/chain-config';

export default function SupportedChains() {
    return (
        <div className="w-full">
            <h2 className="text-4xl font-bold text-center mb-8">
                Supported Chains
            </h2>

            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
                    {SUPPORTED_CHAINS.map((chain) => (
                        <div key={chain.id} className="flex flex-col items-center gap-3 group flex-shrink-0">
                            <div
                                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center p-2 sm:p-3 transition-all duration-300 group-hover:scale-110"
                                style={{
                                    backgroundColor: '#87CEEB', // Light blue background
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <Image
                                    src={`/${chain.logo}`}
                                    alt={chain.name}
                                    width={32}
                                    height={32}
                                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                                />
                            </div>

                            <div className="text-center">
                                <h3 className="text-xs sm:text-sm font-medium leading-tight">
                                    {chain.name.split(' ').map((part, index) => (
                                        <span key={index}>
                                            {part}
                                            {index === 0 && chain.name.split(' ').length > 1 && <br />}
                                        </span>
                                    ))}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

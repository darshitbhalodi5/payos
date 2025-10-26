'use client';

import { Zap, Shield, Globe, Layers } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            step: "1",
            icon: Layers,
            title: "Create",
            description: "Set up a bill split with contributors and target amount"
        },
        {
            step: "2",
            icon: Globe,
            title: "Contribute",
            description: "Contributors can pay from any supported chain"
        },
        {
            step: "3",
            icon: Zap,
            title: "Settlement",
            description: "Automatically settles split when target is reached"
        },
        {
            step: "4",
            icon: Shield,
            title: "Receive",
            description: "Recipient receives preffered tokens on preferred chain"
        }
    ];

    return (
        <div className="mb-8">
            {/* Section Header */}
            <div className="text-center mb-6">
                <h2 className="text-4xl font-bold mb-4">
                    How Payos Works
                </h2>
                <p className="text-lg font-light">
                    Experience seamless cross-chain bill splitting in just 4 simple steps
                </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((item, index) => (
                    <div key={index} className="group relative h-full">
                        {/* Card with equal height */}
                        <div className="relative h-full bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col">
                            {/* Step Number & Icon */}
                            <div className="relative mb-6 flex-shrink-0">
                                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center border-4 border-white/20 shadow-xl group-hover:scale-110 transition-all duration-300" style={{ backgroundColor: 'var(--accent)' }}>
                                    <item.icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Step Number Badge */}
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold" style={{ color: '#ffffff' }}>{item.step}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center flex-grow flex flex-col justify-center">
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

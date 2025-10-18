'use client';

import Image from 'next/image';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto" style={{ backgroundColor: 'var(--background)' }}>
            <div className="border-t py-4 md:py-5.5 lg:py-7" style={{ borderColor: 'var(--foreground)' }}>
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Brand Section - Left on desktop */}
                        <div className="flex items-center justify-center md:justify-start space-x-3">
                            <Image
                                src="/payos.svg"
                                alt="Payos Logo"
                                width={50}
                                height={50}
                                className="object-contain"
                            />
                        </div>

                        {/* Copyright - Right on desktop */}
                        <div className="text-sm text-center md:text-right" style={{ color: 'var(--muted)' }}>
                            © {currentYear} Payos. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
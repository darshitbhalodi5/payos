'use client';

interface SectionSeparatorProps {
    variant?: 'default';
}

export default function SectionSeparator({ variant = 'default' }: SectionSeparatorProps) {
    const renderSeparator = () => {
        switch (variant) {
            default:
                return (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center space-x-4 w-full max-w-md">
                            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--muted)' }}></div>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--yellow)' }}></div>
                            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--muted)' }}></div>
                        </div>
                    </div>
                );
        }
    };

    return renderSeparator();
}

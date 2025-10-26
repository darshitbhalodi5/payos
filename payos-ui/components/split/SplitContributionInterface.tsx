'use client';

import ContributionFlow from './ContributionFlow';

interface SplitContributionInterfaceProps {
  splitId: string;
  onBack: () => void;
  onContributionComplete: () => void;
}

export default function SplitContributionInterface({ 
  splitId, 
  onBack, 
  onContributionComplete 
}: SplitContributionInterfaceProps) {
  return (
    <ContributionFlow
      splitId={splitId}
      onBack={onBack}
      onContributionComplete={onContributionComplete}
    />
  );
}
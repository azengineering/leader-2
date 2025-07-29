import { Suspense } from 'react';
import { Metadata } from 'next';
import { RateLeaderContent } from '@/components/rate-leader-client';
import { getLeaderById } from '@/data/leaders';

export async function generateMetadata({ searchParams }: { searchParams: { leader?: string } }): Promise<Metadata> {
  const leaderId = searchParams.leader;

  if (leaderId) {
    const leader = await getLeaderById(leaderId);
    if (leader) {
      return {
        title: `Rate ${leader.name} | Janmat-Voice`,
        description: `Rate and review ${leader.name}, a political leader from the ${leader.partyName} party, representing the ${leader.constituency} constituency.`,
      };
    }
  }

  return {
    title: 'Rate Your Leader | Janmat-Voice',
    description: 'Find and rate your political leaders. Search for leaders by name, constituency, or election type.',
  };
}

export default function RateLeaderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RateLeaderContent />
    </Suspense>
  );
}

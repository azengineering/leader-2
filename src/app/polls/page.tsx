import { Suspense } from 'react';
import { Metadata } from 'next';
import { PollsPageContent, PollsSkeleton } from '@/components/polls-client';

export const metadata: Metadata = {
  title: 'Active Polls and Surveys | Janmat-Voice',
  description: 'Participate in active polls and surveys about political leaders and issues.',
};

export default function PollsPage() {
    return (
        <Suspense fallback={<PollsSkeleton />}>
            <PollsPageContent />
        </Suspense>
    );
}

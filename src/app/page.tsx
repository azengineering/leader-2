'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import HowItWorks from '@/components/how-it-works';
import WhyItMatters from '@/components/why-it-matters';
import FeaturedLeaders from '@/components/featured-leaders';
import { getLeaders, type Leader } from '@/data/leaders';

const LoadingScreen = dynamic(() => import('@/components/loading-screen'), { ssr: false });

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [topRatedLeaders, setTopRatedLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const allLeaders = await getLeaders();
      const sortedLeaders = [...allLeaders].sort((a, b) => b.rating - a.rating).slice(0, 4);
      setTopRatedLeaders(sortedLeaders);
    };

    fetchLeaders();
    
    if (sessionStorage.getItem('hasVisitedPolitiRate')) {
      setIsLoading(false);
    } else {
      sessionStorage.setItem('hasVisitedPolitiRate', 'true');
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <FeaturedLeaders leaders={topRatedLeaders} />
        <WhyItMatters />
      </main>
      <Footer />
    </div>
  );
}

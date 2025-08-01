'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import HowItWorks from '@/components/how-it-works';
import WhyItMatters from '@/components/why-it-matters';
import FeaturedLeaders from '@/components/featured-leaders';
import CallToAction from '@/components/call-to-action';
import CommunityImpactShowcase from '@/components/community-impact-showcase';
import { getLeaders, type Leader } from '@/data/leaders';
import { useWelcomePageLoading } from '@/context/welcome-page-loading-context';

const LoadingScreen = dynamic(() => import('@/components/loading-screen'), { ssr: false });

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [topRatedLeaders, setTopRatedLeaders] = useState<Leader[]>([]);
  const { setWelcomePageLoading } = useWelcomePageLoading();

  useEffect(() => {
    const fetchLeaders = async () => {
      const allLeaders = await getLeaders(20);
      const sortedLeaders = [...allLeaders].sort((a, b) => b.rating - a.rating);
      setTopRatedLeaders(sortedLeaders);
    };

    fetchLeaders();
    
    if (sessionStorage.getItem('hasVisitedPoliticsRate')) {
      setIsLoading(false);
    } else {
      sessionStorage.setItem('hasVisitedPoliticsRate', 'true');
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 4000); // Revert to original timeout, banner will be controlled by context

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    setWelcomePageLoading(isLoading);
  }, [isLoading, setWelcomePageLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Home",
            "url": "https://www.janmat-voice.com"
          })
        }}
      />
      <Header />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <FeaturedLeaders leaders={topRatedLeaders} />
        <WhyItMatters />
        <CallToAction />
        <CommunityImpactShowcase />
      </main>
      <Footer />
    </div>
  );
}

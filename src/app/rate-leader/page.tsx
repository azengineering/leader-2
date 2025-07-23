'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import LeaderList from '@/components/leader-list';
import LeaderCard from '@/components/leader-card';
import { getLeaders, getLeaderById, type Leader } from '@/data/leaders';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/language-context';
import SearchFilter from '@/components/search-filter';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import FeaturedLeaders from '@/components/featured-leaders';
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ElectionType = 'national' | 'state' | 'panchayat' | '';

export default function RateLeaderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RateLeaderContent />
    </Suspense>
  );
}

function RateLeaderContent() {
  const { t } = useLanguage();
  const [allLeaders, setAllLeaders] = useState<Leader[]>([]);
  const [filteredLeaders, setFilteredLeaders] = useState<Leader[]>([]);
  const [topRatedLeaders, setTopRatedLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const leadersPerPage = 10;
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [manualFilterActive, setManualFilterActive] = useState(false);
  const [specificLeaderFromQuery, setSpecificLeaderFromQuery] = useState<Leader | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    const leaderIdFromQuery = searchParams.get('leader');
    if (leaderIdFromQuery && !isLoading) {
      const element = document.getElementById(`leader-${leaderIdFromQuery}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the card
        element.classList.add('shadow-2xl', 'shadow-primary/50', 'ring-2', 'ring-primary');
        setTimeout(() => {
            element.classList.remove('shadow-2xl', 'shadow-primary/50', 'ring-2', 'ring-primary');
        }, 3000);
      }
    }
  }, [searchParams, isLoading]);

  useEffect(() => {
    // Only run initial/user-based filtering if data has been loaded AND no manual filter is active
    if (hasLoadedInitialData && !manualFilterActive) { 
      const candidateNameFromQuery = searchParams.get('candidateName');
      let leadersToShow = allLeaders;

      if (candidateNameFromQuery) {
        const lowerCaseQuery = candidateNameFromQuery.toLowerCase();
        const specificLeaders = allLeaders.filter(leader => 
          leader.name.toLowerCase() === lowerCaseQuery
        );
        if (specificLeaders.length > 0) {
          leadersToShow = specificLeaders;
        }
      } else if (user) {
        const { mpConstituency, mlaConstituency, panchayat, state } = user;
        
        const lowerMp = mpConstituency?.trim().toLowerCase();
        const lowerMla = mlaConstituency?.trim().toLowerCase();
        const lowerPanchayat = panchayat?.trim().toLowerCase();

        const locationBasedLeaders = allLeaders.filter(leader => {
          const leaderConstituency = leader.constituency.trim().toLowerCase();

          if (leader.electionType === 'national' && lowerMp && leaderConstituency === lowerMp) {
            return true;
          }
          if (leader.electionType === 'state' && lowerMla && leaderConstituency === lowerMla) {
            return true;
          }
          if (leader.electionType === 'panchayat' && lowerPanchayat && leaderConstituency === lowerPanchayat) {
            return true;
          }

          return false;
        });

        const uniqueLeaders = Array.from(new Set(locationBasedLeaders.map(l => l.id))).map(id => locationBasedLeaders.find(l => l.id === id)!);
        
        if (uniqueLeaders.length > 0) {
            leadersToShow = uniqueLeaders;
        } else {
            leadersToShow = [];
        }
      }
      
      // Sort leaders by election type
      const electionTypeOrder = { national: 1, state: 2, panchayat: 3 };
      const sortedByElection = leadersToShow.sort((a, b) => {
        const orderA = electionTypeOrder[a.electionType] || 4;
        const orderB = electionTypeOrder[b.electionType] || 4;
        return orderA - orderB;
      });

      setFilteredLeaders(sortedByElection);
      setCurrentPage(1);
    }
  }, [user, searchParams, hasLoadedInitialData, manualFilterActive, allLeaders]);

  // New useEffect for initial data fetching and specific leader handling
  useEffect(() => {
    if (!hasLoadedInitialData) {
      const fetchInitialLeaders = async () => {
        setIsLoading(true);
        const leadersFromStorage = await getLeaders();
        setAllLeaders(leadersFromStorage);
        setFilteredLeaders(leadersFromStorage); // Initially show all leaders
        const topLeaders = await getLeaders(20);
        const sortedTopLeaders = [...topLeaders].sort((a, b) => b.rating - a.rating);
        setTopRatedLeaders(sortedTopLeaders);

        const leaderIdFromQuery = searchParams.get('leader');
        if (leaderIdFromQuery) {
          const specific = await getLeaderById(leaderIdFromQuery);
          setSpecificLeaderFromQuery(specific);
        }

        setIsLoading(false);
        setHasLoadedInitialData(true); // Mark data as loaded
      };
      fetchInitialLeaders();
    }
  }, [hasLoadedInitialData, searchParams]);

  const handleAddLeaderClick = () => {
    if (user) {
      router.push('/add-leader');
    } else {
      setShowLoginDialog(true);
    }
  };

  const handleSearch = async (filters: { electionType: ElectionType; searchTerm: string; candidateName: string; }) => {
    setIsLoading(true);
    const { electionType, searchTerm, candidateName } = filters;

    // Determine if a manual filter is active
    const isManualFilterApplied = electionType !== '' || searchTerm !== '' || candidateName !== '';
    setManualFilterActive(isManualFilterApplied);

    // Always fetch fresh data on search
    const currentLeaders = await getLeaders();
    setAllLeaders(currentLeaders);

    const trimmedCandidateName = candidateName.trim().toLowerCase();
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    let results = currentLeaders;

    if (trimmedCandidateName) {
      results = currentLeaders.filter(leader => 
        leader.name.toLowerCase().includes(trimmedCandidateName)
      );
    } else {
      let locationFiltered = currentLeaders;

      if (electionType) {
        locationFiltered = locationFiltered.filter(leader => leader.electionType === electionType);
      }
      
      if (trimmedSearchTerm) {
        locationFiltered = locationFiltered.filter(leader => 
          leader.constituency.toLowerCase().includes(trimmedSearchTerm)
        );
      }
      results = locationFiltered;
    }

    setFilteredLeaders(results);
    setCurrentPage(1);
    setIsLoading(false);
  };


  const LeaderListSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );

  const sortedLeaders = [...filteredLeaders].sort((a, b) => b.rating - a.rating);
  const indexOfLastLeader = currentPage * leadersPerPage;
  const indexOfFirstLeader = indexOfLastLeader - leadersPerPage;
  const currentLeaders = sortedLeaders.slice(indexOfFirstLeader, indexOfLastLeader);
  const totalPages = Math.ceil(sortedLeaders.length / leadersPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 flex justify-between items-start gap-4">
          <div className="max-w-3xl">
            <h1 className="font-headline text-3xl font-extrabold text-primary">{t('findAndRate.heading')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('findAndRate.subheading')}
            </p>
          </div>
          <Button onClick={handleAddLeaderClick} className="hidden sm:inline-flex">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('hero.addNewLeader')}
          </Button>
        </div>

        <SearchFilter onSearch={handleSearch} />
        
        <div className="mt-12">
          {(user || manualFilterActive) && filteredLeaders.length > 0 && !isLoading && (
            <>
              <h2 className="text-xl font-bold font-headline mb-4">
                {manualFilterActive ? t('leaderList.matchingLeadersTitle') : t('leaderList.resultsTitle')}
              </h2>
              <Separator className="mb-8" />
            </>
          )}
          {isLoading ? (
            <LeaderListSkeleton />
          ) : manualFilterActive && filteredLeaders.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-lg bg-secondary border-2 border-dashed border-border mt-4">
              <h3 className="mt-4 text-xl font-semibold font-headline text-blue-700">
                {t('leaderList.noResultsFound')}
              </h3>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                {t('leaderList.noResultsFoundDescription')}
              </p>
              <div className="flex justify-center">
                <p className="mt-4 text-sm bg-blue-700 text-white py-2 px-4 rounded-lg">
                  {t('leaderList.addLeaderPrompt')}
                </p>
              </div>
              <Button onClick={handleAddLeaderClick} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('hero.addNewLeader')}
              </Button>
            </div>
          ) : user || manualFilterActive ? (
            <LeaderList leaders={currentLeaders} initialLeaderIdToHighlight={searchParams.get('leader')} />
          ) : ( // Non-logged-in user, no manual filter
            <div>
              {specificLeaderFromQuery && (
                <>
                  <h2 className="text-xl font-bold font-headline mb-4">
                    {t('leaderList.sharedLeaderTitle')}
                  </h2>
                  <Separator className="mb-8" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    <LeaderCard leader={specificLeaderFromQuery} id={`leader-${specificLeaderFromQuery.id}`} highlightAndSuggestRating={true} />
                  </div>
                  <Separator className="mb-8" />
                </>
              )}
              <FeaturedLeaders leaders={topRatedLeaders} />
              <div className="text-center py-8 px-4 rounded-lg bg-secondary border-2 border-dashed border-border mt-4">
                <h3 className="mt-4 text-xl font-semibold font-headline text-blue-700">{t('leaderList.noLeadersDesc')}</h3>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  Please <a href="/login" className="text-blue-700 underline">login</a> or complete your profile to see relevant leaders in your area.
                </p>
              </div>
            </div>
          )}
        </div>

        {user && totalPages > 1 && !isLoading && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('pagination.previous')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t('pagination.pageInfo')
                .replace('{currentPage}', String(currentPage))
                .replace('{totalPages}', String(totalPages))}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              {t('pagination.next')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        
        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('auth.requiredTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('auth.requiredDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('auth.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/login?redirect=/add-leader')}>
                {t('auth.login')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <Footer />
    </div>
  );
}

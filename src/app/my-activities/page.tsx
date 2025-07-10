
"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import withAuth from '@/components/with-auth';
import { getActivitiesForUser, getLeadersAddedByUser, type UserActivity, type Leader } from '@/data/leaders';
import ActivityCard from '@/components/activity-card';
import LeaderCard from '@/components/leader-card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareText, UserPlus, UserCog, Edit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import RatingDialog from '@/components/rating-dialog';
import ProfileDetails from '@/components/profile-details';
import ProfileDialog from '@/components/profile-dialog'; // Added import for ProfileDialog
import { useRouter, useSearchParams } from 'next/navigation';

function MyActivitiesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [addedLeaders, setAddedLeaders] = useState<Leader[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const [isRatingDialogOpen, setRatingDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<UserActivity | null>(null);
  const [activeTab, setActiveTab] = useState('ratings');
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false); // State for profile dialog

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleProfileUpdateSuccess = () => {
    setIsProfileDialogOpen(false);
    // Optionally refresh profile details if needed
  };

  const fetchActivities = async () => {
      if (user) {
          setIsLoadingActivities(true);
          const userActivities = await getActivitiesForUser(user.id);
          setActivities(userActivities);
          setIsLoadingActivities(false);
      }
  };

  const fetchAddedLeaders = async () => {
      if (user) {
          setIsLoadingLeaders(true);
          const leaders = await getLeadersAddedByUser(user.id);
          setAddedLeaders(leaders);
          setIsLoadingLeaders(false);
      }
  };
  
  useEffect(() => {
    if (user && !hasFetched) {
      fetchActivities();
      fetchAddedLeaders();
      setHasFetched(true);
    }
  }, [user, hasFetched]);

  const handleEditRating = (activity: UserActivity) => {
    setEditingActivity(activity);
    setRatingDialogOpen(true);
  };
  
  const handleRatingSuccess = (updatedLeader: Leader) => {
    setRatingDialogOpen(false);
    setEditingActivity(null);
    // Refresh activities to show updated rating/comment
    fetchActivities();
  };

  const handleEditLeader = (leaderId: string) => {
    router.push(`/add-leader?edit=${leaderId}`);
  };

  const ActivitySkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-lg" />
      ))}
    </div>
  );

  const LeaderListSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
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

  return (
    <>
      <div className="flex flex-col min-h-screen bg-secondary/50">
        <Header />
        <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">{t('myActivitiesPage.title')}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                {t('myActivitiesPage.dashboardDescription')}
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ratings">{t('myActivitiesPage.ratingsTab')}</TabsTrigger>
                <TabsTrigger value="added-leaders">{t('myActivitiesPage.addedLeadersTab')}</TabsTrigger>
                <TabsTrigger value="profile">{t('myActivitiesPage.profileTab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="ratings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('myActivitiesPage.ratingsTabTitle')}</CardTitle>
                    <CardDescription>{t('myActivitiesPage.ratingsTabDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingActivities ? (
                      <ActivitySkeleton />
                    ) : activities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activities.map((activity) => (
                          <ActivityCard key={activity.leaderId} activity={activity} onEdit={() => handleEditRating(activity)} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 px-4 rounded-lg bg-background border-2 border-dashed border-border">
                        <MessageSquareText className="w-12 h-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-xl font-semibold font-headline">{t('myActivitiesPage.noActivitiesTitle')}</h3>
                        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                          {t('myActivitiesPage.noActivitiesDescription')}
                        </p>
                        <Button asChild className="mt-6" size="lg">
                            <Link href="/rate-leader">{t('hero.findLeader')}</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="added-leaders" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('myActivitiesPage.addedLeadersTabTitle')}</CardTitle>
                    <CardDescription>{t('myActivitiesPage.addedLeadersTabDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLeaders ? (
                      <LeaderListSkeleton />
                    ) : addedLeaders.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {addedLeaders.map((leader) => (
                          <LeaderCard
                            key={leader.id}
                            leader={leader}
                            isEditable={true}
                            onEdit={() => handleEditLeader(leader.id)}
                          />
                        ))}
                      </div>
                    ) : (
                       <div className="text-center py-16 px-4 rounded-lg bg-background border-2 border-dashed border-border">
                        <UserPlus className="w-12 h-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-xl font-semibold font-headline">{t('myActivitiesPage.noAddedLeadersTitle')}</h3>
                        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                           {t('myActivitiesPage.noAddedLeadersDescription')}
                        </p>
                        <Button asChild className="mt-6" size="lg">
                            <Link href="/add-leader">{t('hero.addNewLeader')}</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="w-6 h-6 text-primary" />
                      {t('myActivitiesPage.profileTabTitle')}
                    </CardTitle>
                    <Button
                      onClick={() => setIsProfileDialogOpen(true)}
                      className="bg-blue-700 hover:bg-blue-800 text-white" // Deep blue color
                      size="sm"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t('myActivitiesPage.editProfileButton')}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ProfileDetails />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </main>
        <Footer />
      </div>

      {editingActivity && editingActivity.leader && (
        <RatingDialog
          leader={editingActivity.leader}
          open={isRatingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          onRatingSuccess={handleRatingSuccess}
          initialRating={editingActivity.rating}
          initialComment={editingActivity.comment}
          initialSocialBehaviour={editingActivity.socialBehaviour}
        />
      )}

      <ProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        onProfileUpdateSuccess={handleProfileUpdateSuccess}
      />
    </>
  );
}

export default withAuth(MyActivitiesPage);

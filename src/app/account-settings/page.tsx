'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useLanguage } from '@/context/language-context';
import withAuth from '@/components/with-auth';
import { useAuth } from '@/context/auth-context';
import IncompleteProfileDialog from '@/components/incomplete-profile-dialog';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/data/users';

function AccountSettingsContent() {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('incomplete') === 'true') {
      setDialogOpen(true);
    }
  }, [searchParams]);

  const handleProfileUpdate = async (updatedData: Partial<User>) => {
    try {
      await updateUser(updatedData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setDialogOpen(false);
      // Clean the URL
      router.replace('/account-settings', undefined);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <IncompleteProfileDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onProfileUpdate={handleProfileUpdate}
        user={user}
      />
      <div className="flex flex-col min-h-screen bg-secondary/50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold font-headline">{t('accountSettingsPage.title')}</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('myActivitiesPage.welcome').replace('{name}', user?.name || 'User')}
              </p>
               <p className="mt-4 text-lg text-muted-foreground">
                {t('accountSettingsPage.description')}
              </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

function AccountSettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountSettingsContent />
    </Suspense>
  );
}

export default withAuth(AccountSettingsPage);

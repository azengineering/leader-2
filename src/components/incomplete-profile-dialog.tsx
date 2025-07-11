'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import ProfileDialog from '@/components/profile-dialog';

export default function IncompleteProfileDialog() {
  const { showProfileCompletionDialog, setShowProfileCompletionDialog } = useAuth();
  const router = useRouter();

  const handleDialogClose = () => {
    setShowProfileCompletionDialog(false);
    router.push('/');
  };

  return (
    <ProfileDialog
      open={showProfileCompletionDialog}
      onOpenChange={(open) => {
        if (!open) {
          handleDialogClose();
        }
      }}
      isCompletingProfile={true}
    />
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

export default function IncompleteProfileDialog() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user && (!user.gender || !user.age || !user.state || !user.mpConstituency || !user.mlaConstituency || !user.panchayat)) {
      setIsOpen(true);
    }
  }, [user]);

  const handleEditProfile = () => {
    setIsOpen(false);
    router.push('/my-activities?tab=profile&action=edit');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-headline">{t('incompleteProfileDialog.title')}</DialogTitle>
          <DialogDescription className="py-2">
            {t('incompleteProfileDialog.description')}
          </DialogDescription>
          <p className="text-sm text-muted-foreground">
            {t('incompleteProfileDialog.subDescription')}
          </p>
        </DialogHeader>
        <DialogFooter className="pt-4 flex justify-end">
          <Button onClick={handleEditProfile} size="sm" className="bg-blue-500 text-white hover:bg-blue-600">{t('incompleteProfileDialog.editProfileButton')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

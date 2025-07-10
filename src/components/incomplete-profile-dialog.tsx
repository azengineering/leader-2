
'use client';

import { useLanguage } from '@/context/language-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ProfileForm from './profile-form';
import type { User } from '@/data/users';

interface IncompleteProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate: (data: Partial<User>) => void;
  user: User | null;
}

export default function IncompleteProfileDialog({ isOpen, onClose, onProfileUpdate, user }: IncompleteProfileDialogProps) {
  const { t } = useLanguage();

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-headline text-blue-800">{t('incompleteProfileDialog.title')}</DialogTitle>
          <DialogDescription className="py-2">
            {t('incompleteProfileDialog.description')}
          </DialogDescription>
          <p className="text-sm text-muted-foreground">
            {t('incompleteProfileDialog.subDescription')}
          </p>
        </DialogHeader>
        <ProfileForm user={user} onSave={onProfileUpdate} />
        <DialogFooter className="pt-4 flex justify-end">
          <Button onClick={onClose} variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

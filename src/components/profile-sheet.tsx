'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ProfileForm from './profile-form';
import { useLanguage } from '@/context/language-context';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { t } = useLanguage();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('header.myProfile')}</SheetTitle>
          <SheetDescription>
            {t('profileDialog.description')}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <ProfileForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}

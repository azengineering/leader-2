'use client';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileDetails() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-semibold">{t('profileDialog.nameLabel')}</span>
          <span>{user.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">{t('profileDialog.genderLabel')}</span>
          <span>{user.gender}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">{t('profileDialog.ageLabel')}</span>
          <span>{user.age}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">{t('profileDialog.stateLabel')}</span>
          <span>{user.state}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">{t('profileDialog.mpConstituencyLabel')}</span>
          <span>{user.mpConstituency}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">{t('profileDialog.mlaConstituencyLabel')}</span>
          <span>{user.mlaConstituency}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">{t('profileDialog.panchayatLabel')}</span>
          <span>{user.panchayat}</span>
        </div>
    </div>
  );
}

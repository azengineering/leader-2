'use client';

import dynamic from 'next/dynamic';

const AdminMessageManager = dynamic(() => import('@/components/admin-message-manager'), { ssr: false });
const MaintenanceEnforcer = dynamic(() => import('@/components/maintenance-enforcer'), { ssr: false });
const NotificationBanner = dynamic(() => import('@/components/notification-banner'), { ssr: false });
const IncompleteProfileDialog = dynamic(() => import('@/components/incomplete-profile-dialog'), { ssr: false });

export default function ClientLayoutComponents() {
  return (
    <>
      <MaintenanceEnforcer />
      <NotificationBanner />
      <AdminMessageManager />
      <IncompleteProfileDialog />
    </>
  );
}

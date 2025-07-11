
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import IncompleteProfileDialog from '@/components/incomplete-profile-dialog';
import ClientLayoutComponents from '@/components/client-layout-components';
import './globals.css';

export const metadata: Metadata = {
  title: 'PolitiRate',
  description: 'Rate and review political leaders.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <AuthProvider>
            <ClientLayoutComponents />
            <IncompleteProfileDialog />
            {children}
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}


import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import IncompleteProfileDialog from '@/components/incomplete-profile-dialog';
import ClientLayoutComponents from '@/components/client-layout-components';
import './globals.css';

export const metadata: Metadata = {
  title: 'Janmat-Voice (PoliticsRate)',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://www.janmat-voice.com",
              "name": "Janmat-Voice (PoliticsRate)",
              "description": "Rate and review political leaders.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.janmat-voice.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Janmat-Voice",
                "url": "https://www.janmat-voice.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.janmat-voice.com/logo.png"
                }
              }
            })
          }}
        />
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
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

'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Users, Handshake, Megaphone } from 'lucide-react'; // Added icons

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col min-h-screen bg-background"> {/* Changed background */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Janmat-Voice (PoliticsRate)",
            "url": "https://www.janmat-voice.com/about",
            "description": "Learn about our mission to empower informed citizenship by providing a platform to rate and review political leaders."
          })
        }}
      />
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-12">
          <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">Empowering Informed Citizenship</h1>
          <p className="mt-4 max-w-3xl text-lg md:text-xl text-muted-foreground border-l-4 border-primary pl-4 italic">{t('aboutPage.mission')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="text-center p-6 shadow-sm">
            <CardHeader className="pb-4">
              <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="text-2xl font-headline text-foreground">{t('aboutPage.visionTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">{t('aboutPage.visionDescription')}</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 shadow-sm">
            <CardHeader className="pb-4">
              <Handshake className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="text-2xl font-headline text-foreground">{t('aboutPage.ourCommitmentTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">{t('aboutPage.ourCommitmentDescription')}</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 shadow-sm">
            <CardHeader className="pb-4">
              <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="text-2xl font-headline text-foreground">{t('aboutPage.joinUsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">{t('aboutPage.joinUsDescription')}</CardDescription>
            </CardContent>
          </Card>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground text-center mb-8">{t('aboutPage.howItWorksTitle')}</h2> {/* Changed text color */}
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground text-center mb-10">
            {t('aboutPage.howItWorksDescription')}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 rounded-lg shadow-sm"> {/* Adjusted shadow */}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-foreground text-center">{t('aboutPage.step1Title')}</CardTitle> {/* Changed text color */}
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-center">{t('aboutPage.step1Description')}</CardDescription>
              </CardContent>
            </Card>
            <Card className="p-6 rounded-lg shadow-sm"> {/* Adjusted shadow */}
              <CardHeader className="pb-4">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" /> {/* Smaller, muted icon */}
                <CardTitle className="text-xl font-semibold text-foreground text-center">{t('aboutPage.step2Title')}</CardTitle> {/* Changed text color */}
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-center">{t('aboutPage.step2Description')}</CardDescription>
              </CardContent>
            </Card>
            <Card className="p-6 rounded-lg shadow-sm"> {/* Adjusted shadow */}
              <CardHeader className="pb-4">
                <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-3" /> {/* Smaller, muted icon */}
                <CardTitle className="text-xl font-semibold text-foreground text-center">{t('aboutPage.step3Title')}</CardTitle> {/* Changed text color */}
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-center">{t('aboutPage.step3Description')}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </section> {/* Closing tag for "How It Works" section */}
      </main>
      <Footer />
    </div>
  );
}

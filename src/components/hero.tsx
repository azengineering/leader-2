'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vote, Search, BarChart, UserPlus } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Hero() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleAddLeaderClick = () => {
    if (user) {
      router.push('/add-leader');
    } else {
      setShowLoginDialog(true);
    }
  };

  return (
    <>
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background pt-12 pb-10 md:pt-16 md:pb-14 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/5 to-transparent to-70% opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-accent/5 to-transparent to-70% opacity-50"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Badge
              variant="outline"
              className="mb-6 inline-flex items-center gap-2 rounded-full border-primary/50 bg-primary/10 px-4 py-2 text-base font-medium transition-all hover:scale-105 hover:shadow-lg hover:border-primary/75"
            >
              <Vote className="h-4 w-4 text-accent" />
              {t('hero.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter text-foreground">
              {t('hero.title_part1')}<span className="text-primary">{t('hero.title_highlight')}</span>{t('hero.title_part2')}
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              {t('hero.description')}
            </p>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
               <Link href="/rate-leader" className="w-full">
                <Button size="sm" className="w-full py-6 text-base bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all duration-300 group rounded-full">
                    <div className="flex items-center">
                      <Search className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110" />
                      <span className="font-semibold">{t('hero.findLeader')}</span>
                    </div>
                </Button>
               </Link>
                <Button size="sm" className="w-full py-6 text-base bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-all duration-300 group rounded-full" asChild>
                    <Link href="/polls">
                      <div className="flex items-center">
                        <BarChart className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110" />
                        <span className="font-semibold">{t('hero.participateInPolls')}</span>
                      </div>
                    </Link>
                </Button>
               <Button size="sm" className="w-full py-6 text-base bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-500/30 transition-all duration-300 group rounded-full" onClick={handleAddLeaderClick}>
                  <div className="flex items-center">
                    <UserPlus className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-semibold">{t('hero.addNewLeader')}</span>
                  </div>
              </Button>
            </div>
        </div>
      </section>

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('auth.requiredTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('auth.requiredDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('auth.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login?redirect=/add-leader')}>
              {t('auth.login')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

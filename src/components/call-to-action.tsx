'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import { MessageSquare, Star, BarChart } from 'lucide-react';

export default function CallToAction() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 font-headline">
          {t('callToAction.title')}
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          {t('callToAction.description')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('callToAction.rateLeadersTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('callToAction.rateLeadersDescription')}
              </p>
              <Button asChild className="w-full">
                <Link href="/rate-leader">
                  {t('callToAction.rateLeadersButton')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('callToAction.joinDiscussionsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('callToAction.joinDiscussionsDescription')}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/polls">
                  {t('callToAction.joinDiscussionsButton')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                <BarChart className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('callToAction.exploreInsightsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('callToAction.exploreInsightsDescription')}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/rate-leader">
                  {t('callToAction.exploreInsightsButton')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

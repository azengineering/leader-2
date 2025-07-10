import Image from 'next/image';
import { ShieldCheck, Zap, Vote } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { motion } from 'framer-motion';

export default function WhyItMatters() {
  const { t } = useLanguage();

  const benefits = [
    { icon: <ShieldCheck className="w-8 h-8 text-primary" />, title: t('whyItMatters.benefit1Title'), description: t('whyItMatters.benefit1Desc') },
    { icon: <Vote className="w-8 h-8 text-primary" />, title: t('whyItMatters.benefit2Title'), description: t('whyItMatters.benefit2Desc') },
    { icon: <Zap className="w-8 h-8 text-primary" />, title: t('whyItMatters.benefit3Title'), description: t('whyItMatters.benefit3Desc') },
  ];
  
  return (
    <section className="py-8 md:py-12 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-8">{t('whyItMatters.heading')}</h2>
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-lg text-muted-foreground">
              {t('whyItMatters.description')}
            </p>
          </div>
          <div className="space-y-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{benefit.title}</h3>
                  <p className="text-muted-foreground mt-1">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

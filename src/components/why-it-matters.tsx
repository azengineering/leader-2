'use client';

import { ShieldCheck, Zap, Vote } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WhyItMatters() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: t('whyItMatters.benefit1Title'),
      description: t('whyItMatters.benefit1Desc'),
    },
    {
      icon: <Vote className="w-8 h-8 text-primary" />,
      title: t('whyItMatters.benefit2Title'),
      description: t('whyItMatters.benefit2Desc'),
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: t('whyItMatters.benefit3Title'),
      description: t('whyItMatters.benefit3Desc'),
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-2">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2
            className="font-headline text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4"
            variants={itemVariants}
          >
            {t('whyItMatters.heading')}
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground mb-12"
            variants={itemVariants}
          >
            {t('whyItMatters.description')}
          </motion.p>
          <motion.div
            className="grid md:grid-cols-3 gap-8 text-left"
            variants={containerVariants}
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 h-full">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

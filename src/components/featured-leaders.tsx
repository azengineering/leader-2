import type { Leader } from '@/data/leaders';
import LeaderCard from './leader-card';
import { useLanguage } from '@/context/language-context';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FeaturedLeadersProps {
  leaders: Leader[];
}

export default function FeaturedLeaders({ leaders }: FeaturedLeadersProps) {
  const { t } = useLanguage();
  if (!leaders.length) return null;

  return (
    <section className="py-8 md:py-12 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold">{t('featuredLeaders.heading')}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            {t('featuredLeaders.subheading')}
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {leaders.map((leader) => (
              <CarouselItem key={leader.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                <LeaderCard leader={leader} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}

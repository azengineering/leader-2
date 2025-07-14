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
    <section className="mt-[-2rem] pb-4 md:pb-6 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-headline text-xl md:text-2xl font-extrabold">{t('featuredLeaders.heading')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
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

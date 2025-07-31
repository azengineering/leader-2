'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from '@/context/language-context';
import { Quote } from 'lucide-react';

// This is dummy data for demonstration. In a real application, this could come from a CMS or API.
const dummyTestimonials = [
  {
    id: 1,
    quoteKey: 'communityImpactShowcase.testimonial1Quote',
  },
  {
    id: 2,
    quoteKey: 'communityImpactShowcase.testimonial2Quote',
  },
  {
    id: 3,
    quoteKey: 'communityImpactShowcase.testimonial3Quote',
  },
  {
    id: 4,
    quoteKey: 'communityImpactShowcase.testimonial4Quote',
  },
  {
    id: 5,
    quoteKey: 'communityImpactShowcase.testimonial5Quote',
  },
  {
    id: 6,
    quoteKey: 'communityImpactShowcase.testimonial6Quote',
  },
  {
    id: 7,
    quoteKey: 'communityImpactShowcase.testimonial7Quote',
  },
  {
    id: 8,
    quoteKey: 'communityImpactShowcase.testimonial8Quote',
  },
  {
    id: 9,
    quoteKey: 'communityImpactShowcase.testimonial9Quote',
  },
  {
    id: 10,
    quoteKey: 'communityImpactShowcase.testimonial10Quote',
  },
];

const testimonialColors = [
  '#f0f9ff', // light blue
  '#fefce8', // light yellow
  '#f0fdf4', // light green
  '#fff7ed', // light orange
  '#fdf2f8', // light pink
];

export default function CommunityImpactShowcase() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 font-headline">
          {t('communityImpactShowcase.title')}
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          {t('communityImpactShowcase.description')}
        </p>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative" // Make carousel relative for absolute positioning of buttons
        >
          <CarouselContent className="-ml-8 pb-4"> {/* Adjusted margin and padding */}
            {dummyTestimonials.map((testimonial, index) => (
              <CarouselItem key={testimonial.id} className="pl-8 md:basis-1/3 lg:basis-1/3"> {/* Display multiple cards */}
                <div className="p-1">
                  <Card className="shadow-lg border border-primary/20 rounded-lg overflow-hidden h-full flex flex-col justify-between"
                    style={{ backgroundColor: testimonialColors[index % testimonialColors.length] }}> {/* Apply alternate colors */}
                    <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]"> {/* Adjusted padding and min-height for smaller cards */}
                      <Quote className="w-10 h-10 text-primary mb-4 opacity-80" /> {/* Smaller icon */}
                      <p className="text-lg italic text-gray-800 dark:text-gray-200 mb-4 font-serif leading-normal"> {/* Smaller font, normal line height */}
                        "{t(testimonial.quoteKey)}"
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white"> {/* Smaller font */}
                        - Anonymous
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10" /> {/* Positioned far left */}
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10" /> {/* Positioned far right */}
        </Carousel>
      </div>
    </section>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface HeroProps {
  navigate: (to: string) => void;
}

const carouselImages = [
  { src: "/assets/carousel-1-TeRwl5LT.png", alt: "Baby in car colouring page" },
  { src: "/assets/carousel-2-BbN4GWVW.png", alt: "Family portrait colouring page" },
  { src: "/assets/carousel-3-DgGshBZI.png", alt: "Kid on bike colouring page" },
  { src: "/assets/carousel-4-ZmqDrfhT.png", alt: "Classic cars colouring page" },
  { src: "/assets/carousel-5-Bs0j1guA.png", alt: "Brothers colouring page" },
  { src: "/assets/carousel-6-t_Quetrk.png", alt: "Birthday cake colouring page" },
  { src: "/assets/carousel-7-YZOMDhsz.png", alt: "Minecraft characters colouring page" },
  { src: "/assets/carousel-8-DKoBHHFP.png", alt: "Family walking colouring page" },
  { src: "/assets/carousel-9-BCPyTS6g.png", alt: "Off-road vehicle colouring page" },
  { src: "/assets/carousel-10-BCFju6sL.png", alt: "Wedding couple colouring page" }
];

export default function Hero({ navigate }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const getIndex = (offset: number) => {
    const total = carouselImages.length;
    return ((currentIndex + offset) % total + total) % total;
  };

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
      setDirection(null);
      setTimeout(() => setIsAnimating(false), 50);
    }, 400);
  }, [isAnimating]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
      setDirection(null);
      setTimeout(() => setIsAnimating(false), 50);
    }, 400);
  }, [isAnimating]);

  const handleDotClick = useCallback((index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setDirection(index > currentIndex ? 'left' : 'right');
    setTimeout(() => {
      setCurrentIndex(index);
      setDirection(null);
      setTimeout(() => setIsAnimating(false), 50);
    }, 400);
  }, [isAnimating, currentIndex]);

  // Autoplay carousel
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [handleNext]);

  const getTranslateValue = (position: 'left' | 'center' | 'right') => {
    if (!direction) return 'translateX(0)';
    if (position === 'center') {
      return direction === 'left' ? 'translateX(-120%)' : 'translateX(120%)';
    }
    if (position === 'right') {
      return direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
    }
    return 'translateX(0)';
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/40 to-background pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-border/10">
      <div className="container relative z-10 mx-auto px-4">
        {/* Title and Subtitle Block */}
        <div className="text-center max-w-3xl mx-auto animate-fade-in-up space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Personalised Colouring Books
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            <span className="text-gradient-rainbow">ColourMy</span>
            <span className="text-foreground">Memories</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Transform your precious photos into one-of-a-kind custom colouring storybooks. Perfect heartfelt gifts for all ages, lovingly crafted.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigate('/order')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold shadow-soft hover:shadow-glow hover:scale-103 gradient-primary text-primary-foreground transform active:scale-97 transition-all duration-300 cursor-pointer"
            >
              Order Now ✨
            </button>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold border border-border bg-card hover:bg-muted hover:scale-103 text-foreground text-center transform active:scale-97 transition-all duration-300 cursor-pointer"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* Dynamic Carousel Slideshow */}
        <div className="relative mt-16 max-w-6xl mx-auto flex items-center justify-center min-h-[300px] md:min-h-[450px]">
          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            className="absolute left-2 lg:left-8 z-20 h-11 w-11 rounded-full bg-background/90 border border-border hover:bg-background transition-colors shadow-soft hover:scale-110 disabled:opacity-50 flex items-center justify-center cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>

          {/* Carousel Layout (Previous, Center, Next) */}
          <div className="relative w-full flex items-center justify-center gap-6 overflow-hidden py-4 px-2 select-none">
            {/* Left Staggered Image (Desktop Only) */}
            <div 
              className="hidden sm:block relative w-48 lg:w-64 opacity-50 scale-85 transition-all duration-300 transform"
              style={{
                transform: getTranslateValue('left') + ' scale(0.85)',
                transition: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 400ms'
              }}
            >
              <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border/50">
                <img 
                  src={carouselImages[getIndex(-1)].src} 
                  alt={carouselImages[getIndex(-1)].alt} 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Active Highlighted Center Image */}
            <div 
              className="relative w-80 md:w-96 lg:w-[480px] z-10 scale-100 transition-all duration-300 transform"
              style={{
                transform: getTranslateValue('center'),
                transition: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              <div className="relative">
                {/* Rainbow background blur */}
                <div className="absolute -inset-4 gradient-rainbow rounded-[2.5rem] opacity-35 blur-2xl" />
                <div className="relative bg-card rounded-[2rem] overflow-hidden shadow-glow border-4 border-primary/20 p-2 md:p-3">
                  <img 
                    src={carouselImages[currentIndex].src} 
                    alt={carouselImages[currentIndex].alt} 
                    className="w-full h-auto rounded-[1.5rem]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Right Staggered Image (Desktop Only) */}
            <div 
              className="hidden sm:block relative w-48 lg:w-64 opacity-50 scale-85 transition-all duration-300 transform"
              style={{
                transform: getTranslateValue('right') + ' scale(0.85)',
                transition: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 400ms'
              }}
            >
              <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border/50">
                <img 
                  src={carouselImages[getIndex(1)].src} 
                  alt={carouselImages[getIndex(1)].alt} 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="absolute right-2 lg:right-8 z-20 h-11 w-11 rounded-full bg-background/90 border border-border hover:bg-background transition-colors shadow-soft hover:scale-110 disabled:opacity-50 flex items-center justify-center cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {/* Carousel indicators/dots */}
        <div className="flex justify-center gap-2 mt-8">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              disabled={isAnimating}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                idx === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

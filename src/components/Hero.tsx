import { useState, useEffect, useCallback, useRef, MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface HeroProps {
  navigate: (to: string) => void;
}

const carouselImages = [
  { src: "/1.png", alt: "Personalised colouring book preview 1" },
  { src: "/2.png", alt: "Personalised colouring book preview 2" },
  { src: "/3.png", alt: "Personalised colouring book preview 3" },
  { src: "/4.png", alt: "Personalised colouring book preview 4" },
  { src: "/5.png", alt: "Personalised colouring book preview 5" },
  { src: "/6.png", alt: "Personalised colouring book preview 6" },
  { src: "/7.png", alt: "Personalised colouring book preview 7" },
  { src: "/8.png", alt: "Personalised colouring book preview 8" },
  { src: "/9.png", alt: "Personalised colouring book preview 9" },
  { src: "/11.png", alt: "Personalised colouring book preview 11" },
  { src: "/12.png", alt: "Personalised colouring book preview 12" },
  { src: "/13.png", alt: "Personalised colouring book preview 13" },
  { src: "/14.png", alt: "Personalised colouring book preview 14" },
  { src: "/15.png", alt: "Personalised colouring book preview 15" },
  { src: "/16.png", alt: "Personalised colouring book preview 16" }
];

export default function Hero({ navigate }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Calculate the closest slide that is centered within the scroll view
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    
    const children = Array.from(container.children) as HTMLElement[];
    let closestIndex = 0;
    let minDistance = Infinity;
    
    children.forEach((child, idx) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });
    
    setCurrentIndex(closestIndex);
  };

  // Drag listeners to allow custom swipe/drag on desktop
  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag scroll offset amplifier
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const scrollNext = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
    // Check if we are near the end. If so, wrap around back to the beginning.
    const isAtEnd = container.scrollLeft >= maxScrollLeft - 15;
    
    if (isAtEnd) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const firstChild = container.firstElementChild as HTMLElement;
      if (firstChild) {
        const cardWidth = firstChild.getBoundingClientRect().width + 24; // width + gap-6
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }
  }, []);

  const scrollPrev = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    
    // Check if we are near the start. If so, wrap around to the end.
    const isAtStart = container.scrollLeft <= 15;
    
    if (isAtStart) {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      container.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
    } else {
      const firstChild = container.firstElementChild as HTMLElement;
      if (firstChild) {
        const cardWidth = firstChild.getBoundingClientRect().width + 24; // width + gap-6
        container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      }
    }
  }, []);

  const handleDotClick = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const child = container.children[index] as HTMLElement;
    if (child) {
      // Align chosen card center in horizontal carousel visible area
      const targetScrollLeft = child.offsetLeft - (container.clientWidth - child.clientWidth) / 2;
      container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }
  }, []);

  // Autoplay carousel on timer
  useEffect(() => {
    if (isDragging || isHovering) return;
    const interval = setInterval(() => {
      scrollNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [scrollNext, isDragging, isHovering]);

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
        </div>        {/* Dynamic Carousel Slideshow */}
        <div 
          className="relative mt-16 max-w-7xl mx-auto flex items-center justify-center min-h-[400px] md:min-h-[600px]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setIsDragging(false);
          }}
        >
          {/* Previous Arrow */}
          <button
            onClick={scrollPrev}
            className="absolute left-2 lg:left-8 z-20 h-11 w-11 rounded-full bg-background/90 border border-border hover:bg-background transition-colors shadow-soft hover:scale-110 flex items-center justify-center cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
 
          {/* Carousel Layout (Horizontal Smooth Scroll Snap Strip) */}
          <div className="relative w-full overflow-hidden py-4 px-2 select-none">
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              className={`flex gap-6 overflow-x-auto py-6 px-[12%] sm:px-[20%] md:px-[25%] lg:px-[30%] select-none scrollbar-none ${
                isDragging ? '' : 'snap-x snap-mandatory scroll-smooth'
              } cursor-grab active:cursor-grabbing w-full`}
            >
              {carouselImages.map((img, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <div 
                    key={idx}
                    className={`snap-center shrink-0 w-[280px] sm:w-[360px] md:w-[420px] lg:w-[480px] transition-all duration-500 ease-out transform ${
                      isActive 
                        ? 'scale-100 opacity-100 z-10' 
                        : 'scale-90 opacity-40 hover:opacity-60'
                    }`}
                  >
                    <div className="relative">
                      {/* Rainbow background blur behind active card */}
                      {isActive && (
                        <div className="absolute -inset-4 gradient-rainbow rounded-[2.5rem] opacity-30 blur-2xl animate-pulse duration-3000" />
                      )}
                      <div className={`relative bg-card rounded-[2rem] overflow-hidden border p-2 md:p-3 transition-all duration-500 ${
                        isActive 
                          ? 'shadow-glow border-primary/20 scale-102 font-bold' 
                          : 'shadow-card border-border/50'
                      }`}>
                        <img 
                          src={img.src} 
                          alt={img.alt} 
                          className="w-full h-auto rounded-[1.5rem] object-contain bg-white aspect-[3/4] pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Arrow */}
          <button
            onClick={scrollNext}
            className="absolute right-2 lg:right-8 z-20 h-11 w-11 rounded-full bg-background/90 border border-border hover:bg-background transition-colors shadow-soft hover:scale-110 flex items-center justify-center cursor-pointer"
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
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
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

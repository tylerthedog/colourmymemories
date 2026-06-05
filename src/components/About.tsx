import { Heart, Smile, Gift, BookOpen } from 'lucide-react';

export default function About() {
  const cards = [
    {
      icon: Heart,
      title: "Made with Love",
      description: "Each book is carefully crafted to capture your unique memories",
      shadowClass: "hover:shadow-soft"
    },
    {
      icon: Smile,
      title: "Screen-Free Fun",
      description: "Perfect creative activity for all ages, away from screens",
      shadowClass: "hover:shadow-soft"
    },
    {
      icon: Gift,
      title: "Perfect Gift",
      description: "Ideal for birthdays, weddings, holidays and special occasions",
      shadowClass: "hover:shadow-soft"
    },
    {
      icon: BookOpen,
      title: "Your Story",
      description: "We weave your photos and details into a personal narrative",
      shadowClass: "hover:shadow-soft"
    }
  ];

  return (
    <section id="about" className="py-20 bg-muted/30 border-b border-border/10">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left panel: text content */}
          <div className="space-y-8 animate-fade-in-up order-2 lg:order-1">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                About <span className="text-gradient-rainbow">ColourMy</span><span className="text-foreground">Memories</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Bring your family's memories to life! We transform your personal photos, from babies and weddings to cherished moments with loved ones, along with your unique background stories into one-of-a-kind colouring storybooks.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Perfect as heartfelt gifts or meaningful self-treats for all ages, these custom creations offer screen-free creativity and joy through colouring.
              </p>
            </div>

            {/* Grid of highlight cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {cards.map((card, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-soft hover:shadow-card hover:scale-101 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground">
                      {card.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Showcase collage / Single preview image */}
          <div className="relative animate-scale-in order-1 lg:order-2">
            <div className="relative">
              {/* Diffuse glow */}
              <div className="absolute -inset-4 gradient-rainbow rounded-3xl opacity-20 blur-xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-card border border-border bg-card p-4">
                <img 
                  src="/assets/carousel-1-TeRwl5LT.png" 
                  alt="Personalised colouring page family preview" 
                  className="w-full h-auto rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

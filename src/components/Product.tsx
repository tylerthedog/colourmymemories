import { Sparkles, Calendar, BookOpen, Layers, Check } from 'lucide-react';

interface ProductProps {
  navigate: (to: string) => void;
}

export default function Product({ navigate }: ProductProps) {
  const specs = [
    { icon: BookOpen, label: "A5 Format", desc: "Easy handling and perfect portable size (148mm x 210mm)" },
    { icon: Layers, label: "20–30 Pages", desc: "Generous collection of custom black-and-white lineart scenes" },
    { icon: Calendar, label: "5–7 Days Prod.", desc: "Fast production time of custom outlines before final checkout" },
    { icon: Sparkles, label: "Colour Cover", desc: "Dazzling full-colour cover showcasing one of your selected moments" }
  ];

  const highlights = [
    "Perfect for colouring with pencils, crayons, or markers",
    "Heartfelt emotional gifts for anniversaries, birthdays, weddings",
    "Premium thick heavy paper stock prevents screen bleed-through",
    "Professionally bound custom storybook layout designed for durability"
  ];

  return (
    <section id="product" className="py-20 bg-background border-b border-border/10">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Product Showcase mockup */}
            <div className="relative animate-scale-in order-1 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 gradient-rainbow rounded-[2.5rem] opacity-30 blur-2xl" />
                <div className="relative bg-card rounded-[2rem] overflow-hidden shadow-card border-4 border-primary/20 p-6">
                  <img 
                    src="/assets/carousel-3-DgGshBZI.png" 
                    alt="Personalised custom colouring page preview" 
                    className="w-full h-auto rounded-3xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-8 right-8 gradient-sunset px-5 py-2.5 rounded-full text-primary-foreground font-bold shadow-soft text-sm">
                    Best Seller ✨
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Descriptions & Details */}
            <div className="space-y-8 animate-fade-in-up order-2 lg:order-2">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Our <span className="text-gradient-rainbow">Product</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Every ColourMyMemories book is fully custom-made. We weave your provided memories, stories, and photos into a premium colouring package that is uniquely yours. Excellent as a family keepsake.
                </p>
              </div>

              {/* Bullet checklist highlights */}
              <ul className="space-y-3.5">
                {highlights.map((text, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-sm md:text-base text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              {/* Bento Specs grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {specs.map((spec, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <spec.icon className="w-4 h-4" />
                      <span>{spec.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {spec.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Button */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    navigate('/order');
                    window.scrollTo({ top: 0 });
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-base font-bold shadow-soft gradient-primary text-primary-foreground transform hover:scale-103 active:scale-97 transition-all duration-300 cursor-pointer"
                >
                  Create Your Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

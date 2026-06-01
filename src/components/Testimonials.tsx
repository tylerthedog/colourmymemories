import { Star } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: "Sarah & Johan",
      type: "Wedding Keepsake",
      avatar: "💒",
      text: "Colour My Memories turned our wedding photos into a stunning storybook! The colour cover captured the day perfectly.",
      rating: 5
    },
    {
      name: "Lisa",
      type: "Baby Milestone",
      avatar: "👶",
      text: "Our baby's first-year photos became a magical adventure book everyone coloured. Fast, personal, and priceless.",
      rating: 5
    },
    {
      name: "David",
      type: "Family Gift",
      avatar: "👨‍👩‍👧",
      text: "Gifted this to my sister with our childhood pics. The compact size is perfect, and it sparked creativity across ages.",
      rating: 5
    },
    {
      name: "Emma",
      type: "Self-Treat",
      avatar: "🎨",
      text: "Bought one for myself using old family photos, therapeutic and nostalgic! The quality paper takes colour beautifully.",
      rating: 5
    },
    {
      name: "Nadia P.",
      type: "Repeat Customer",
      avatar: "🎁",
      text: "Second order for a friend's baby shower. Simple process, standard perfection every time.",
      rating: 5
    }
  ];

  return (
    <section className="py-16 bg-muted/30 overflow-hidden border-b border-border/10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            What Our <span className="text-gradient-rainbow">Customers Say</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Hear from families who've transformed their memories into colouring masterpieces.
          </p>
        </div>

        {/* Horizontal scrollable or auto grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {reviews.map((rev, idx) => (
            <div 
              key={idx} 
              className="animate-fade-in-up bg-card rounded-2xl p-6 shadow-soft hover:shadow-card hover:scale-102 border border-border/50 transition-all duration-300 flex flex-col justify-between"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="space-y-4">
                {/* Avatar emoji badge */}
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-soft text-lg select-none">
                  {rev.avatar}
                </div>

                {/* Stars Rating */}
                <div className="flex gap-0.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary shrink-0" />
                  ))}
                </div>

                {/* Text reviews */}
                <p className="text-muted-foreground text-sm leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Author name and category */}
              <div className="pt-6 border-t border-border/30 mt-6 space-y-0.5">
                <h4 className="font-bold text-sm text-foreground">{rev.name}</h4>
                <p className="text-xs text-primary font-semibold">{rev.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

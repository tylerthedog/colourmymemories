import { ClipboardList, Upload, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: ClipboardList,
      title: "Fill in a Form",
      description: "Share your story details and what you want in your book",
      time: "5 Minutes",
      colorClass: "bg-primary text-primary-foreground",
    },
    {
      icon: Upload,
      title: "Upload Your Photos",
      description: "Send us your precious memories and photos",
      time: "5 Minutes",
      colorClass: "bg-secondary text-secondary-foreground",
    },
    {
      icon: CheckCircle,
      title: "Approve Your Book",
      description: "Review and approve your fully personalised storybook",
      time: "1 Minute!",
      colorClass: "bg-accent text-accent-foreground",
    }
  ];

  return (
    <section className="py-20 bg-background border-b border-border/10">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left panel showing illustrative Kid on bike image */}
          <div className="relative animate-fade-in-up order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden shadow-card border-4 border-secondary/20 hover:scale-102 transition-transform duration-300">
              <img 
                src="https://drive.google.com/thumbnail?id=110Iqih7CBHkt7WowM4eEf1wWyvFUXozq&sz=w1200" 
                alt="Child on bike colouring page" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Right panel: Steps flow */}
          <div className="animate-fade-in-up order-1 lg:order-2 space-y-10">
            <div className="text-center lg:text-left space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="text-gradient-rainbow">How It Works</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Creating your personalised colouring book is simple and fun. Just follow these three easy steps!
              </p>
            </div>

            <div className="space-y-6">
              {steps.map((step, idx) => (
                <div key={idx} className="relative group flex flex-col sm:flex-row gap-6 bg-card rounded-2xl p-6 shadow-soft hover:shadow-card hover:scale-101 border border-border/50 transition-all duration-300">
                  {/* Icon badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.colorClass} shadow-md`}>
                    <step.icon className="w-6 h-6" />
                  </div>

                  {/* Step text content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {idx + 1}. {step.title}
                      </h3>
                      <span className="inline-flex self-start sm:self-center px-2.5 py-1 rounded-full bg-muted border border-border/60 text-xs font-semibold text-muted-foreground">
                        ⏱️ {step.time}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

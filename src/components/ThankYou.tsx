import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Gift, Sparkles, ShieldCheck } from 'lucide-react';

interface ThankYouProps {
  navigate: (to: string) => void;
}

export default function ThankYou({ navigate }: ThankYouProps) {
  const [details, setDetails] = useState<{
    reference: string;
    email: string;
    amount: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    // Retrieve transient transaction summary from state or localStorage
    const saved = localStorage.getItem('last_paystack_payment');
    if (saved) {
      try {
        setDetails(JSON.parse(saved));
      } catch (e) {
        console.error('Error fetching cached order confirmation details:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col justify-between">
      {/* Dynamic navbar header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/15">
              <img 
                src="https://lh3.googleusercontent.com/d/1UUdIwzt7nRbETaMek7dKYm7fE4eNLV1E" 
                alt="ColourMyMemories" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-extrabold text-gradient-rainbow">ColourMy</span>
              <span className="font-extrabold text-foreground">Memories</span>
            </div>
          </a>
          <button
            onClick={() => { navigate('/'); window.scrollTo({ top: 0 }); }}
            className="flex items-center text-sm font-semibold border border-border bg-card px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Success Content Body */}
      <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
        <div className="max-w-2xl w-full text-center space-y-8 animate-scale-in">
          {/* Main Congratulations Card */}
          <div className="bg-card rounded-3xl border border-border p-8 md:p-12 shadow-card space-y-6 relative overflow-hidden">
            {/* Elegant Rainbow Border Top Decor */}
            <div className="absolute top-0 left-0 right-0 h-1.5 gradient-rainbow" />
            
            {/* Visual Success Icon Header */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
                <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/25 rounded-full flex items-center justify-center text-emerald-500 shadow-soft">
                  <CheckCircle className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-extrabold tracking-wider uppercase inline-block">
                Secure Checkout Cleared
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                Thank You For Your <span className="text-gradient-rainbow">Order!</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
                Your custom coloring book payment has been safely validated. Our artists will immediately start hand-crafting your cherished outlines.
              </p>
            </div>

            {/* Transaction Billing Summary */}
            <div className="bg-muted/15 border border-border/60 rounded-2xl p-5 md:p-6 text-left space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Payment Transaction Details
              </h3>
              
              <div className="grid grid-cols-2 gap-y-3 text-xs md:text-sm font-sans">
                <div className="text-muted-foreground font-semibold">Payment Gateway</div>
                <div className="text-foreground text-right font-bold font-sans">Paystack Secure</div>

                <div className="text-muted-foreground font-semibold">Cardholder Name</div>
                <div className="text-foreground text-right font-bold">{details?.name || 'Not Specified'}</div>

                <div className="text-muted-foreground font-semibold">Registered Email</div>
                <div className="text-foreground text-right font-mono font-bold truncate max-w-[200px] sm:max-w-none">{details?.email || 'Authenticated User'}</div>

                <div className="text-muted-foreground font-semibold">Secure Payment Ref</div>
                <div className="text-foreground text-right font-mono font-bold text-[11px] sm:text-xs select-all text-primary">{details?.reference || 'PAYSTACK_TX_PENDING'}</div>

                <div className="text-muted-foreground font-bold border-t border-border/50 pt-2.5 mt-1 font-sans">Total Amount Paid</div>
                <div className="text-gradient-rainbow text-right font-black text-base border-t border-border/50 pt-2.5 mt-1">R {details?.amount || '450.00'} ZAR</div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="border border-border/75 bg-muted/5 rounded-2xl p-5 text-left space-y-3.5">
              <h4 className="text-xs md:text-sm font-extrabold text-foreground flex items-center gap-2">
                <Gift className="w-4 h-4 text-pink-500" /> What happens next?
              </h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                <li className="flex gap-2 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>
                    Our dedicated designers review your <strong>Google Order Form submission</strong> to collect your memories, story guides, and photos.
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>
                    We generate customized premium black-and-white vector lineart drawing presets representing your unique life chapters.
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>
                    A personal digital outline draft proof will be sent for your final review and sign-off within <strong>5–7 days</strong> before printing.
                  </span>
                </li>
              </ul>
            </div>

            {/* CTA Option */}
            <div className="pt-2">
              <button
                onClick={() => { navigate('/'); window.scrollTo({ top: 0 }); }}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-2xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-soft"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Return to Landing Page
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Styled Footer */}
      <footer className="py-6 border-t border-border/30 bg-card/40 text-center text-xs text-muted-foreground font-semibold">
        <p>© 2026 ColourMyMemories. All rights secured via Paystack PCI-DSS compliance.</p>
      </footer>
    </div>
  );
}

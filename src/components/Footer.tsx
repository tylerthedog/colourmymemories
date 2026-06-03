import React from 'react';
import { Facebook, MessageSquare } from 'lucide-react';

interface FooterProps {
  navigate: (to: string) => void;
  path: string;
}

export default function Footer({ navigate, path }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (path !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePolicyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/policies');
    window.scrollTo({ top: 0 });
  };

  return (
    <footer className="bg-foreground text-background py-16 border-t border-border/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Brand details */}
          <div className="space-y-4">
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/10 shadow-soft">
                <img 
                  src="https://lh3.googleusercontent.com/d/1UUdIwzt7nRbETaMek7dKYm7fE4eNLV1E" 
                  alt="ColourMyMemories" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-md text-secondary leading-none">ColourMy</span>
                <span className="font-semibold text-xs text-background/80 leading-tight">Memories</span>
              </div>
            </a>
            <p className="text-background/70 text-sm leading-relaxed max-w-sm">
              Transform your precious photos into one-of-a-kind, personalised custom colouring storybooks. Perfect heartfelt gifts for all ages.
            </p>
            <div className="flex gap-4 pt-2">
              <a 
                href="https://www.facebook.com/profile.php?id=61586799602322" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-background/10 hover:bg-secondary text-background hover:text-foreground flex items-center justify-center transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/27608291485" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-background/10 hover:bg-secondary text-background hover:text-foreground flex items-center justify-center transition-all duration-200"
                aria-label="WhatsApp"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-secondary">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '#nav-header' },
                { label: 'About', href: '#about' },
                { label: 'Product', href: '#product' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Contact', href: '#contact' }
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-sm text-background/80 hover:text-secondary hover:underline transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal & Location */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-secondary">Policies & Legal</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/policies"
                  onClick={handlePolicyClick}
                  className="text-sm text-background/80 hover:text-secondary hover:underline transition-colors duration-200"
                >
                  Our Policies (Privacy, Refund, Terms)
                </a>
              </li>
              <li>
                <span className="text-sm text-background/60 block">
                  Compliant with South Africa's POPI Act.
                </span>
              </li>
            </ul>
            <div className="pt-4 border-t border-background/10 space-y-1">
              <p className="text-xs text-background/60 italic">Crafted in Cape Town</p>
              <p className="text-xs text-secondary font-medium">Made with 🎨 in South Africa</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom copyright */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50">
          <p>© {currentYear} ColourMyMemories. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/policies" onClick={handlePolicyClick} className="hover:text-secondary transition-colors duration-200">Privacy Policy</a>
            <a href="/policies" onClick={handlePolicyClick} className="hover:text-secondary transition-colors duration-200">Refund Policy</a>
            <a href="/policies" onClick={handlePolicyClick} className="hover:text-secondary transition-colors duration-200">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

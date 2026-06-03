import React, { useState } from 'react';
import { Menu, X, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  path: string;
  navigate: (to: string) => void;
}

export default function Header({ path, navigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Product', href: '#product' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (path !== '/') {
      navigate('/');
      // Wait for navigation and scrolling
      setTimeout(() => {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleOrderClick = () => {
    navigate('/order');
    window.scrollTo({ top: 0 });
    setMobileMenuOpen(false);
  };

  return (
    <header id="nav-header" className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-primary/10 shadow-soft group-hover:scale-105 transition-transform duration-300">
            <img 
              src="https://drive.google.com/thumbnail?id=1UUdIwzt7nRbETaMek7dKYm7fE4eNLV1E&sz=w300" 
              alt="ColourMyMemories" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-extrabold text-lg text-gradient-rainbow">ColourMy</span>
            <span className="font-extrabold text-lg text-foreground">Memories</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        {path === '/' ? (
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavLinkClick(e, link.href)}
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Main Page
            </button>
          </nav>
        )}

        {/* Call to Action Button */}
        <div className="hidden md:flex items-center gap-4">
          {path !== '/order' ? (
            <button
              onClick={handleOrderClick}
              className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-soft gradient-primary text-primary-foreground hover:opacity-90 transform active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Order Now
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border bg-card text-foreground hover:bg-muted transform active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Back to Home
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg animate-fade-in-up py-4 px-4 shadow-xl">
          <nav className="flex flex-col gap-2">
            {path === '/' && navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavLinkClick(e, link.href)}
                className="py-3 px-4 text-foreground/85 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium text-sm"
              >
                {link.label}
              </a>
            ))}
            {path !== '/' && (
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className="py-3 px-4 text-foreground/85 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-medium text-sm flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </a>
            )}
            <div className="pt-4 border-t border-border/30">
              {path !== '/order' ? (
                <button
                  onClick={handleOrderClick}
                  className="w-full py-3 rounded-xl font-bold shadow-soft gradient-primary text-primary-foreground text-center block"
                >
                  Order Now
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl font-semibold border border-border bg-card text-foreground text-center block"
                >
                  Back to Home
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

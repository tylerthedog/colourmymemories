import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What size is the storybook?",
    answer: "The Colour My Memories storybook is a standard A5 size for easy handling and portability. No size variations are offered unless specially requested."
  },
  {
    question: "What type of paper and printing is used?",
    answer: "Each book features a vibrant full-colour cover printed on quality stock, with interior pages on regular printing paper optimised for smooth colouring with pencils, markers, or crayons."
  },
  {
    question: "Are the interior pages in colour or black-and-white?",
    answer: "The cover images are in full colour to showcase your photos, while all interior pages are black-and-white lineart, specially created from your family photos and stories for customers to colour in."
  },
  {
    question: "How do I customise my storybook?",
    answer: "Simply share your photos (family, baby, wedding, etc.) and background details via our contact form. The team weaves them into a personalised narrative, no further customisation options unless requested."
  },
  {
    question: "Is this suitable only for kids?",
    answer: "No, these storybooks appeal to all ages as meaningful gifts or self-treats, offering screen-free creativity through colouring cherished memories for everyone."
  },
  {
    question: "How long does it take to receive my custom storybook?",
    answer: "Production typically takes 5-7 business days after receiving your photos and story details, plus standard shipping time. Rush options may be available on request."
  },
  {
    question: "What is the page count for the books?",
    answer: "Standard storybooks include 20-30 pages of personalised lineart interiors plus the full-colour cover, tailored to your provided photos and background for a complete narrative."
  },
  {
    question: "Can I request changes after submitting my photos and story?",
    answer: "Minor tweaks are possible during the proofing stage, but the standard A5 format, colour cover, and lineart pages remain fixed unless a custom variation is specifically requested."
  },
  {
    question: "What payment and shipping options are available?",
    answer: "Payments are handled securely via EFT, card, or PayFast. Shipping is nationwide (SA) via courier, with tracking provided, international options on request."
  },
  {
    question: "Do you offer bulk orders or wholesale pricing?",
    answer: "Yes, bulk orders for events, corporate gifts, or multiples qualify for discounts. Contact us with details for a custom quote."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-background border-b border-border/10">
      <div className="container mx-auto px-4">
        {/* Header Title */}
        <div className="text-center mb-16 animate-fade-in-up space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Frequently Asked <span className="text-gradient-rainbow">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Colour My Memories
          </p>
        </div>

        {/* Accordion List container */}
        <div className="max-w-3xl mx-auto animate-fade-in-up space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-base md:text-lg text-foreground hover:text-primary py-5 px-6 gap-4 border-none bg-transparent cursor-pointer transition-colors duration-200 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-350 ease-out ${
                    isOpen ? 'rotate-180 text-primary' : 'rotate-0'
                  }`} />
                </button>
                
                {/* Expandable description wrapper */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden md:px-6 ${
                    isOpen ? 'max-h-60 pb-5 opacity-100' : 'max-h-0 pb-0 opacity-0'
                  }`}
                >
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed px-6 md:px-0">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

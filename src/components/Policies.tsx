import { useState } from 'react';
import { ArrowLeft, Shield, Landmark, Truck, FileText } from 'lucide-react';

interface PoliciesProps {
  navigate: (to: string) => void;
}

export default function Policies({ navigate }: PoliciesProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'refund' | 'shipping' | 'terms'>('privacy');

  const policyTabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'refund', label: 'Refund & Returns', icon: Landmark },
    { id: 'shipping', label: 'Shipping Policy', icon: Truck },
    { id: 'terms', label: 'Terms of Service', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/15">
              <img 
                src="/assets/logo-DcBoA8lE.png" 
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

      {/* Main Content */}
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Our Policies</h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Transparency is important to us. Please review our policies below to understand how we handle your data, orders, and deliveries.
            </p>
          </div>

          {/* Policy Page Tabs switching header */}
          <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 w-full h-auto gap-1 bg-muted p-1 rounded-xl border border-border/10">
              {policyTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-center gap-1.5 text-xs md:text-sm font-bold py-3.5 px-4 rounded-lg transition-all cursor-pointer h-full ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-md scale-102 font-sans' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/20'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Displaying active tab details */}
            <div className="mt-8 bg-card rounded-2xl border border-border/50 p-6 md:p-10 shadow-soft animate-fade-in-up">
              
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-foreground">Privacy Policy (POPIA Compliant)</h2>
                  <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
                  
                  <div className="space-y-5 text-muted-foreground leading-relaxed text-sm md:text-base font-sans">
                    <p>
                      At ColourMyMemories, we value your trust and are fully committed to protecting your personal information. This Privacy Policy is structured specifically under South Africa's POPIA (Protection of Personal Information Act) to outline how we safely collect, store, and process your family records, background stories, and uploaded image files.
                    </p>
                    
                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">1. Personal Information We Collect</h3>
                      <p>
                        We collect individual details when you submit our contact and custom checkout form. This includes:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Your designation, full name, email address, and direct phone/WhatsApp contacts.</li>
                        <li>Detailed narrative backgrounds, memory descriptions, timelines, and occasion expectations.</li>
                        <li>Your physical home address coordinates for nationwide parcel carrier courier fulfillment.</li>
                      </ul>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">2. Sensitive Image Assets handling</h3>
                      <p>
                        We process uploaded images exclusively with deep creative diligence to transform your portrait drawings into custom colouring book pages. We do not sell, rent, or lease your private images. After final proofing and physical delivery is complete, we purge active photo arrays from our operational workspace servers.
                      </p>
                    </section>

                    <section className="space-y-2">
                       <h3 className="text-lg font-bold text-foreground">3. Tracking & Essential Cookies</h3>
                       <p>
                         We use essential cookies for uploads/orders. No tracking for ads. Manage via your browser.
                       </p>
                    </section>

                    <p className="text-xs text-muted-foreground/75 pt-4 border-t border-border/40">
                      This policy was last updated March 2026. By using our site, you agree to these terms. Changes will be posted here, continued use means acceptance.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'refund' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-foreground">Refund & Return Policy</h2>
                  <p className="text-sm text-muted-foreground">Last updated: March 2026</p>

                  <div className="space-y-5 text-muted-foreground leading-relaxed text-sm md:text-base font-sans">
                    <p>
                      Thank you for choosing ColourMyMemories, where we create custom colouring books based on your personal stories, photos, and details. Because every book is made just for you, all sales are final, but don't worry, we've built a process that makes sure you're completely happy before anything goes to print! Here's how it works 👇
                    </p>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground font-sans">How the Buying Process Works</h3>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li>Upload your photos and provide your contact info plus story details.</li>
                        <li>Agree to this policy.</li>
                        <li>Make payment and receive immediate confirmation.</li>
                        <li>Get a full digital copy to review for any changes.</li>
                        <li>Approve (or request revisions, we'll adjust until you're satisfied!).</li>
                        <li>We print and ship your approved custom book. 🎉</li>
                      </ol>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground font-sans">No Returns or Refunds</h3>
                      <p>
                        Because each book is uniquely yours, we aren't able to offer returns or refunds at any stage. But here's the good news:
                      </p>
                      <ul className="list-disc pl-6 space-y-1.5">
                        <li>You get to review the complete digital product after payment and before we print anything.</li>
                        <li>This means you can make sure everything is exactly how you want it before it goes to production.</li>
                        <li>Custom items can't be resold, which is why we put so much effort into getting it right with you first.</li>
                        <li>All product info (sizes, materials, process) is detailed on our website so there are no surprises.</li>
                      </ul>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground font-sans">Revisions</h3>
                      <p>
                        Not quite right? No problem! You can request changes on your digital proof and we'll revise it promptly at no extra cost, we keep going until you're happy. 😊
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground font-sans">Shipping and Delays</h3>
                      <p>
                        Shipping times after you approve your proof are estimates, unfortunately, we can't control carrier delays, but we do our best to keep things moving. You'll receive a tracking link via your confirmation email so you can follow your order every step of the way.
                      </p>
                      <p className="pt-2">
                        Questions? We're always happy to help, <a href="mailto:sales@colourmymemories.co.za" className="text-primary hover:underline font-semibold">contact us</a> anytime!
                      </p>
                    </section>

                    <p className="text-xs text-muted-foreground/75 pt-4 border-t border-border/40">
                      Last updated March 2026. By ordering, you accept these terms.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-foreground">Shipping Policy</h2>
                  <p className="text-sm text-muted-foreground">Last updated: March 2026</p>

                  <div className="space-y-5 text-muted-foreground leading-relaxed text-sm md:text-base font-sans">
                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">1. Processing Time</h3>
                      <p>
                        Each colouring book is custom-made. Please allow 7–14 business days for production before shipping. We'll keep you updated on the progress of your order.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">2. Delivery Within South Africa</h3>
                      <p>
                        We ship nationwide within South Africa. Delivery typically takes 3–5 business days after production is complete, depending on your location.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">3. Shipping Costs</h3>
                      <p>
                        Shipping costs are calculated at checkout based on your delivery address. We offer flat-rate and free shipping promotions from time to time.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">4. Tracking</h3>
                      <p>
                        Once your order has been shipped, you will receive a tracking number via email or WhatsApp so you can follow your delivery.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">5. International Shipping</h3>
                      <p>
                        We currently only ship within South Africa. International shipping may be available in the future. Please contact us for special arrangements.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'terms' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-foreground">Terms of Service</h2>
                  <p className="text-sm text-muted-foreground">Last updated: March 2026</p>

                  <div className="space-y-5 text-muted-foreground leading-relaxed text-sm md:text-base font-sans">
                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">1. Overview</h3>
                      <p>
                        By placing an order with ColourMyMemories, you agree to these terms of service. Please read them carefully before submitting your order.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">2. Products</h3>
                      <p>
                        ColourMyMemories creates personalised colouring storybooks from your submitted photos and stories. The final product is a custom-made item and may vary slightly from previews or expectations due to the nature of the creative process.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">3. Content Ownership</h3>
                      <p>
                        You retain full ownership of all photos and stories you submit. By submitting content, you grant ColourMyMemories a limited licence to use it solely for the purpose of creating your colouring book.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">4. Acceptable Content</h3>
                      <p>
                        We reserve the right to refuse any order that contains content we deem inappropriate, offensive, or in violation of any laws. We will notify you and issue a full refund in such fees.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">5. Payment</h3>
                      <p>
                        Full payment is required at the time of order. We accept payments through secure banking channels or EFT. All prices are listed in South African Rand (ZAR) and are universal regardless of your location.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">6. Limitation of Liability</h3>
                      <p>
                        ColourMyMemories shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">7. Changes to Terms</h3>
                      <p>
                        We reserve the right to update these terms at any time. Changes will be posted on this page with an updated date.
                      </p>
                    </section>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

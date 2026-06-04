import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Lock, ShieldCheck, AlertCircle, Loader2, ClipboardList, ExternalLink } from 'lucide-react';

interface OrderFormProps {
  navigate: (to: string) => void;
}

export default function OrderForm({ navigate }: OrderFormProps) {
  // Global form targets
  const baseEmbedUrl = "https://docs.google.com/forms/d/e/1FAIpQLSf9c_gsjPPnxFNN5SGK8i1cqI4P-kx29RF6jKGZ47ZVJrPn2A/viewform?embedded=true";
  
  // Try to find cached email, otherwise use the active session user's email
  const getInitialEmail = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryEmail = params.get('email');
      if (queryEmail) return queryEmail;
      
      const cached = localStorage.getItem('last_paystack_payment');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.email) return parsed.email;
      }
    } catch (_) {}
    return 'tylerjohnhellyer@gmail.com';
  };

  const getInitialEmbedUrl = (email: string) => {
    if (email && email.includes('@')) {
      return `${baseEmbedUrl}&emailAddress=${encodeURIComponent(email)}`;
    }
    return baseEmbedUrl;
  };

  const initialEmail = getInitialEmail();
  const [emailAddress, setEmailAddress] = useState(initialEmail);
  const [embedUrl, setEmbedUrl] = useState(getInitialEmbedUrl(initialEmail));
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submittedFormChecked, setSubmittedFormChecked] = useState(false);

  // Paystack credit card states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [packageType, setPackageType] = useState<'single' | 'duo' | 'family'>('single');
  
  // Interface states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'amex' | 'generic'>('generic');

  // Promo / Discount Code States
  const [promoInput, setPromoInput] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccessMsg('');
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a promo code.');
      return;
    }
    if (code === 'WELCOME30') {
      setAppliedCode('WELCOME30');
      setPromoSuccessMsg('WELCOME30 code applied! 30% discount matches updated total.');
    } else if (code === 'TESTING99') {
      setAppliedCode('TESTING99');
      setPromoSuccessMsg('TESTING99 live testing code applied! 99% discount enabled.');
    } else {
      setPromoError('Invalid promo code. Please specify a correct code.');
    }
  };

  // Detect card issuer in real time
  useEffect(() => {
    const rawNumber = cardNumber.replace(/\D/g, '');
    if (rawNumber.startsWith('4')) {
      setCardBrand('visa');
    } else if (/^(5[1-5]|2[2-7])/.test(rawNumber)) {
      setCardBrand('mastercard');
    } else if (/^(34|37)/.test(rawNumber)) {
      setCardBrand('amex');
    } else {
      setCardBrand('generic');
    }
  }, [cardNumber]);

  // Handle formatted card number output
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    const matches = value.match(/\d{1,4}/g);
    const formatted = matches ? matches.join(' ') : '';
    setCardNumber(formatted);
  };

  // Handle MM/YY string parsing
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    setExpiry(value);
  };

  // Handle only digits in CVC
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvc(value);
    }
  };

  // Pricing schema - simplified to a single product of R 600
  const getPackagePrice = () => {
    return 600; // ZAR
  };

  const getPackageLabel = () => {
    return 'ColourMyMemories Custom Storybook';
  };

  const getDiscountedPrice = () => {
    const base = getPackagePrice();
    if (appliedCode === 'WELCOME30') {
      return base * 0.70; // 30% discount
    }
    if (appliedCode === 'TESTING99') {
      return base * 0.01; // 99% discount
    }
    return base;
  };

  const handlePayNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Field validates
    if (!emailAddress || !emailAddress.includes('@')) {
      setErrorMessage('Please enter a valid email address for your electronic receipt.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter a valid Phone Number.');
      return;
    }
    if (!submittedFormChecked) {
      setErrorMessage('Please confirm that you have submitted your information on the Google Form by ticking the checkbox.');
      return;
    }
    if (!cardName.trim()) {
      setErrorMessage('Please enter the Cardholder Name as written on the card.');
      return;
    }
    const cleanNum = cardNumber.replace(/\D/g, '');
    if (cleanNum.length < 15) {
      setErrorMessage('Please enter a valid credit card number.');
      return;
    }
    if (expiry.length < 5) {
      setErrorMessage('Please specify month and year of expiry (MM/YY).');
      return;
    }
    if (cvc.length < 3) {
      setErrorMessage('Please specify the CVC security code (printed on reverse).');
      return;
    }

    setIsSubmitting(true);

    // Retrieve Paystack public key dynamically from configuration environments or default sandbox
    const metaEnv = (import.meta as any).env || {};
    const processEnv = typeof process !== 'undefined' ? ((process as any).env || {}) : {};
    const publicKey = 
      (metaEnv.VITE_PAYSTACK_PUBLIC_KEY) || 
      (metaEnv.PAYSTACK_PUBLIC_KEY) || 
      (processEnv.PAYSTACK_PUBLIC_KEY) || 
      'pk_test_df98f6a9e1442111161d9a0d1d2b8b99ec0ce3bf';

    const finalCheckoutTotal = getDiscountedPrice();
    // Base amount is hardcoded to exactly 60000 (R 600 * 100) as requested.
    // If a discount code is active (e.g., WELCOME30 or TESTING99), we adjust it to the discounted amount times 100 to support safe testing of live/sandbox transactions!
    const finalAmountInCents = appliedCode ? Math.round(finalCheckoutTotal * 100) : 60000;

    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) {
      setErrorMessage('Secure payment service is temporarily unavailable. Check your network or retry.');
      setIsSubmitting(false);
      return;
    }

    const handleSuccess = async (response: any) => {
      const reference = response ? (response.reference || response.trxref || '') : '';
      console.log('[Paystack Secure OK] Reference:', reference);
      try {
        // Save transaction onto existing order confirmation database record on server
        await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: reference,
            email: emailAddress,
            name: cardName,
            amount: finalCheckoutTotal
          })
        });

        // Cache payment metrics locally for client thank-you page presentation
        localStorage.setItem('last_paystack_payment', JSON.stringify({
          reference: reference,
          email: emailAddress,
          amount: finalCheckoutTotal.toFixed(2),
          name: cardName
        }));

        // Direct route transition to thank you view
        navigate('/thank-you');
      } catch (apiErr) {
        console.error('Failure saving transaction confirmation securely:', apiErr);
        localStorage.setItem('last_paystack_payment', JSON.stringify({
          reference: reference,
          email: emailAddress,
          amount: finalCheckoutTotal.toFixed(2),
          name: cardName
        }));
        navigate('/thank-you');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleClose = () => {
      console.log('Window closed');
      setIsSubmitting(false);
      setErrorMessage('Payment cancelled by user.');
    };

    try {
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: publicKey,
        email: emailAddress,
        amount: finalAmountInCents, // Pass secured locked major unit multiplied by 100
        currency: 'ZAR',
        metadata: {
          custom_fields: [
            {
              display_name: "Cardholder Name",
              variable_name: "cardholder_name",
              value: cardName
            },
            {
              display_name: "Custom Package",
              variable_name: "custom_package",
              value: getPackageLabel()
            }
          ]
        },
        callback: function(response: any) { handleSuccess(response); },
        onSuccess: function(response: any) { handleSuccess(response); },
        onClose: function() { handleClose(); },
        onCancel: function() { handleClose(); }
      });
    } catch (ex) {
      console.warn('Paystack constructor failed - using inline popup setup fallback:', ex);
      try {
        const handler = PaystackPop.setup({
          key: publicKey,
          email: emailAddress,
          amount: finalAmountInCents,
          currency: 'ZAR',
          callback: function(response: any) { handleSuccess(response); },
          onSuccess: function(response: any) { handleSuccess(response); },
          onClose: function() { handleClose(); },
          onCancel: function() { handleClose(); }
        });
        handler.openIframe();
      } catch (setupErrBefore: any) {
        setIsSubmitting(false);
        setErrorMessage(`Unable to initialize transaction popup: ${setupErrBefore.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      {/* Navbar Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/15">
              <img 
                src="/logo_new.png" 
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

      {/* Main Content container */}
      <div className="container mx-auto px-4 py-12 max-w-5xl flex-grow space-y-8">
        <div className="text-center mb-10 animate-fade-in-up space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Order Your <span className="text-gradient-rainbow">Colouring Book</span>
          </h1>
          <p className="text-muted-foreground text-md max-w-xl mx-auto">
            Complete the official order form and submit your memories, then secure your purchase via the card checkout gateway below.
          </p>
        </div>

        {/* Step 1: Official Order Form - Full Width Container */}
        <div className="w-full space-y-6 animate-fade-in-up">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft space-y-4">
            <div className="flex flex-col gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary w-fit rounded-full text-xs font-bold leading-none">
                Step 1
              </span>
              <h2 className="text-xl font-bold text-foreground">Official Order Form</h2>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Provide your contact information, delivery details, sweet custom story preferences, and attach files directly inside the official Google Form.
            </p>

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-[11px] text-primary font-semibold leading-relaxed flex items-center gap-2">
              <span>💡</span>
              <span>
                <strong>How it works:</strong> Click the button below to open and fill out your order details securely. Please make sure to return to this page to complete your payment after submitting the form.
              </span>
            </div>

            {/* Direct Button instead of iframe to completely remove whitespace and any collapsed views */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <a 
                href={(() => {
                  const cleanBase = "https://docs.google.com/forms/d/e/1FAIpQLSf9c_gsjPPnxFNN5SGK8i1cqI4P-kx29RF6jKGZ47ZVJrPn2A/viewform";
                  if (emailAddress && emailAddress.includes('@')) {
                    return `${cleanBase}?emailAddress=${encodeURIComponent(emailAddress)}`;
                  }
                  return cleanBase;
                })()}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center whitespace-nowrap transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <ClipboardList className="w-5 h-5" />
                Fill Out Order Form
                <ExternalLink className="w-4 h-4 opacity-75" />
              </a>
              <p className="text-xs text-muted-foreground leading-relaxed text-center sm:text-left max-w-md">
                Opens the secure form in a new tab. Once completed, proceed to fill out your card details below under Step 2.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Secure Card Payment - Stacked Below Step 1 */}
        <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in-up">
          
          {/* Payment card container */}
          <form onSubmit={handlePayNowSubmit} className="bg-card rounded-2xl border border-border p-6 shadow-soft space-y-5">
              <div className="flex flex-col gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 w-fit rounded-full text-xs font-bold leading-none">
                  Step 2
                </span>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Secure Card Payment</h2>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed border-b border-border/40 pb-3">
                Securely clear your order payment using your Visa, MasterCard, or AmEx card via the protected Paystack gateway.
              </p>

              {/* Error indicator status */}
              {errorMessage && (
                <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-start gap-2 animate-scale-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-normal">{errorMessage}</span>
                </div>
              )}

              {/* Single Product Details (Unclickable) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Product Description
                </label>
                <div className="p-4 rounded-xl border border-border/80 bg-muted/10 flex justify-between items-center shadow-inner">
                  <div>
                    <span className="text-xs font-extrabold text-foreground block">ColourMyMemories Custom Storybook</span>
                    <span className="text-[10px] text-muted-foreground block leading-relaxed mt-0.5">
                      Hand-drawn vector coloring outlines of your memories.
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="font-extrabold text-sm text-foreground font-mono block">R 600.00</span>
                    <span className="text-[9px] text-emerald-600 font-extrabold block uppercase tracking-wider">ZAR</span>
                  </div>
                </div>
              </div>

              {/* Secure Credit Card Fields */}
              <div className="space-y-3.5 pt-2">
                {/* Email and Phone Number Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label htmlFor="email" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Email
                      </label>
                      <span className="text-[9px] text-primary font-bold">
                        💡 Syncs Step 1
                      </span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      onBlur={() => {
                        if (emailAddress && emailAddress.includes('@')) {
                          setEmbedUrl(`${baseEmbedUrl}&emailAddress=${encodeURIComponent(emailAddress)}`);
                        }
                      }}
                      className="w-full h-11 bg-muted/10 text-sm font-semibold rounded-xl border border-border/80 px-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="e.g. +27 82 123 4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full h-11 bg-muted/10 text-sm font-semibold rounded-xl border border-border/80 px-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1">
                  <label htmlFor="cardname" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Cardholder Name
                  </label>
                  <input
                    id="cardname"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full h-11 bg-muted/10 text-sm font-semibold rounded-xl border border-border/80 px-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Card Number */}
                <div className="space-y-1">
                  <label htmlFor="cardnum" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block flex justify-between">
                    <span>Card Number</span>
                    {cardBrand !== 'generic' && (
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                        {cardBrand} Detected
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      id="cardnum"
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full h-11 bg-muted/10 text-sm font-mono font-bold rounded-xl border border-border/80 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/30"
                    />
                    <div className="absolute right-3.5 top-3 text-muted-foreground/45">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Secure Row Expiry and CVC */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry */}
                  <div className="space-y-1">
                    <label htmlFor="cardexpiry" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Expiry Date
                    </label>
                    <input
                      id="cardexpiry"
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="w-full h-11 bg-muted/10 text-sm font-semibold text-center rounded-xl border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* CVC */}
                  <div className="space-y-1">
                    <label htmlFor="cardcvc" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      CVC Code
                    </label>
                    <input
                      id="cardcvc"
                      type="password"
                      required
                      placeholder="123"
                      maxLength={4}
                      value={cvc}
                      onChange={handleCvcChange}
                      className="w-full h-11 bg-muted/10 text-sm font-bold text-center tracking-widest rounded-xl border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 placeholder:tracking-normal"
                    />
                  </div>
                </div>
              </div>

              {/* Promo / Discount Code Input Box */}
              <div className="space-y-1.5 pt-2">
                <label htmlFor="promocode" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Promo / Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="promocode"
                    type="text"
                    disabled={appliedCode !== ''}
                    placeholder="PROMO CODE"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      if (promoError) setPromoError('');
                    }}
                    className="flex-grow h-11 bg-muted/10 text-sm font-bold uppercase tracking-widest rounded-xl border border-border/80 px-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/30 placeholder:normal-case disabled:opacity-60"
                  />
                  {appliedCode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCode('');
                        setPromoInput('');
                        setPromoSuccessMsg('');
                      }}
                      className="px-4 h-11 bg-destructive/10 hover:bg-destructive/15 text-destructive rounded-xl text-xs font-bold transition-all cursor-pointer border border-destructive/20"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-5 h-11 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-soft"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {promoSuccessMsg && (
                  <span className="text-[11px] text-emerald-600 font-bold block animate-scale-in">
                    ✓ {promoSuccessMsg}
                  </span>
                )}
                {promoError && (
                  <span className="text-[11px] text-destructive font-semibold block animate-scale-in">
                    ✗ {promoError}
                  </span>
                )}
              </div>

              {/* Billing Summary Box */}
              <div className="bg-muted/15 border border-border/40 rounded-xl p-4 space-y-2 mt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block tracking-wider">
                  Billing Summary ZAR
                </span>
                <div className="flex justify-between items-center text-xs md:text-sm font-semibold">
                  <span className="text-muted-foreground truncate max-w-[200px]">
                    {getPackageLabel()}
                  </span>
                  <span className="text-foreground font-mono font-bold">R {getPackagePrice().toFixed(2)}</span>
                </div>
                
                {/* Applied details */}
                {appliedCode && (
                  <div className="flex justify-between items-center text-xs md:text-sm font-semibold border-t border-border/30 pt-2 mt-1">
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      Discount Approved ({appliedCode})
                    </span>
                    <span className="text-emerald-600 font-mono font-bold">
                      -R {(getPackagePrice() - getDiscountedPrice()).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs md:text-sm font-semibold border-t border-border/30 pt-2 mt-1">
                  <span className="text-muted-foreground">Nationwide Delivery</span>
                  <span className="text-emerald-500 font-extrabold uppercase text-[10px]">Free / Included</span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-t border-border/30 pt-2.5 mt-1 font-bold">
                  <span className="text-foreground">Total Checkout Cost</span>
                  <span className="text-gradient-rainbow font-black font-sans text-base">R {getDiscountedPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Required Google Form Confirmation Checkbox */}
              <div className="pt-2 px-1">
                <div className="flex items-start gap-3 bg-primary/5 p-3.5 rounded-xl border border-primary/10 hover:border-primary/20 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      id="submittedFormChecked"
                      type="checkbox"
                      required
                      checked={submittedFormChecked}
                      onChange={(e) => setSubmittedFormChecked(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-border text-primary focus:ring-primary focus:ring-1 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="submittedFormChecked" className="text-xs text-foreground/85 font-semibold leading-relaxed cursor-pointer select-none">
                    I have submitted my information on the Google Form
                    <span className="text-destructive ml-1 font-bold">*</span>
                  </label>
                </div>
              </div>

              {/* Secure Checkout action button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center h-12 rounded-xl text-sm font-extrabold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-soft disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing Paystack Portal…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Pay Now (R {getDiscountedPrice().toFixed(2)})
                  </>
                )}
              </button>

              <p className="text-[10px] text-muted-foreground leading-snug text-center max-w-xs mx-auto">
                Payments are secured via PCI-DSS compliant 3D Secure verification directly through Paystack. Your card credentials are never stored.
              </p>
            </form>
          </div>
        </div>
      </div>
  );
}

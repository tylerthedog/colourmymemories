import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Loader2, CheckCircle2, Image as ImageIcon, Trash2, CreditCard, Copy, Check, ExternalLink, Lock } from 'lucide-react';
import StoryHelper from './StoryHelper';

interface OrderFormProps {
  navigate: (to: string) => void;
}

interface FormState {
  customer_name: string;
  email: string;
  phone: string;
  story: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export default function OrderForm({ navigate }: OrderFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormState>({
    customer_name: '',
    email: '',
    phone: '',
    story: '',
    street: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'South Africa'
  });

  const [submissionMode, setSubmissionMode] = useState<'interactive' | 'embed'>('interactive');

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendError, setBackendError] = useState('');

  const [submittedOrderId, setSubmittedOrderId] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const validImages = files.filter((file) => {
      const isImg = file.type.startsWith('image/');
      const isUnderLimit = file.size <= 10 * 1024 * 1024; // 10MB
      return isImg && isUnderLimit;
    });

    if (validImages.length < files.length) {
      alert("Some files were skipped. Only images under 10MB are allowed.");
    }

    setPhotos((prev) => [...prev, ...validImages]);

    validImages.forEach((img) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setPhotoPreviews((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(img);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.customer_name.trim()) tempErrors.customer_name = "Name is required.";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email address.";
    }
    if (!formData.street.trim()) tempErrors.street = "Street address is required.";
    if (!formData.city.trim()) tempErrors.city = "City is required.";
    if (!formData.province.trim()) tempErrors.province = "Province is required.";
    if (!formData.postal_code.trim()) tempErrors.postal_code = "Postal code is required.";
    if (!formData.country.trim()) tempErrors.country = "Country is required.";
    return tempErrors;
  };

  // Convert File to Base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setBackendError('');

    const formValidationErrors = validateForm();
    if (Object.keys(formValidationErrors).length > 0) {
      setErrors(formValidationErrors);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    if (photos.length === 0) {
      setBackendError("Please upload at least one photo for your colouring book.");
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate a unique dynamic order ID
      const timestampPart = Date.now().toString().slice(-6);
      const randPart = Math.floor(100 + Math.random() * 900);
      const orderId = `CMM-${timestampPart}-${randPart}`;

      // 2. Format Story Details content: Bundling story, email, list of uploaded files as details
      let storyDetailsContent = `=== STORY/BOOK DESCRIPTION ===\n${formData.story || 'No text story provided.'}\n\n`;
      storyDetailsContent += `=== CLIENT INFORMATION ===\n`;
      storyDetailsContent += `Email: ${formData.email}\n`;
      storyDetailsContent += `Phone: ${formData.phone || 'None'}\n\n`;
      
      storyDetailsContent += `=== UPLOADED MEDIA ASSETS ===\n`;
      if (storyFile) {
        storyDetailsContent += `Narrative File: ${storyFile.name} (${(storyFile.size / 1024).toFixed(1)} KB)\n`;
      } else {
        storyDetailsContent += `Narrative File: None Provided\n`;
      }
      
      if (photos.length > 0) {
        storyDetailsContent += `Total Photos Attached: ${photos.length}\n`;
        photos.forEach((file, index) => {
          storyDetailsContent += ` - File #${index + 1}: ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n`;
        });
      } else {
        storyDetailsContent += `Photos Attached: None\n`;
      }
      storyDetailsContent += `\n[Reference ID: ${orderId}]`;

      // 3. Submit directly to Google Forms using a hidden iframe form submission.
      // This is the absolute gold-standard, bulletproof method that completely bypasses
      // browser CORS blocks, adblockers, and browser-specific fetch tracking preventions.
      const iframe = document.createElement('iframe');
      iframe.name = 'google_form_iframe';
      iframe.id = 'google_form_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSf9c_gsjPPnxFNN5SGK8i1cqI4P-kx29RF6jKGZ47ZVJrPn2A/formResponse';
      form.target = 'google_form_iframe';

      const fields: Record<string, string> = {
        'entry.1474310025': formData.customer_name,
        'entry.1082449212': formData.phone || '',
        'entry.577022071': formData.street,
        'entry.1697465648': formData.city,
        'entry.1493182288': formData.province,
        'entry.1143424652': formData.postal_code,
        'entry.1691663973': formData.country,
        'entry.1137043253': storyDetailsContent,
        'emailAddress': formData.email
      };

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // Clean up DOM elements after a brief duration
      setTimeout(() => {
        try {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        } catch (domErr) {
          console.warn('DOM cleanup warning:', domErr);
        }
      }, 5000);

      // 4. Also upload image files to the backend server (async, non-blocking fallback)
      // This ensures that the uploaded images and stories are backed up to Cloudflare R2 / local disk
      try {
        const base64Photos = await Promise.all(
          photos.map(async (file) => {
            const base64Data = await fileToBase64(file);
            return {
              name: file.name,
              type: file.type,
              base64Data
            };
          })
        );

        let base64StoryFile = null;
        if (storyFile) {
          const base64Data = await fileToBase64(storyFile);
          base64StoryFile = {
            name: storyFile.name,
            type: storyFile.type,
            base64Data
          };
        }

        // Auto-detect backend endpoint URL (handles local express dev as well as Netlify production)
        const isNetlify = window.location.hostname.includes('netlify.app');
        const apiEndpoint = isNetlify ? '/.netlify/functions/submit-order' : '/api/submit-order';

        await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            details: {
              customer_name: formData.customer_name,
              email: formData.email,
              phone: formData.phone,
              street: formData.street,
              city: formData.city,
              province: formData.province,
              postal_code: formData.postal_code,
              country: formData.country,
              story: formData.story
            },
            photos: base64Photos,
            storyFile: base64StoryFile
          })
        });
      } catch (backendApiErr) {
        // Encase in catch block to avoid disrupting successful browser form submission
        console.warn('Backend image repository backup warning:', backendApiErr);
      }

      // 5. Update state on successful completion to advance the user directly to the payment view
      setSubmittedOrderId(orderId);
      setIsSubmitted(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error('Order checkout submission error:', err);
      setBackendError("Something went wrong during order processing. Please try again or reach out to us directly over WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    const handleCopyText = (text: string, fieldName: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(''), 2000);
      }).catch((err) => {
        console.error('Failed to copy text:', err);
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center px-4 py-12 md:py-20">
        <div className="max-w-2xl w-full bg-card rounded-3xl border border-border p-6 md:p-10 shadow-card animate-fade-in-up space-y-8">
          {/* Header Status */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-accent/15 text-accent flex items-center justify-center mx-auto rounded-full shadow-soft animate-scale-in">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Order Received! <span className="text-gradient-rainbow">Next Step Below</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Your custom colouring book draft has been registered. Please complete the EFT payment below so we can start generating your custom illustratons.
            </p>
          </div>

          {/* Reference Banner */}
          <div className="bg-muted/30 border border-border/80 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-auto text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Your Order Reference ID</p>
              <p className="text-lg font-mono font-bold text-foreground mt-0.5">{submittedOrderId || 'CMM-ORDER-PENDING'}</p>
            </div>
            <div className="w-full sm:w-auto flex justify-center">
              <button
                type="button"
                onClick={() => handleCopyText(submittedOrderId || 'CMM-ORDER-PENDING', 'refid')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted text-foreground transition-all duration-200 cursor-pointer shadow-subtle active:scale-95 whitespace-nowrap"
              >
                {copiedField === 'refid' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-accent animate-scale-in" />
                    <span className="text-accent font-bold">Copied Ref ID!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Reference ID</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* EFT Bank details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Direct Bank Transfer (EFT)</h2>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              {/* Account Name */}
              <div className="bg-muted/10 border border-border/50 rounded-xl p-4 flex justify-between items-center group relative">
                <div>
                  <span className="text-xs text-muted-foreground/80 block font-semibold mb-0.5">Account Holder Name</span>
                  <span className="text-sm font-bold text-foreground">ColourMyMemories</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText('ColourMyMemories', 'holder')}
                  className="w-8 h-8 rounded-lg hover:bg-muted/65 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                  title="Copy Name"
                >
                  {copiedField === 'holder' ? <Check className="w-3.5 h-3.5 text-accent animate-scale-in" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Bank Name */}
              <div className="bg-muted/10 border border-border/50 rounded-xl p-4 flex justify-between items-center group relative">
                <div>
                  <span className="text-xs text-muted-foreground/80 block font-semibold mb-0.5">Bank Name</span>
                  <span className="text-sm font-bold text-foreground">First National Bank (FNB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText('First National Bank', 'bank')}
                  className="w-8 h-8 rounded-lg hover:bg-muted/65 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                  title="Copy Bank"
                >
                  {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-accent animate-scale-in" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Account Number */}
              <div className="bg-muted/10 border border-border/50 rounded-xl p-4 flex justify-between items-center group relative font-semibold">
                <div>
                  <span className="text-xs text-muted-foreground/80 block font-semibold mb-0.5">Account Number</span>
                  <span className="text-sm font-mono font-bold text-foreground">63098521043</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText('63098521043', 'acnum')}
                  className="w-8 h-8 rounded-lg hover:bg-muted/65 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                  title="Copy Account Number"
                >
                  {copiedField === 'acnum' ? <Check className="w-3.5 h-3.5 text-accent animate-scale-in" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Branch Code */}
              <div className="bg-muted/10 border border-border/50 rounded-xl p-4 flex justify-between items-center group relative font-semibold">
                <div>
                  <span className="text-xs text-muted-foreground/80 block font-semibold mb-0.5">Branch Code</span>
                  <span className="text-sm font-mono font-bold text-foreground">250655</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText('250655', 'bcode')}
                  className="w-8 h-8 rounded-lg hover:bg-muted/65 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                  title="Copy Branch Code"
                >
                  {copiedField === 'bcode' ? <Check className="w-3.5 h-3.5 text-accent animate-scale-in" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Reference Warning */}
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl p-4 md:p-5 text-sm leading-relaxed font-sans flex gap-3 shadow-sm">
              <Lock className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <strong>Deposit Reference Requirement:</strong> Please use your reference code <span className="font-mono bg-amber-500/10 px-1 py-0.5 rounded font-bold">{submittedOrderId || 'CMM-XXXXXX'}</span>. E-mail your proof of transfer to <strong className="font-semibold text-amber-700">tylerjohnhellyer@gmail.com</strong> or WhatsApp it below to fast-track your book's curation.
              </div>
            </div>
          </div>

          {/* Pricing Info Note */}
          <div className="border-t border-border/70 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">What happens next?</h3>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside pl-1 leading-relaxed">
              <li>Once payment triggers, our artists begin turning your memories into custom black &amp; white colouring sheets.</li>
              <li>Within 5–7 days, we'll email or WhatsApp you a digital proofing preview.</li>
              <li>You can request revisions to the drawings and texts until you are 100% satisfied.</li>
              <li>Only after your explicit sign-off do we proceed to print, bind, and ship your A5 book nationwide.</li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0 });
              }}
              className="flex-1 inline-flex items-center justify-center h-12 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted text-foreground transition-all duration-200 cursor-pointer shadow-subtle active:scale-97"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              Return to Homepage
            </button>
            <a
              href={`https://wa.me/27608291485?text=Hi%20ColourMyMemories%2C%20I've%20just%20submitted%20an%20order!%20My%20Reference%20is%20${encodeURIComponent(submittedOrderId || 'CMM-ORDER')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center h-12 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white transition-all duration-200 cursor-pointer shadow-soft active:scale-97"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-2" />
              WhatsApp Proof of Payment
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Dynamic navbar header */}
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
            Back
          </button>
        </div>
      </header>

      {/* Main Order Content */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-10 animate-fade-in-up space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Order Your <span className="text-gradient-rainbow">Colouring Book</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Fill in your details, share your story, and upload your memories.
          </p>
        </div>

        {/* Submission Mode Selector */}
        <div className="flex justify-center mb-10 animate-fade-in-up">
          <div className="bg-card p-1 text-center rounded-2xl border border-border flex gap-1 inline-flex shadow-sm">
            <button
              type="button"
              onClick={() => setSubmissionMode('interactive')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                submissionMode === 'interactive'
                  ? 'bg-primary text-primary-foreground shadow-soft scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Interactive Story Wizard
            </button>
            <button
              type="button"
              onClick={() => setSubmissionMode('embed')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                submissionMode === 'embed'
                  ? 'bg-primary text-primary-foreground shadow-soft scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Direct Google Form (Embedded)
            </button>
          </div>
        </div>

        {backendError && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm rounded-2xl flex items-center gap-2 animate-scale-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 rotate-45" />
            <span>{backendError}</span>
          </div>
        )}

        {submissionMode === 'embed' ? (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft space-y-4">
              <h2 className="text-xl font-bold text-foreground">Direct Google Form Submission</h2>
              <p className="text-sm text-muted-foreground">
                Prefer to provide your order information directly in the official Google Form? You can fill it out below. Once done, proceed to the EFT payment instructions on this page.
              </p>
              
              <div className="rounded-2xl overflow-hidden border border-border/80 bg-white">
                <iframe 
                  src="https://docs.google.com/forms/d/e/1FAIpQLSf9c_gsjPPnxFNN5SGK8i1cqI4P-kx29RF6jKGZ47ZVJrPn2A/viewform?embedded=true" 
                  width="100%" 
                  height="850" 
                  className="w-full h-[850px] border-0"
                  title="Direct Google Form"
                >
                  Loading…
                </iframe>
              </div>
            </div>

            {/* Direct Bank details / Next steps shown helper for direct form submitters */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft space-y-5">
              <h2 className="text-lg font-bold text-foreground">Payment Instructions (EFT)</h2>
              <p className="text-sm text-muted-foreground">
                After submitting the Google Form above, please use the following EFT details to finalize your custom book order. 
              </p>
              
              <div className="grid gap-3.5 sm:grid-cols-2 font-semibold font-mono">
                <div className="bg-muted/10 border border-border/50 rounded-xl p-4 font-sans">
                  <span className="text-xs text-muted-foreground/80 block font-semibold mb-0.5">Account Holder Name</span>
                  <span className="text-sm font-bold text-foreground font-sans">ColourMyMemories</span>
                </div>
                <div className="bg-muted/10 border border-border/50 rounded-xl p-4 font-sans">
                  <span className="text-xs text-muted-foreground/80 block font-semibold mb-0.5">Bank Name</span>
                  <span className="text-sm font-bold text-foreground font-sans">First National Bank (FNB)</span>
                </div>
                <div className="bg-muted/10 border border-border/50 rounded-xl p-4">
                  <span className="text-xs text-muted-foreground/80 block font-sans font-semibold mb-0.5">Account Number</span>
                  <span className="text-sm font-bold text-foreground">63098521043</span>
                </div>
                <div className="bg-muted/10 border border-border/50 rounded-xl p-4">
                  <span className="text-xs text-muted-foreground/80 block font-sans font-semibold mb-0.5">Branch Code</span>
                  <span className="text-sm font-bold text-foreground">250655</span>
                </div>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl p-4 text-sm leading-relaxed flex gap-3 shadow-sm">
                <Lock className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <strong>Proof of payment:</strong> Please email your payment confirmation to <strong className="font-semibold text-amber-700">tylerjohnhellyer@gmail.com</strong> or WhatsApp it to <strong className="font-semibold text-amber-700">+27 60 829 1485</strong> with your Full Name as reference so we can link your payment to your Google Form response.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
          {/* Card 1: Your Details */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Your Details</h2>
              <p className="text-sm text-muted-foreground">
                These details will be used to stay in contact with you during the custom crafting process.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="customer_name" className="text-sm font-bold text-muted-foreground">Full Name *</label>
                <input
                  id="customer_name"
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="Jane Doe"
                  className="w-full h-11 px-4 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground transition-all focus:outline-none placeholder:text-muted-foreground/50 text-sm font-sans"
                />
                {errors.customer_name && <p className="text-xs text-destructive mt-1 font-semibold">{errors.customer_name}</p>}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-bold text-muted-foreground">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jane@example.com"
                  className="w-full h-11 px-4 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground transition-all focus:outline-none placeholder:text-muted-foreground/50 text-sm font-sans"
                />
                {errors.email && <p className="text-xs text-destructive mt-1 font-semibold">{errors.email}</p>}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-bold text-muted-foreground">Phone Number</label>
              <input
                id="phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+27 60 829 1485"
                className="w-full h-11 px-4 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground transition-all focus:outline-none placeholder:text-muted-foreground/50 text-sm font-sans"
              />
            </div>
          </div>

          {/* Card 2: Custom Story (StoryHelper) */}
          <StoryHelper
            story={formData.story}
            onStoryChange={(text: string) => setFormData((prev) => ({ ...prev, story: text }))}
            storyFile={storyFile}
            onStoryFileChange={setStoryFile}
          />

          {/* Card 3: Upload Photos */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Upload Photos *</h2>
              <p className="text-sm text-muted-foreground">
                Upload the memorable photos you'd like us to convert into black & white colouring lines. Max 10MB per image.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[140px] flex flex-col items-center justify-center border-dashed border-2 border-border/85 hover:border-primary/50 rounded-2xl bg-muted/15 text-muted-foreground hover:text-foreground transition-all duration-300 cursor-pointer"
            >
              <Upload className="w-8 h-8 mb-2 text-muted-foreground/60" />
              <span className="text-sm font-semibold">Choose & Upload Memory Images</span>
              <span className="text-xs text-muted-foreground/60 mt-1">Accepts multiple images. Max 10MB each.</span>
            </button>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6 animate-fade-in-up">
                {photoPreviews.map((src, k) => (
                  <div key={k} className="relative group aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
                    <img src={src} alt={`Preview ${k + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => removePhoto(k)}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-soft hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-mono text-white font-bold select-none">
                      Photo {k + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Shipping Address */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Shipping Address</h2>
              <p className="text-sm text-muted-foreground">
                Provide your South African nationwide address where we should deliver the package.
              </p>
            </div>

            <div className="space-y-4">
              {/* Street Address */}
              <div className="space-y-1.5">
                <label htmlFor="street" className="text-sm font-bold text-muted-foreground">Street Address *</label>
                <input
                  id="street"
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="123 Keerom Street"
                  className="w-full h-11 px-4 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground focus:outline-none placeholder:text-muted-foreground/50 text-sm font-sans transition-all"
                />
                {errors.street && <p className="text-xs text-destructive mt-1 font-semibold">{errors.street}</p>}
              </div>

              {/* City and Province */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-sm font-bold text-muted-foreground">City *</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Cape Town"
                    className="w-full h-11 px-4 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground focus:outline-none placeholder:text-muted-foreground/50 text-sm font-sans transition-all"
                  />
                  {errors.city && <p className="text-xs text-destructive mt-1 font-semibold">{errors.city}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="province" className="text-sm font-bold text-muted-foreground">Province *</label>
                  <input
                    id="province"
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Western Cape"
                    className="w-full h-11 px-4 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground focus:outline-none placeholder:text-muted-foreground/50 text-sm font-sans transition-all"
                  />
                  {errors.province && <p className="text-xs text-destructive mt-1 font-semibold">{errors.province}</p>}
                </div>
              </div>

              {/* Postal Code and Country */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="postal_code" className="text-sm font-bold text-muted-foreground">Postal Code *</label>
                  <input
                    id="postal_code"
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="8001"
                    className="w-full h-11 px-4 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground focus:outline-none placeholder:text-muted-foreground/50 text-sm font-sans transition-all"
                  />
                  {errors.postal_code && <p className="text-xs text-destructive mt-1 font-semibold">{errors.postal_code}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="country" className="text-sm font-bold text-muted-foreground">Country *</label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground focus:outline-none text-sm font-sans transition-all"
                  />
                  {errors.country && <p className="text-xs text-destructive mt-1 font-semibold">{errors.country}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl text-base font-bold shadow-soft relative group overflow-hidden bg-primary tracking-wide text-primary-foreground flex items-center justify-center gap-2 transform active:scale-97 hover:scale-101 active:duration-100 transition-all cursor-pointer bg-gradient-to-r from-primary to-primary-foreground/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                <span>Processing Order File Uploads...</span>
              </>
            ) : (
              <span>Confirm & Request Custom Book</span>
            )}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Loader2, CheckCircle2, Image as ImageIcon, Trash2 } from 'lucide-react';
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

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendError, setBackendError] = useState('');

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
      // Read photos as base64 array
      const photoPayloads = await Promise.all(
        photos.map(async (file) => {
          const b64 = await fileToBase64(file);
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            base64Data: b64
          };
        })
      );

      // Read story file as base64 if present
      let storyFilePayload = null;
      if (storyFile) {
        const b64 = await fileToBase64(storyFile);
        storyFilePayload = {
          name: storyFile.name,
          type: storyFile.type,
          size: storyFile.size,
          base64Data: b64
        };
      }

      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          details: formData,
          photos: photoPayloads,
          storyFile: storyFilePayload
        })
      });

      if (!response.ok) {
        throw new Error('Server returned error status');
      }

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md space-y-6 animate-fade-in-up">
          <div className="w-16 h-16 bg-accent/15 text-accent flex items-center justify-center mx-auto rounded-full shadow-soft">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-gradient-rainbow">Thank You!</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your order has been submitted successfully to our South African design studio. We'll be in touch soon via email or WhatsApp to confirm your details, provide digital proofing, and arrange the EFT / PayFast payment details. 🎉
          </p>
          <button
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0 });
            }}
            className="inline-flex items-center px-8 py-3 rounded-xl text-sm font-bold shadow-soft gradient-primary text-primary-foreground transform active:scale-95 duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
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

        {backendError && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm rounded-2xl flex items-center gap-2 animate-scale-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 rotate-45" />
            <span>{backendError}</span>
          </div>
        )}

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
      </div>
    </div>
  );
}

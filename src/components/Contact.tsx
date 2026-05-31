import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const contactMethods = [
    { icon: Phone, title: "Phone", value: "060 829 1485", href: "tel:0608291485" },
    { icon: MessageSquare, title: "WhatsApp", value: "060 829 1485", href: "https://wa.me/27608291485" },
    { icon: Mail, title: "Email", value: "colourmymemories@gmail.com", href: "mailto:colourmymemories@gmail.com" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('All fields marked with * are required.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Service error');
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact submit error:', err);
      setErrorMsg('Failed to send message. Please try again or reach out to us directly over WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-muted/30 border-b border-border/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Title */}
          <div className="text-center mb-12 animate-fade-in-up space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Get In <span className="text-gradient-rainbow">Touch</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Have any questions or custom book ideas? Reach out and we'll reply promptly!
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-12 items-start animate-fade-in-up">
            {/* Left side: Contact methods details */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-foreground">Contact Details</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect with our South African creative studio across our direct channels or send us a quick mail here.
              </p>

              <div className="space-y-4 pt-2">
                {contactMethods.map((method, idx) => (
                  <a 
                    key={idx} 
                    href={method.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/40 transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <method.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{method.title}</h4>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{method.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Right side: quick form */}
            <div className="md:col-span-3 bg-card rounded-2xl border border-border/80 p-6 md:p-8 shadow-card">
              {isSubmitted ? (
                <div className="text-center py-12 space-y-4 animate-fade-in-up">
                  <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Message Sent! 🎉</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                    Thank you for reaching out. We will get back to you as soon as possible via email or WhatsApp.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2 rounded-xl text-xs font-bold border border-border/80 hover:bg-muted font-sans cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-bold text-foreground mb-1">Send a Message</h3>
                  
                  {errorMsg && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
                      {errorMsg}
                    </div>
                  )}

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="text-sm font-bold text-muted-foreground">Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full h-11 px-4.5 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground transition-all duration-250 focus:outline-none placeholder:text-muted-foreground/50 text-sm font-sans"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="text-sm font-bold text-muted-foreground">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full h-11 px-4.5 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground transition-all duration-250 focus:outline-none placeholder:text-muted-foreground/50 text-sm font-sans"
                    />
                  </div>

                  {/* Message field */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-sm font-bold text-muted-foreground">Your Message *</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your suggestions, questions, or custom story expectations here..."
                      className="w-full p-4 rounded-xl border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/15 bg-background text-foreground transition-all duration-250 focus:outline-none placeholder:text-muted-foreground/50 text-sm font-sans"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl text-sm font-bold shadow-soft flex items-center justify-center gap-2 gradient-primary text-primary-foreground transform duration-250 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

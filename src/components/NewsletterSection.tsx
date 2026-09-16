import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSubscribed(true);
    // Save to local storage for CMS subscriber view
    try {
      const raw = localStorage.getItem('FujiFinder_subscribers');
      const existing = raw ? JSON.parse(raw) : [];
      
      const alreadySubscribed = existing.some((item: any) => 
        typeof item === 'string' ? item === email : item?.email === email
      );

      if (!alreadySubscribed) {
        const newRecord = {
          email,
          date: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        };
        localStorage.setItem('FujiFinder_subscribers', JSON.stringify([...existing, newRecord]));
      }
    } catch {
      // ignore
    }
  };

  return (
    <section id="newsletter-subscription-section" className="py-8 md:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white p-8 sm:p-12 lg:p-14 border border-neutral-800/80 shadow-2xl">
        {/* Subtle decorative curved topo waves background svg */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <svg className="w-full h-full object-cover" viewBox="0 0 1000 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 200 C 150 100, 350 300, 600 200 C 850 100, 1050 300, 1300 200" stroke="white" strokeWidth="1.5" />
            <path d="M-100 250 C 150 150, 350 350, 600 250 C 850 150, 1050 350, 1300 250" stroke="white" strokeWidth="1.5" />
            <path d="M-100 300 C 150 200, 350 400, 600 300 C 850 200, 1050 400, 1300 300" stroke="white" strokeWidth="1.5" />
            <path d="M-100 150 C 150 50, 350 250, 600 150 C 850 50, 1050 250, 1300 150" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Icon + Text */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 shadow-inner">
              <Mail className="w-6 h-6 text-neutral-200" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight text-balance">
                Get the latest camera guides, reviews, and gear recommendations.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed">
                Join thousands of photography enthusiasts and never miss new articles, reviews, and exclusive deals.
              </p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-5">
            {subscribed ? (
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-emerald-500/40 text-emerald-400 flex items-center gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold text-white">You're on the list!</p>
                  <p className="text-neutral-300">We've sent a confirmation to <span className="font-medium text-white">{email}</span>.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-neutral-900/90 p-1.5 rounded-2xl sm:rounded-full border border-neutral-800 focus-within:border-neutral-600 transition-colors">
                  <input
                    type="email"
                    id="newsletter-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    id="newsletter-subscribe-btn"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold bg-white text-neutral-950 hover:bg-neutral-100 hover:shadow-lg transition-all cursor-pointer shrink-0"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-rose-400 px-2">{error}</p>
                )}

                <p className="text-[11px] text-neutral-500 px-2">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

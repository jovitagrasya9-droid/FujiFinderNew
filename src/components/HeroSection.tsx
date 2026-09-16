import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Article } from '../types';

interface HeroSectionProps {
  articles?: Article[];
  onReadStory: (slug: string) => void;
  onExploreCameras: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  articles = [],
  onReadStory,
  onExploreCameras,
}) => {
  const featuredArticles = articles.filter(
    (a) => a.featured || a.tags.includes('Featured')
  );
  const slides = featuredArticles.length > 0 ? featuredArticles : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const activeArticle = slides[currentIndex];

  // Default FujiFinder Hero when no articles exist yet
  const heroImage = activeArticle?.coverImage || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1920&q=85';
  const heroCategory = activeArticle?.category || 'FUJIFINDER • EDITORIAL';
  const heroDate = activeArticle?.date || 'EST. 2024';
  const heroTitle = activeArticle?.title || 'Capture More. Create Better.';
  const heroSubtitle = activeArticle?.summary || 'The premier discovery publication for photographers and filmmakers. Explore authentic camera reviews, field benchmarks, and visual craftsmanship.';

  return (
    <section
      id="hero-featured-story"
      className="pt-20 md:pt-24 px-3 sm:px-5 lg:px-8 max-w-[1440px] mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl min-h-[580px] md:min-h-[660px] lg:min-h-[720px] flex items-center bg-neutral-950">
        {/* Background Image with smooth cinematic transition */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={heroTitle}
            className="w-full h-full object-cover object-center transform scale-100 transition-all duration-1000 ease-out"
          />
          {/* Subtle cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/50 to-neutral-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/40 to-transparent w-full md:w-3/4" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-18 py-16 md:py-24 flex flex-col justify-between min-h-[540px] md:min-h-[620px]">
          <div className="max-w-2xl space-y-5 md:space-y-6">
            {/* Category / Date Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-neutral-900/70 border border-neutral-700/60 backdrop-blur-md text-xs font-medium text-neutral-200">
              <span className="font-semibold tracking-wider text-white uppercase text-[11px]">
                {heroCategory}
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-400" />
              <span className="text-neutral-300 text-[11px]">{heroDate}</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold tracking-tight text-white leading-[1.08] text-balance">
              {heroTitle.includes('.') ? (
                <>
                  <span className="block">{heroTitle.split('.')[0]}.</span>
                  <span className="block text-neutral-100">{heroTitle.split('.')[1]}</span>
                </>
              ) : (
                heroTitle
              )}
            </h1>

            {/* Short Supporting Description */}
            <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-xl font-normal leading-relaxed text-pretty">
              {heroSubtitle}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {activeArticle && (
                <button
                  id="hero-read-story-btn"
                  onClick={() => onReadStory(activeArticle.slug)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white text-neutral-950 hover:bg-neutral-100 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Read Story</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                id="hero-explore-cameras-btn"
                onClick={onExploreCameras}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  activeArticle
                    ? 'text-white bg-neutral-900/60 hover:bg-neutral-800/80 border border-white/20 hover:border-white/40 backdrop-blur-md'
                    : 'bg-white text-neutral-950 hover:bg-neutral-100 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <span>Explore Cameras</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Indicators (if multiple featured stories exist) */}
          {slides.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 pt-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 h-2 bg-white'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

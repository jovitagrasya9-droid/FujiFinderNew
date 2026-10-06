import React from 'react';
import { Camera, Layers, Aperture, Compass, Sparkles, ArrowRight } from 'lucide-react';
import { CategoryType } from '../types';

interface HomeIntroSectionProps {
  onNavigateToCameras: () => void;
  onSelectCategory: (category: CategoryType) => void;
}

export const HomeIntroSection: React.FC<HomeIntroSectionProps> = ({
  onNavigateToCameras,
  onSelectCategory,
}) => {
  const fujiPillars = [
    {
      title: 'Fujifilm X Series',
      desc: 'APS-C mirrorless cameras renowned for compact form factors, classic mechanical dials, and legendary film simulations.',
      tag: 'Mirrorless' as CategoryType,
      icon: Camera,
    },
    {
      title: 'Fujifilm GFX Series',
      desc: 'Large-format medium format cameras delivering ultra-high resolution and immense dynamic range for studio and landscape photography.',
      tag: 'Mirrorless' as CategoryType,
      icon: Layers,
    },
    {
      title: 'Fujinon Lenses',
      desc: 'Comprehensive coverage of XF and GF prime and zoom lenses, optical benchmarks, and sharpness comparisons.',
      tag: 'Accessories' as CategoryType,
      icon: Aperture,
    },
    {
      title: 'Recipes & Accessories',
      desc: 'Film simulation recipes, custom camera settings, flash gear, and essential accessories for the Fujifilm ecosystem.',
      tag: 'Accessories' as CategoryType,
      icon: Compass,
    },
  ];

  return (
    <section
      id="fujifinder-platform-intro"
      aria-labelledby="fujifinder-intro-heading"
      className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-8 sm:p-12 lg:p-14 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-bold uppercase tracking-wider text-neutral-800">
            <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
            <span>Dedicated Fujifilm Platform</span>
          </div>

          <h2
            id="fujifinder-intro-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-950 leading-tight"
          >
            Your Ultimate Guide to the Fujifilm Camera Ecosystem
          </h2>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            FujiFinder helps photographers discover and understand Fujifilm cameras through detailed reviews, real-world comparisons, buying guides, tutorials, and photography resources. From compact street companions and interchangeable APS-C X Series bodies to medium-format GFX systems, lenses, and accessories, find the ideal setup for your visual craftsmanship.
          </p>
        </div>

        {/* 4 Topic Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-10 pt-8 border-t border-neutral-200/70">
          {fujiPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                onClick={() => onSelectCategory(pillar.tag)}
                className="group p-5 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/70 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 shadow-2xs group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-black">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-neutral-900 group-hover:translate-x-0.5 transition-transform">
                  <span>Jelajahi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

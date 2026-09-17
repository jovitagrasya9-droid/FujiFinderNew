import React from 'react';

interface FujiFinderLogoProps {
  variant?: 'light' | 'dark' | 'brand'; // 'light' for dark backgrounds, 'dark' for light backgrounds
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  layout?: 'horizontal' | 'stacked' | 'mark-only';
  showTagline?: boolean;
  className?: string;
  useImage?: boolean;
}

export const FujiFinderLogo: React.FC<FujiFinderLogoProps> = ({
  variant = 'light',
  size = 'md',
  layout = 'horizontal',
  showTagline = false,
  className = '',
  useImage = false,
}) => {
  const isLight = variant === 'light'; // Light elements for dark bg

  // Dimensions configuration
  const markDimensions = {
    sm: { width: 28, height: 28 },
    md: { width: 34, height: 34 },
    lg: { width: 44, height: 44 },
    xl: { width: 64, height: 64 },
    hero: { width: 96, height: 96 },
  }[size];

  const primaryTextColor = isLight ? 'text-white' : 'text-neutral-950';
  const secondaryTextColor = isLight ? 'text-neutral-400' : 'text-neutral-600';
  const strokeColor = isLight ? '#FFFFFF' : '#171717';
  const fujiFillColor = isLight ? '#FFFFFF' : '#171717';
  const fujiRidgeColor = isLight ? '#0A0A0A' : '#FFFFFF';

  // Vector Logo Icon Mark
  const logoMarkSvg = (
    <svg
      width={markDimensions.width}
      height={markDimensions.height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
    >
      {/* F Stem with Classic Serif */}
      <path
        d="M 28 20 L 52 20 L 52 24.5 L 43 24.5 L 43 75.5 L 52 75.5 L 52 80 L 25 80 L 25 75.5 L 34 75.5 L 34 24.5 L 28 24.5 Z"
        fill={strokeColor}
      />

      {/* Top Camera Body & Viewfinder Curve */}
      <path
        d="M 52 24.5 L 68 24.5 C 75 24.5 78 27 78 33.5 L 78 44"
        stroke={strokeColor}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Japanese Heritage Red Dot (Signature Fuji Accent) */}
      <circle cx="71" cy="33.5" r="3.2" fill="#EF4444" />

      {/* Camera Lens Arc sweeping across the F */}
      <path
        d="M 36 43 C 45 31.5, 64 31.5, 72.5 44 C 78.5 53.5, 77 67, 68.5 74.5 C 60 81, 48 79.5, 39 71"
        stroke={strokeColor}
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mount Fuji Twin Peaks Silhouette */}
      <path
        d="M 42 66 L 49.5 56.5 L 54.5 60.5 L 60.5 53.5 L 68.5 66 Z"
        fill={fujiFillColor}
      />
      
      {/* Mount Fuji Snowy Ridges */}
      <path
        d="M 49.5 56.5 L 52 59.5 L 54.5 60.5 L 57.5 56.5 L 60.5 53.5 L 63.5 59.5 L 68.5 66"
        stroke={fujiRidgeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  if (layout === 'mark-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {useImage ? (
          <img
            src="/fujifinder-logo.jpg"
            alt="FujiFinder Logo"
            className="rounded-full object-cover shadow-sm"
            style={{ width: markDimensions.width, height: markDimensions.height }}
          />
        ) : (
          logoMarkSvg
        )}
      </div>
    );
  }

  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center group ${className}`}>
        <div className="mb-2 p-1">
          {useImage ? (
            <img
              src="/fujifinder-logo.jpg"
              alt="FujiFinder Logo"
              className="rounded-2xl object-cover shadow-md border border-neutral-200"
              style={{ width: markDimensions.width, height: markDimensions.height }}
            />
          ) : (
            logoMarkSvg
          )}
        </div>

        <div className="space-y-0.5">
          <span
            className={`font-black tracking-[0.22em] text-sm sm:text-base uppercase ${primaryTextColor} block transition-colors`}
          >
            FUJI<span className="font-semibold opacity-90">FINDER</span>
          </span>

          <div className="flex items-center justify-center gap-1.5 py-0.5">
            <span className="w-4 h-0.5 bg-red-600 rounded-full" />
          </div>

          {(showTagline || size === 'lg' || size === 'hero') && (
            <span
              className={`text-[9px] sm:text-[10px] font-medium tracking-[0.32em] uppercase ${secondaryTextColor} block`}
            >
              FIND YOUR FUJI
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal Layout
  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Emblem Icon / Image */}
      <div className="shrink-0 flex items-center justify-center">
        {logoMarkSvg}
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center">
          <span className={`font-black tracking-[0.16em] sm:tracking-[0.20em] uppercase text-sm sm:text-base ${primaryTextColor}`}>
            FUJI<span className="font-medium opacity-90">FINDER</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 ml-1.5 mb-1" />
        </div>

        {showTagline && (
          <span className={`text-[8.5px] sm:text-[9.5px] font-medium tracking-[0.28em] uppercase ${secondaryTextColor} mt-0.5`}>
            FIND YOUR FUJI
          </span>
        )}
      </div>
    </div>
  );
};

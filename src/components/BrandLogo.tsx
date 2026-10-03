import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg';
}

export default function BrandLogo({
  className = '',
  size = 36,
  showText = false,
  textSize = 'base',
}: BrandLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none shrink-0 ${className}`}>
      {/* Crisp Brand Vector Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="navBrandBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="45%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
          <linearGradient id="navDocGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
          <filter id="navCardGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Squircle Badge */}
        <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#navBrandBg)" />
        <rect x="16" y="16" width="480" height="480" rx="112" fill="none" stroke="#ffffff" strokeWidth="4" strokeOpacity="0.25" />

        {/* Document Pages */}
        <g filter="url(#navCardGlow)">
          {/* Back Document */}
          <path
            d="M 132 104 L 272 104 L 336 168 L 336 376 A 22 22 0 0 1 314 398 L 132 398 A 22 22 0 0 1 110 376 L 110 126 A 22 22 0 0 1 132 104 Z"
            fill="#ffffff"
            opacity="0.4"
          />

          {/* Front Document */}
          <path
            d="M 166 138 L 316 138 L 386 208 L 386 422 A 26 26 0 0 1 360 448 L 166 448 A 26 26 0 0 1 140 422 L 140 164 A 26 26 0 0 1 166 138 Z"
            fill="url(#navDocGrad)"
          />
          {/* Folded Corner */}
          <path
            d="M 310 138 L 310 202 A 8 8 0 0 0 318 210 L 386 210 Z"
            fill="#cbd5e1"
          />
        </g>

        {/* Format Header Tag */}
        <rect x="176" y="182" width="76" height="16" rx="5" fill="#fee2e2" />
        <rect x="186" y="187" width="54" height="6" rx="3" fill="#e11d48" />

        {/* Dual Reciprocal Conversion Loop Arrows */}
        <g fill="none" stroke="#e11d48" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 198 300 C 198 256, 308 254, 324 270" />
          <path d="M 310 248 L 338 274 L 308 296" fill="#e11d48" stroke="none" />

          <path d="M 326 342 C 326 386, 216 388, 200 372" />
          <path d="M 214 394 L 186 368 L 216 346" fill="#e11d48" stroke="none" />
        </g>
      </svg>

      {showText && (
        <div className="text-left shrink-0 whitespace-nowrap leading-tight">
          <span
            className={`font-black tracking-tight text-slate-900 dark:text-white font-display block whitespace-nowrap ${
              textSize === 'sm' ? 'text-xs sm:text-sm' : textSize === 'lg' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
            }`}
          >
            Nexvert
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-zinc-400 block -mt-0.5 whitespace-nowrap">
            100% Client-Side<span className="hidden sm:inline"> &bull; Zero Server Uploads</span>
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ArtworkImage — Lazy-loading image with skeleton placeholder to eliminate CLS.
 */

import React, { useState, memo } from 'react';

interface ArtworkImageProps {
  src: string;
  alt: string;
  className?: string;
  rounded?: string;
  square?: boolean;
}

export const ArtworkImage: React.FC<ArtworkImageProps> = memo(({
  src,
  alt,
  className = '',
  rounded = 'rounded-lg',
  square = true,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${rounded}`}
      style={square ? { aspectRatio: '1 / 1' } : undefined}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" aria-hidden="true" />
      )}
      {error && (
        <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600">
            <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
          </svg>
        </div>
      )}
      <img
        loading="lazy"
        decoding="async"
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </div>
  );
});

ArtworkImage.displayName = 'ArtworkImage';

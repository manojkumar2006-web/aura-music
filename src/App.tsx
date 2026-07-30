/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Home } from './pages/Home';
import { useMusicStore } from './store/musicStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useShallow } from 'zustand/react/shallow';

export default function App() {
  const fetchTracks = useMusicStore((state) => state.fetchTracks);
  // Subscribe ONLY to coverUrl so we don't re-render the blur background
  // when unrelated track fields change (liked status, queue, etc.)
  const coverUrl = useMusicStore(useShallow((state) => state.currentTrack?.coverUrl ?? null));

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen overflow-hidden bg-black">
        {/* Dynamic Ambient Background — isolated GPU layer, only re-renders on cover change */}
        {coverUrl && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${coverUrl})`,
              filter: 'blur(100px) brightness(0.6) saturate(1.5)',
              transform: 'scale(1.2)',
              opacity: 0.7,
              // GPU compositing hints — isolates this element to its own compositor layer
              willChange: 'opacity',
              contain: 'paint',
            }}
          />
        )}
        <div className="relative z-10 w-full h-full">
          <Home />
        </div>
      </div>
    </ErrorBoundary>
  );
}



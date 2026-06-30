/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Home } from './pages/Home';
import { useMusicStore } from './store/musicStore';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const fetchTracks = useMusicStore((state) => state.fetchTracks);
  const currentTrack = useMusicStore((state) => state.currentTrack);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen overflow-hidden bg-black">
        {/* Dynamic Ambient Background */}
        {currentTrack?.coverUrl && (
          <div 
            className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${currentTrack.coverUrl})`,
              filter: 'blur(100px) brightness(0.6) saturate(1.5)',
              transform: 'scale(1.2)',
              opacity: 0.7
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


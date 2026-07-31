/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { useMusicStore } from './store/musicStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useShallow } from 'zustand/react/shallow';

const KaraokeLyricsDrawer = lazy(() =>
  import('./components/KaraokeLyricsDrawer').then(m => ({ default: m.KaraokeLyricsDrawer }))
);

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
      <BrowserRouter>
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
            <Routes>
              {/* All subroutes are handled inside Home via sidebarNav / selectedAlbum state.
                  React Router enables deep-linking so these URLs are bookmarkable & shareable. */}
              <Route path="/" element={<Home />} />
              <Route path="/album/:albumName" element={<Home initialView="albums" />} />
              <Route path="/artist/:artistName" element={<Home initialView="artists" />} />
              <Route path="/playlist/:playlistId" element={<Home initialView="playlists" />} />
              <Route path="/search" element={<Home initialView="search" />} />
              <Route path="/radio" element={<Home initialView="radio" />} />
              <Route path="/library" element={<Home initialView="songs" />} />
              <Route path="/profile" element={<Home initialView="profile" />} />
              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Suspense fallback={null}>
              <KaraokeLyricsDrawer />
            </Suspense>
          </div>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

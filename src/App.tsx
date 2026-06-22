/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Home } from './pages/Home';
import { useMusicStore } from './store/musicStore';

export default function App() {
  const fetchTracks = useMusicStore((state) => state.fetchTracks);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return (
    <div className="relative min-h-screen">
      <Home />
    </div>
  );
}


const fs = require('fs');

let content = fs.readFileSync('src/store/musicStore.ts', 'utf8');

// 1. Add new state types
const interfaceUpdate = `
  searchTracks: (query: string) => Promise<void>;
  fetchTopTracks: () => Promise<void>;
  resolveYoutubeId: (trackId: string) => Promise<string | null>;
  isSearching: boolean;
`;
content = content.replace('searchQuery: string;', interfaceUpdate + '  searchQuery: string;');

// 2. Remove massive globalTracks array and replace with empty array
// We need to find `const globalTracks: Track[] = [` and its matching closing bracket
const startIndex = content.indexOf('const globalTracks: Track[] = [');
if (startIndex !== -1) {
  // Find the end of globalTracks (it ends right before `export const useMusicStore = create<MusicStore>()`)
  const endIndex = content.indexOf('export const useMusicStore = create<MusicStore>()');
  if (endIndex !== -1) {
    const replacement = `const globalTracks: Track[] = [];\n\n`;
    content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  }
}

// 3. Add initial state implementations for the new methods
const methodImpls = `
  isSearching: false,
  fetchTopTracks: async () => {
    set({ isSearching: true });
    try {
      const res = await fetch('/api/search?q=top hits 2026 tamil');
      const data = await res.json();
      if(Array.isArray(data)) {
         set({ tracks: data, isSearching: false });
      }
    } catch(e) {
      set({ isSearching: false });
    }
  },
  searchTracks: async (query: string) => {
    if(!query.trim()) {
       get().fetchTopTracks();
       return;
    }
    set({ isSearching: true });
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(query));
      const data = await res.json();
      if(Array.isArray(data)) {
         set({ tracks: data, isSearching: false });
      }
    } catch(e) {
      set({ isSearching: false });
    }
  },
  resolveYoutubeId: async (trackId: string) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (!track) return null;
    if (track.youtubeId) return track.youtubeId; // already resolved

    try {
      const res = await fetch('/api/youtube?q=' + encodeURIComponent(track.title + ' ' + track.artist));
      const data = await res.json();
      if (data.youtubeId) {
        // Update the track in the store
        const updatedTracks = get().tracks.map(t => t.id === trackId ? { ...t, youtubeId: data.youtubeId } : t);
        set({ tracks: updatedTracks });
        // Update current track if it's playing
        if (get().currentTrack?.id === trackId) {
          set({ currentTrack: { ...track, youtubeId: data.youtubeId } });
        }
        return data.youtubeId;
      }
    } catch(e) {
      console.error(e);
    }
    return null;
  },
`;

// Insert the methods right after `tracks: globalTracks,`
content = content.replace('tracks: globalTracks,', 'tracks: globalTracks,\n' + methodImpls);

fs.writeFileSync('src/store/musicStore.ts', content);
console.log('Done pruning globalTracks and adding dynamic store methods!');

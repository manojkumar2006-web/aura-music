/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Track, PlaybackState, SubscriptionTier, UserProfile, PrivacySettings } from '../types';

interface Playlist {
  name: string;
  coverUrl?: string;
  trackIds: string[];
}

interface MusicStore {
  tracks: Track[];
  addTrack: (track: Track) => void;
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  queue: Track[];
  setQueue: (tracks: Track[]) => void;
  playbackState: PlaybackState;
  setPlaybackState: (state: PlaybackState) => void;
  userTier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  isAdminMode: boolean;
  setAdminMode: (active: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  
  // Tiered Premium Features States
  remainingSkips: number;
  useSkip: () => boolean; // returns false if skips depleted on Free
  resetSkips: () => void;
  downloadedTracks: string[];
  downloadTrack: (trackId: string) => void;
  activeTheme: 'slate' | 'cyberpunk' | 'gold' | 'emerald';
  setTheme: (theme: 'slate' | 'cyberpunk' | 'gold' | 'emerald') => void;
  playlists: Playlist[];
  createPlaylist: (name: string, coverUrl?: string) => void;
  updatePlaylist: (oldName: string, newName: string, coverUrl?: string) => void;
  deletePlaylist: (name: string) => void;
  addTrackToPlaylist: (playlistName: string, trackId: string) => void;
  analyticsEvents: string[];
  logAnalyticsEvent: (event: string) => void;

  // User Authentication & Profile States
  currentUser: UserProfile | null;
  authLoading: boolean;
  signUp: (username: string, email: string, password: string, avatarUrl: string) => Promise<{ success: boolean; error?: string; passwordErrors?: string[] }>;
  logIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logOut: () => void;
  updateProfile: (displayName: string, bio: string, avatarUrl: string) => void;
  updatePrivacy: (settings: Partial<PrivacySettings>) => void;
  incrementStats: (stat: 'play' | 'minute') => void;
  fetchTracks: () => Promise<void>;

  // Weather & Region States
  currentWeather: string | null;
  setCurrentWeather: (weather: string | null) => void;
  userRegion: string | null;
  setUserRegion: (region: string | null) => void;
}

const getStoredSession = (): UserProfile | null => {
  const data = localStorage.getItem('aura_current_user');
  return data ? JSON.parse(data) : null;
};

// Seed Catalog with multi-bitrate simulation URLs (using SoundHelix direct streams)
const PRESET_TRACKS: Track[] = [
  {
  "id": "karuppu-1",
  "title": "Aathi Raasathi",
  "artist": "Sai Abhyankkar, Dhass Benjamin",
  "album": "Karuppu",
  "duration": "3:58",
  "coverUrl": "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
  "audioUrl128k": "/audio/Karuppu/Aathi Raasathi.mp3",
  "releaseDate": "2026",
  "hero": "Suriya",
  "musicDirector": "Sai Abhyankkar",
  "region": "Tamil",
  "isPremium": false,
  "isPremiumPlus": false,
  "weather": "Cloudy"
},
  {
  "id": "karuppu-2",
  "title": "Athu Thalore",
  "artist": "Sai Abhyankkar, Ananya Chakraborty",
  "album": "Karuppu",
  "duration": "3:51",
  "coverUrl": "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
  "audioUrl128k": "/audio/Karuppu/Athu Thalore.mp3",
  "releaseDate": "2026",
  "hero": "Suriya",
  "musicDirector": "Sai Abhyankkar",
  "region": "Tamil",
  "isPremium": false,
  "isPremiumPlus": false,
  "weather": "Snowy"
},
  {
  "id": "karuppu-3",
  "title": "God Mode Begins",
  "artist": "Sai Abhyankkar, Gana Muthu, Vishnu Edavan",
  "album": "Karuppu",
  "duration": "0:56",
  "coverUrl": "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
  "audioUrl128k": "/audio/Karuppu/God Mode Begins.mp3",
  "releaseDate": "2026",
  "hero": "Suriya",
  "musicDirector": "Sai Abhyankkar",
  "region": "Tamil",
  "isPremium": false,
  "isPremiumPlus": false,
  "weather": "Stormy"
},
  {
  "id": "karuppu-4",
  "title": "God Mode",
  "artist": "Sai Abhyankkar, Gana Muthu",
  "album": "Karuppu",
  "duration": "4:00",
  "coverUrl": "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
  "audioUrl128k": "/audio/Karuppu/God Mode.mp3",
  "releaseDate": "2026",
  "hero": "Suriya",
  "musicDirector": "Sai Abhyankkar",
  "region": "Tamil",
  "isPremium": false,
  "isPremiumPlus": false,
  "weather": "Sunny"
},
  {
  "id": "karuppu-5",
  "title": "Karuppa Kooda Va",
  "artist": "Sai Abhyankkar, V.M. Mahalingam",
  "album": "Karuppu",
  "duration": "4:10",
  "coverUrl": "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
  "audioUrl128k": "/audio/Karuppu/Karuppa Kooda Va.mp3",
  "releaseDate": "2026",
  "hero": "Suriya",
  "musicDirector": "Sai Abhyankkar",
  "region": "Tamil",
  "isPremium": false,
  "isPremiumPlus": false,
  "weather": "Cloudy"
},
  {
  "id": "karuppu-6",
  "title": "Naanga Naalu Peru",
  "artist": "Sai Abhyankkar, Silambarasan Tr",
  "album": "Karuppu",
  "duration": "3:17",
  "coverUrl": "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
  "audioUrl128k": "/audio/Karuppu/Naanga Naalu Peru.mp3",
  "releaseDate": "2026",
  "hero": "Suriya",
  "musicDirector": "Sai Abhyankkar",
  "region": "Tamil",
  "isPremium": false,
  "isPremiumPlus": false,
  "weather": "Rainy"
},
  {
  "id": "karuppu-7",
  "title": "Raathu Raasan",
  "artist": "Sai Abhyankkar, V.M. Mahalingam, Paal Dabba",
  "album": "Karuppu",
  "duration": "3:15",
  "coverUrl": "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
  "audioUrl128k": "/audio/Karuppu/Raathu Raasan.mp3",
  "releaseDate": "2026",
  "hero": "Suriya",
  "musicDirector": "Sai Abhyankkar",
  "region": "Tamil",
  "isPremium": false,
  "isPremiumPlus": false,
  "weather": "Sunny"
},
  {
  "id": "karuppu-8",
  "title": "Verappa - Extended",
  "artist": "Sai Abhyankkar, Arivu",
  "album": "Karuppu",
  "duration": "4:21",
  "coverUrl": "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
  "audioUrl128k": "/audio/Karuppu/Verappa - Extended.mp3",
  "releaseDate": "2026",
  "hero": "Suriya",
  "musicDirector": "Sai Abhyankkar",
  "region": "Tamil",
  "isPremium": false,
  "isPremiumPlus": false,
  "weather": "Sunny"
},
  {
  "id": "karuppu-9",
  "title": "Verappa",
  "artist": "Sai Abhyankkar, Arivu",
  "album": "Karuppu",
  "duration": "1:40",
  "coverUrl": "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
  "audioUrl128k": "/audio/Karuppu/Verappa.mp3",
  "releaseDate": "2026",
  "hero": "Suriya",
  "musicDirector": "Sai Abhyankkar",
  "region": "Tamil",
  "isPremium": false,
  "isPremiumPlus": false,
  "weather": "Snowy"
},
  {
    id: 'track-1',
    title: 'Helix Symphony I',
    artist: 'Helix Band',
    album: 'Helix World',
    duration: '06:12',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80',
    audioUrl128k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioUrl320k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioUrlFlac: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioUrlAtmos: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    isPremium: false,
    lyrics: "Welcome to AURA Music player.\nThis is Helix Symphony I.\nEnjoy the soothing electronic synth sounds...\n\n[Chorus]\nStreaming live from online servers\nNo local synths, just pure data\nLet the soundhelix play...\n\n[Bridge]\nRelax your mind, relax your eyes\nUnderneath the twilight skies...",
    releaseDate: '2026-06-20'
  },
  {
    id: 'track-2',
    title: 'Nebula Mist Theme',
    artist: 'Helios Sphere',
    album: 'Cosmic Drift',
    duration: '07:05',
    coverUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=400&q=80',
    audioUrl128k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioUrl320k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioUrlFlac: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioUrlAtmos: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    isPremium: false,
    lyrics: "Walking through the nebula mist\nFloating in the cosmic drift\nCan you feel the gravity fade?\n\n[Chorus]\nOoh, we glide beyond the stars\nPast Jupiter and red-hot Mars\nStreaming audio night and day\nIn a Spotify-like way...\n\n[Outro]\nLost in the mist...",
    releaseDate: '2026-06-21'
  },
  {
    id: 'track-3',
    title: 'Event Horizon (Premium)',
    artist: 'Singularity',
    album: 'Dark Horizons',
    duration: '05:44',
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80',
    audioUrl128k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioUrl320k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioUrlFlac: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioUrlAtmos: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    isPremium: true,
    lyrics: "★ PREMIUM SUBSCRIBER EXCLUSIVE ★\n\nEntering the event horizon\nWhere even light cannot escape\n\n[Chorus]\nOnly premium accounts can hear\nThis deepest spatial audio vibe\nUnlocked and clear\nUpgrade today, bypass the fear...\n\n[Bridge]\nSingularity is near\nWe stream without any restrictions here.",
    releaseDate: '2026-06-18'
  },
  {
    id: 'track-4',
    title: 'Andromeda Pulse (Premium+)',
    artist: 'Binary Pulsar',
    album: 'Stellar Pulses',
    duration: '05:02',
    coverUrl: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=400&q=80',
    audioUrl128k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioUrl320k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioUrlFlac: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioUrlAtmos: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    isPremium: true,
    isPremiumPlus: true, // Premium+ exclusive
    lyrics: "★ PREMIUM+ EXCLUSIVE Atmos Stream ★\n\nBlinking lights of the pulsar star\nSignals sent from very far\n\n[Chorus]\nAndromeda is pulsing tonight\nA galaxy in neon blue and white\nStream the lossless soundwaves high\nUnderneath the digital sky...",
    releaseDate: '2026-06-22'
  }
];

export const useMusicStore = create<MusicStore>((set, get) => ({
  tracks: PRESET_TRACKS, // Initial fallback tracks
  currentWeather: null,
  userRegion: null,
  setCurrentWeather: (weather) => set({ currentWeather: weather }),
  setUserRegion: (region) => set({ userRegion: region }),
  
  fetchTracks: async () => {
    try {
      const response = await fetch('/api/tracks');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          set({ tracks: data });
        }
      }
    } catch (error) {
      console.error('Failed to fetch tracks from MongoDB API:', error);
    }
  },
  addTrack: (track: Track) => {
    set((state) => ({ tracks: [...state.tracks, track] }));
    get().logAnalyticsEvent(`Song registered: "${track.title}" by ${track.artist}`);
  },
  currentTrack: PRESET_TRACKS[0],
  queue: [],
  setQueue: (tracks: Track[]) => set({ queue: tracks }),
  setCurrentTrack: (track: Track | null) => {
    set({ currentTrack: track });
    if (track) {
      get().logAnalyticsEvent(`Selected track: "${track.title}"`);
    }
  },
  playbackState: 'idle',
  setPlaybackState: (state: PlaybackState) => {
    set({ playbackState: state });
    get().logAnalyticsEvent(`Playback state updated: ${state}`);
  },
  userTier: 'Free',
  setTier: (tier: SubscriptionTier) => {
    set({ userTier: tier });
    get().logAnalyticsEvent(`Membership updated: ${tier} Tier`);
    if (tier !== 'Free') {
      get().resetSkips();
    }
  },
  isAdminMode: false,
  setAdminMode: (active: boolean) => set({ isAdminMode: active }),
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  isMuted: false,
  setMuted: (muted: boolean) => set({ isMuted: muted }),
  volume: 0.7,
  setVolume: (volume: number) => set({ volume }),
  
  // Tiered Premium Features Logic
  remainingSkips: 6,
  useSkip: () => {
    const store = get();
    if (store.userTier !== 'Free') {
      store.logAnalyticsEvent('Skipped song [Unlimited skips active]');
      return true;
    }
    
    if (store.remainingSkips > 0) {
      const nextSkips = store.remainingSkips - 1;
      set({ remainingSkips: nextSkips });
      store.logAnalyticsEvent(`Skipped song [Free skips remaining: ${nextSkips}]`);
      return true;
    }
    
    store.logAnalyticsEvent('Skip blocked [Free skips depleted]');
    return false;
  },
  resetSkips: () => set({ remainingSkips: 6 }),
  downloadedTracks: [],
  downloadTrack: (trackId: string) => {
    const store = get();
    const track = store.tracks.find(t => t.id === trackId);
    if (!track) return;
    
    if (store.downloadedTracks.includes(trackId)) {
      store.logAnalyticsEvent(`Already downloaded: "${track.title}"`);
      return;
    }
    
    if (store.downloadedTracks.length >= 100) {
      store.logAnalyticsEvent(`Download failed: limit of 100 offline songs reached`);
      alert('Offline limit reached! Upgrade or remove downloaded songs.');
      return;
    }
    
    set((state) => ({ downloadedTracks: [...state.downloadedTracks, trackId] }));
    store.logAnalyticsEvent(`Downloaded for offline playback: "${track.title}" [Total: ${store.downloadedTracks.length + 1}/100]`);
  },
  activeTheme: 'slate',
  setTheme: (theme) => {
    set({ activeTheme: theme });
    get().logAnalyticsEvent(`UI Theme changed: ${theme}`);
  },
  playlists: [],
  createPlaylist: (name, coverUrl) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    
    const exists = get().playlists.some(p => p.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      alert('Playlist already exists!');
      return;
    }
    
    set((state) => ({ playlists: [...state.playlists, { name: cleanName, coverUrl, trackIds: [] }] }));
    get().logAnalyticsEvent(`Created playlist: "${cleanName}"`);
  },
  updatePlaylist: (oldName, newName, coverUrl) => {
    const cleanNewName = newName.trim();
    if (!cleanNewName) return;
    
    set((state) => {
      const exists = state.playlists.some(p => p.name.toLowerCase() === cleanNewName.toLowerCase() && p.name !== oldName);
      if (exists) {
        alert('A playlist with that name already exists!');
        return state;
      }
      const updated = state.playlists.map(p => 
        p.name === oldName ? { ...p, name: cleanNewName, coverUrl } : p
      );
      return { playlists: updated };
    });
    get().logAnalyticsEvent(`Updated playlist: "${oldName}"`);
  },
  deletePlaylist: (name) => {
    set((state) => ({
      playlists: state.playlists.filter(p => p.name !== name)
    }));
    get().logAnalyticsEvent(`Deleted playlist: "${name}"`);
  },
  addTrackToPlaylist: (playlistName, trackId) => {
    const store = get();
    const track = store.tracks.find(t => t.id === trackId);
    if (!track) return;
    
    set((state) => {
      const updatedPlaylists = state.playlists.map((p) => {
        if (p.name === playlistName) {
          if (p.trackIds.includes(trackId)) return p;
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      });
      return { playlists: updatedPlaylists };
    });
    store.logAnalyticsEvent(`Added "${track.title}" to playlist "${playlistName}"`);
  },
  analyticsEvents: [`App loaded. AURA online.`],
  logAnalyticsEvent: (event) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${event}`;
    set((state) => ({
      analyticsEvents: [logMessage, ...state.analyticsEvents.slice(0, 49)] // Cap at 50 logs
    }));
  },

  // User Authentication & Profile States
  currentUser: getStoredSession(),
  authLoading: false,

  signUp: async (username, email, password, avatarUrl) => {
    set({ authLoading: true });
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ authLoading: false });
        return { success: false, error: data.error, passwordErrors: data.passwordErrors };
      }
      // Do NOT automatically log them in. They must verify email first.
      set({ authLoading: false });
      
      get().logAnalyticsEvent(`Account created: ${username}. Verification email sent to ${email}.`);
      return { success: true };
    } catch (err) {
      set({ authLoading: false });
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  logIn: async (email, password) => {
    set({ authLoading: true });
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ authLoading: false });
        return { success: false, error: data.error };
      }
      // data is the user profile (without password)
      const user: UserProfile = {
        id: data.id,
        username: data.username || data.displayName,
        email: data.email,
        emailVerified: data.emailVerified ?? true,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl || '',
        bio: data.bio || '',
        stats: data.stats || { tracksPlayed: 0, minutesListened: 0, topGenre: 'Various', favArtist: 'Various' },
        privacy: data.privacy || { isPublicProfile: true, showListeningActivity: true, playlistsPrivateByDefault: false },
        createdAt: data.createdAt || new Date().toISOString(),
      };
      set({ currentUser: user, authLoading: false });
      localStorage.setItem('aura_current_user', JSON.stringify(user));
      get().logAnalyticsEvent(`User logged in: ${user.displayName}`);
      return { success: true };
    } catch (err) {
      set({ authLoading: false });
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  logOut: () => {
    set({ currentUser: null });
    localStorage.removeItem('aura_current_user');
    get().logAnalyticsEvent('User logged out');
  },

  updateProfile: (displayName, bio, avatarUrl) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      displayName: displayName.trim() || currentUser.displayName,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || currentUser.avatarUrl
    };

    set({ currentUser: updatedUser });
    localStorage.setItem('aura_current_user', JSON.stringify(updatedUser));

    // Sync to DB
    fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, displayName: updatedUser.displayName, bio: updatedUser.bio, avatarUrl: updatedUser.avatarUrl }),
    }).catch(console.error);

    get().logAnalyticsEvent(`Profile details updated for: ${updatedUser.displayName}`);
  },

  updatePrivacy: (settings) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      privacy: {
        ...currentUser.privacy,
        ...settings
      }
    };

    set({ currentUser: updatedUser });
    localStorage.setItem('aura_current_user', JSON.stringify(updatedUser));

    // Sync to DB
    fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, privacy: updatedUser.privacy }),
    }).catch(console.error);

    get().logAnalyticsEvent(`Privacy settings adjusted`);
  },

  incrementStats: (stat) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const currentStats = currentUser.stats;
    const updatedStats = {
      ...currentStats,
      tracksPlayed: stat === 'play' ? currentStats.tracksPlayed + 1 : currentStats.tracksPlayed,
      minutesListened: stat === 'minute' ? currentStats.minutesListened + 1 : currentStats.minutesListened
    };

    const currentTrack = get().currentTrack;
    if (currentTrack) {
      updatedStats.favArtist = currentTrack.artist;
      updatedStats.topGenre = currentTrack.isPremiumPlus ? 'Dolby Atmos Spatial' : 'Electronic Synth';
    }

    const updatedUser = {
      ...currentUser,
      stats: updatedStats
    };

    set({ currentUser: updatedUser });
    localStorage.setItem('aura_current_user', JSON.stringify(updatedUser));
  }
}));


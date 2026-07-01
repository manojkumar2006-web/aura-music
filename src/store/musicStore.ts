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
  
  searchTracks: (query: string) => Promise<void>;
  fetchTopTracks: () => Promise<void>;
  resolveYoutubeId: (trackId: string) => Promise<string | null>;
  isSearching: boolean;
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
  completeOnboarding: (languages: string[], favoriteDirectors: string[]) => Promise<{ success: boolean; error?: string }>;
  incrementStats: (stat: 'play' | 'minute') => void;
  fetchTracks: () => Promise<void>;
  searchAndAppendTracks: (query: string) => Promise<void>;
  addTracksToLibrary: (newTracks: Track[]) => void;
  toggleLike: (trackId: string) => Promise<{ success: boolean; error?: string }>;
  toggleArtistLike: (artistName: string) => Promise<{ success: boolean; error?: string }>;

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
const PRESET_TRACKS: Track[] = [];

export const useMusicStore = create<MusicStore>((set, get) => ({
  tracks: [], // Initially empty, populated by fetchTopTracks
  isSearching: false,
  fetchTopTracks: async () => {
    set({ isSearching: true });
    try {
      const res = await fetch('/api/search?q=new_releases');
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
  currentWeather: null,
  userRegion: null,
  setCurrentWeather: (weather) => set({ currentWeather: weather }),
  setUserRegion: (region) => set({ userRegion: region }),
  
  addTracksToLibrary: (newTracks: Track[]) => {
    const existing = get().tracks;
    const seen = new Set(existing.map((t: Track) => t.id));
    const merged = [...existing, ...newTracks.filter((t: Track) => !seen.has(t.id))];
    set({ tracks: merged });
  },
  fetchTracks: async () => {
    // Language → known artist/keyword sets for filtering
    const LANGUAGE_ARTISTS: Record<string, string[]> = {
      Tamil: [
        'anirudh', 'a. r. rahman', 'ar rahman', 'yuvan', 'harris jayaraj', 'devi sri prasad',
        'thaman', 'santhosh narayanan', 'g.v. prakash', 'ilayaraja', 'hiphop tamizha',
        'vijay antony', 'sam c.s', 'ravi basrur', 'd. imman', 'sai abhyankar',
        'sid sriram', 'k. s. chithra', 'karthik', 'hariharan', 'shweta mohan',
        'jonita gandhi', 'haricharan', 'tippu', 'benny dayal', 'naresh iyer',
        'chinmayi', 'andrea jeremiah', 'nakul abhyankar'
      ],
      Telugu: [
        'devi sri prasad', 'thaman', 'm. m. keeravani', 'mickey j. meyer', 'mani sharma',
        'ravi basrur', 'a. r. rahman', 'anirudh', 'santhosh narayanan',
        'sid sriram', 'shreya ghoshal', 'chinmayi', 'karthik', 'hemachandra',
        'sunitha', 'anup rubens', 'chakri', 'ss thaman'
      ],
      Hindi: [
        'arijit singh', 'shreya ghoshal', 'sonu nigam', 'kk', 'mohit chauhan',
        'atif aslam', 'rahat fateh ali khan', 'neha kakkar', 'jubin nautiyal',
        'armaan malik', 'darshan raval', 'pritam', 'amit trivedi', 'vishal-shekhar',
        'sachin-jigar', 'shankar-ehsaan-loy', 'anu malik', 'himesh reshammiya',
        'mithoon', 'tanishk bagchi', 'badshah', 'yo yo honey singh', 'udit narayan',
        'lata mangeshkar', 'asha bhosle', 'mohammed rafi', 'mukesh', 'kishore kumar',
        'amaal mallik', 'meet bros', 'nadeem-shravan', 'jatin-lalit'
      ],
      English: [
        'taylor swift', 'the weeknd', 'ed sheeran', 'ariana grande', 'billie eilish',
        'bruno mars', 'sza', 'frank ocean', 'rihanna', 'katy perry', 'justin bieber',
        'selena gomez', 'lady gaga', 'adele', 'harry styles', 'shawn mendes',
        'charlie puth', 'miley cyrus', 'lana del rey', 'dua lipa', 'drake',
        'kendrick lamar', 'travis scott', 'eminem', 'post malone', 'j. cole',
        'kanye west', 'jay-z', 'lil wayne', 'nicki minaj', 'cardi b', 'doja cat',
        'bad bunny', 'j balvin', 'shakira', 'karol g', 'bts', 'blackpink',
        'coldplay', 'arctic monkeys', 'imagine dragons', 'linkin park', 'nirvana',
        'david guetta', 'calvin harris', 'alan walker', 'avicii', 'marshmello',
        'michael jackson', 'queen', 'the beatles', 'elton john', 'elvis presley',
        'sadie sink', 'stray kids', 'newjeans', 'twice', 'seventeen'
      ]
    };

    try {
      // Fetch tracks directly from our MongoDB database (populated by the daily sync script)
      const response = await fetch('/api/tracks');
      if (!response.ok) {
        throw new Error('Failed to fetch tracks from database');
      }
      const data = await response.json();
      
      // Get the logged-in user's language preferences
      const currentUser = get().currentUser;
      const userLanguages: string[] = currentUser?.languages || [];

      const allTracks: any[] = [];
      const seen = new Set<string>();
      
      if (Array.isArray(data)) {
        data.forEach((t: any) => {
          if (!t.id || seen.has(t.id)) return;

          // If user has language preferences, filter tracks by matching artists
          if (userLanguages.length > 0) {
            const artistLower = (t.artist || '').toLowerCase();
            const matchesLanguage = userLanguages.some(lang => {
              const keywords = LANGUAGE_ARTISTS[lang] || [];
              return keywords.some(kw => artistLower.includes(kw));
            });
            if (!matchesLanguage) return; // skip tracks not in user's languages
          }

          seen.add(t.id);
          allTracks.push(t);
        });
      }
      
      if (allTracks.length > 0) {
        set({ tracks: allTracks });
      }
    } catch (e) {
      console.error('Failed to bootstrap tracks from database:', e);
    }
  },
  searchAndAppendTracks: async (query: string) => {
    if (!query.trim()) return;
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        set(state => {
          const currentTracks = [...state.tracks];
          const seen = new Set(currentTracks.map(t => t.id));
          let added = false;
          data.forEach((t: any) => {
            if (t.id && !seen.has(t.id)) {
              seen.add(t.id);
              currentTracks.push(t);
              added = true;
            }
          });
          return added ? { tracks: currentTracks } : state;
        });
      }
    } catch (error) {
      console.error('Failed to fetch and append tracks:', error);
    }
  },
  toggleLike: async (trackId: string) => {
    const currentUser = get().currentUser;
    if (!currentUser) return { success: false, error: 'Not logged in' };

    const currentLikes = currentUser.likedTracks || [];
    const isLiked = currentLikes.includes(trackId);
    
    // Optimistic update
    const updatedLikes = isLiked 
      ? currentLikes.filter(id => id !== trackId)
      : [...currentLikes, trackId];
      
    const updatedUser = { ...currentUser, likedTracks: updatedLikes };
    set({ currentUser: updatedUser });
    localStorage.setItem('aura_current_user', JSON.stringify(updatedUser));
    
    // Sync with backend
    try {
      const response = await fetch('/api/users/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, trackId }),
      });
      if (!response.ok) {
        throw new Error('Failed to sync like');
      }
      get().logAnalyticsEvent(`${!isLiked ? 'Liked' : 'Unliked'} track: ${trackId}`);
    } catch (error) {
      console.error('Like toggle sync error:', error);
      // Revert optimistic update on failure
      set({ currentUser });
      localStorage.setItem('aura_current_user', JSON.stringify(currentUser));
      return { success: false, error: 'Failed to sync like' };
    }
    return { success: true };
  },
  toggleArtistLike: async (artistName: string) => {
    const currentUser = get().currentUser;
    if (!currentUser) return { success: false, error: 'Not logged in' };

    const currentLikes = currentUser.likedArtists || [];
    const isLiked = currentLikes.includes(artistName);
    
    // Optimistic update
    const updatedLikes = isLiked 
      ? currentLikes.filter(name => name !== artistName)
      : [...currentLikes, artistName];
      
    const updatedUser = { ...currentUser, likedArtists: updatedLikes };
    set({ currentUser: updatedUser });
    localStorage.setItem('aura_current_user', JSON.stringify(updatedUser));
    
    // Sync with backend
    try {
      const response = await fetch('/api/users/artist-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, artistName }),
      });
      if (!response.ok) {
        throw new Error('Failed to sync artist like');
      }
    } catch (error) {
      console.error('Artist like toggle sync error:', error);
      // Revert optimistic update on failure
      set({ currentUser });
      localStorage.setItem('aura_current_user', JSON.stringify(currentUser));
      return { success: false, error: 'Failed to sync artist like' };
    }
    return { success: true };
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
  userTier: 'Premium+',
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
  remainingSkips: 9999,
  useSkip: () => {
  return true;
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
    
    set((state) => ({ downloadedTracks: [...state.downloadedTracks, trackId] }));
    store.logAnalyticsEvent(`Downloaded for offline playback: "${track.title}" [Total: ${store.downloadedTracks.length + 1}]`);
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
        onboardingComplete: data.onboardingComplete ?? false,
        languages: data.languages || [],
        favoriteDirectors: data.favoriteDirectors || [],
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

  completeOnboarding: async (languages, favoriteDirectors) => {
    const currentUser = get().currentUser;
    if (!currentUser) return { success: false, error: 'Not logged in' };
    
    set({ authLoading: true });
    try {
      const response = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, languages, favoriteDirectors })
      });
      
      const data = await response.json();
      if (!response.ok) {
        set({ authLoading: false });
        return { success: false, error: data.error || 'Failed to complete onboarding' };
      }
      
      set({ currentUser: data, authLoading: false });
      localStorage.setItem('aura_current_user', JSON.stringify(data));
      return { success: true };
    } catch (e: any) {
      set({ authLoading: false });
      return { success: false, error: e.message };
    }
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

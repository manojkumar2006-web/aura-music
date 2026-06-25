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
  completeOnboarding: (languages: string[], favoriteDirectors: string[]) => Promise<{ success: boolean; error?: string }>;
  incrementStats: (stat: 'play' | 'minute') => void;
  fetchTracks: () => Promise<void>;
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
const PRESET_TRACKS: Track[] = [
  // ================= KOLLYWOOD =================
  {
    "id": "k-leo-1", "title": "Badass", "artist": "Anirudh Ravichander", "album": "Leo", "duration": "3:45",
    "coverUrl": "https://picsum.photos/seed/leo1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-10-19", "hero": "Thalapathy Vijay", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "k-leo-2", "title": "Naa Ready", "artist": "Anirudh Ravichander, Thalapathy Vijay", "album": "Leo", "duration": "4:08",
    "coverUrl": "https://picsum.photos/seed/leo2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2023-10-19", "hero": "Thalapathy Vijay", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Cloudy"
  },
  {
    "id": "k-leo-3", "title": "Ordinary Person", "artist": "Anirudh Ravichander, Nikhita Gandhi", "album": "Leo", "duration": "2:50",
    "coverUrl": "https://picsum.photos/seed/leo3/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2023-10-19", "hero": "Thalapathy Vijay", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Rainy"
  },
  {
    "id": "k-jailer-1", "title": "Hukum", "artist": "Anirudh Ravichander", "album": "Jailer", "duration": "3:27",
    "coverUrl": "https://picsum.photos/seed/jailer1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2023-08-10", "hero": "Rajinikanth", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Stormy"
  },
  {
    "id": "k-jailer-2", "title": "Kaavaalaa", "artist": "Anirudh Ravichander, Shilpa Rao", "album": "Jailer", "duration": "3:10",
    "coverUrl": "https://picsum.photos/seed/jailer2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-08-10", "hero": "Rajinikanth", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "k-vikram-1", "title": "Pathala Pathala", "artist": "Anirudh Ravichander, Kamal Haasan", "album": "Vikram", "duration": "3:30",
    "coverUrl": "https://picsum.photos/seed/vikram1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-06-03", "hero": "Kamal Haasan", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "k-vikram-2", "title": "Vikram Title Track", "artist": "Anirudh Ravichander", "album": "Vikram", "duration": "3:15",
    "coverUrl": "https://picsum.photos/seed/vikram2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2022-06-03", "hero": "Kamal Haasan", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Stormy"
  },
  {
    "id": "k-master-1", "title": "Vaathi Coming", "artist": "Anirudh Ravichander, Gana Balachandar", "album": "Master", "duration": "3:50",
    "coverUrl": "https://picsum.photos/seed/master1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2021-01-13", "hero": "Thalapathy Vijay", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Sunny"
  },

  // ================= TOLLYWOOD =================
  {
    "id": "t-rrr-1", "title": "Naatu Naatu", "artist": "Rahul Sipligunj, Kaala Bhairava", "album": "RRR", "duration": "3:35",
    "coverUrl": "https://picsum.photos/seed/rrr1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2022-03-24", "hero": "Ram Charan", "musicDirector": "M. M. Keeravani", "region": "Tollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "t-rrr-2", "title": "Dosti", "artist": "Hemachandra", "album": "RRR", "duration": "5:40",
    "coverUrl": "https://picsum.photos/seed/rrr2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-03-24", "hero": "Jr NTR", "musicDirector": "M. M. Keeravani", "region": "Tollywood", "isPremium": false, "weather": "Cloudy"
  },
  {
    "id": "t-pushpa-1", "title": "Oo Antava", "artist": "Indravathi Chauhan", "album": "Pushpa", "duration": "3:44",
    "coverUrl": "https://picsum.photos/seed/pushpa1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2021-12-17", "hero": "Allu Arjun", "musicDirector": "Devi Sri Prasad", "region": "Tollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "t-pushpa-2", "title": "Srivalli", "artist": "Sid Sriram", "album": "Pushpa", "duration": "3:40",
    "coverUrl": "https://picsum.photos/seed/pushpa2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2021-12-17", "hero": "Allu Arjun", "musicDirector": "Devi Sri Prasad", "region": "Tollywood", "isPremium": false, "weather": "Rainy"
  },
  {
    "id": "t-ala-1", "title": "Butta Bomma", "artist": "Armaan Malik", "album": "Ala Vaikunthapurramuloo", "duration": "3:18",
    "coverUrl": "https://picsum.photos/seed/ala1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2020-01-12", "hero": "Allu Arjun", "musicDirector": "Thaman S", "region": "Tollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "t-ala-2", "title": "Ramuloo Ramulaa", "artist": "Anurag Kulkarni, Mangli", "album": "Ala Vaikunthapurramuloo", "duration": "4:30",
    "coverUrl": "https://picsum.photos/seed/ala2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2020-01-12", "hero": "Allu Arjun", "musicDirector": "Thaman S", "region": "Tollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "t-baahu-1", "title": "Dheevara", "artist": "Ramya Behara, Deepu", "album": "Baahubali", "duration": "5:43",
    "coverUrl": "https://picsum.photos/seed/baahu1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2015-07-10", "hero": "Prabhas", "musicDirector": "M. M. Keeravani", "region": "Tollywood", "isPremium": false, "weather": "Cloudy"
  },

  // ================= BOLLYWOOD =================
  {
    "id": "b-jawan-1", "title": "Chaleya", "artist": "Arijit Singh, Shilpa Rao", "album": "Jawan", "duration": "3:20",
    "coverUrl": "https://picsum.photos/seed/jawan1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2023-09-07", "hero": "Shah Rukh Khan", "musicDirector": "Anirudh Ravichander", "region": "Bollywood", "isPremium": false, "weather": "Rainy"
  },
  {
    "id": "b-jawan-2", "title": "Zinda Banda", "artist": "Anirudh Ravichander", "album": "Jawan", "duration": "4:24",
    "coverUrl": "https://picsum.photos/seed/jawan2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-09-07", "hero": "Shah Rukh Khan", "musicDirector": "Anirudh Ravichander", "region": "Bollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "b-pathaan-1", "title": "Jhoome Jo Pathaan", "artist": "Arijit Singh, Sukriti Kakar", "album": "Pathaan", "duration": "3:28",
    "coverUrl": "https://picsum.photos/seed/pathaan1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2023-01-25", "hero": "Shah Rukh Khan", "musicDirector": "Vishal-Shekhar", "region": "Bollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "b-pathaan-2", "title": "Besharam Rang", "artist": "Shilpa Rao, Caralisa Monteiro", "album": "Pathaan", "duration": "4:18",
    "coverUrl": "https://picsum.photos/seed/pathaan2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2023-01-25", "hero": "Shah Rukh Khan", "musicDirector": "Vishal-Shekhar", "region": "Bollywood", "isPremium": false, "weather": "Cloudy"
  },
  {
    "id": "b-animal-1", "title": "Arjan Vailly", "artist": "Bhupinder Babbal", "album": "Animal", "duration": "3:02",
    "coverUrl": "https://picsum.photos/seed/animal1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2023-12-01", "hero": "Ranbir Kapoor", "musicDirector": "Harshavardhan Rameshwar", "region": "Bollywood", "isPremium": false, "weather": "Stormy"
  },
  {
    "id": "b-brahmastra-1", "title": "Kesariya", "artist": "Arijit Singh", "album": "Brahmastra", "duration": "4:28",
    "coverUrl": "https://picsum.photos/seed/brah1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2022-09-09", "hero": "Ranbir Kapoor", "musicDirector": "Pritam", "region": "Bollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "b-brahmastra-2", "title": "Deva Deva", "artist": "Arijit Singh, Jonita Gandhi", "album": "Brahmastra", "duration": "4:39",
    "coverUrl": "https://picsum.photos/seed/brah2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-09-09", "hero": "Ranbir Kapoor", "musicDirector": "Pritam", "region": "Bollywood", "isPremium": false, "weather": "Cloudy"
  },

  // ================= HOLLYWOOD / GLOBAL =================
  {
    "id": "h-weeknd-1", "title": "Blinding Lights", "artist": "The Weeknd", "album": "After Hours", "duration": "3:20",
    "coverUrl": "https://picsum.photos/seed/weeknd1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2020-03-20", "hero": "The Weeknd", "musicDirector": "Max Martin", "region": "Hollywood", "isPremium": false, "weather": "Night"
  },
  {
    "id": "h-weeknd-2", "title": "Starboy", "artist": "The Weeknd, Daft Punk", "album": "Starboy", "duration": "3:50",
    "coverUrl": "https://picsum.photos/seed/weeknd2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2016-11-25", "hero": "The Weeknd", "musicDirector": "Daft Punk", "region": "Hollywood", "isPremium": false, "weather": "Night"
  },
  {
    "id": "h-swift-1", "title": "Cruel Summer", "artist": "Taylor Swift", "album": "Lover", "duration": "2:58",
    "coverUrl": "https://picsum.photos/seed/swift1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2019-08-23", "hero": "Taylor Swift", "musicDirector": "Jack Antonoff", "region": "Hollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "h-swift-2", "title": "Anti-Hero", "artist": "Taylor Swift", "album": "Midnights", "duration": "3:20",
    "coverUrl": "https://picsum.photos/seed/swift2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-10-21", "hero": "Taylor Swift", "musicDirector": "Jack Antonoff", "region": "Hollywood", "isPremium": false, "weather": "Cloudy"
  },
  {
    "id": "h-ed-1", "title": "Shape of You", "artist": "Ed Sheeran", "album": "Divide", "duration": "3:53",
    "coverUrl": "https://picsum.photos/seed/ed1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2017-03-03", "hero": "Ed Sheeran", "musicDirector": "Steve Mac", "region": "Hollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "h-ed-2", "title": "Bad Habits", "artist": "Ed Sheeran", "album": "Equals", "duration": "3:51",
    "coverUrl": "https://picsum.photos/seed/ed2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2021-10-29", "hero": "Ed Sheeran", "musicDirector": "Johnny McDaid", "region": "Hollywood", "isPremium": false, "weather": "Night"
  },

  // ================= LO-FI / VIBE =================
  {
    "id": "lofi-1", "title": "3 AM Study Session", "artist": "Lofi Girl", "album": "Lofi Vibes", "duration": "2:45",
    "coverUrl": "https://picsum.photos/seed/lofi1/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-01-01", "hero": "Lofi Girl", "musicDirector": "ChilledCow", "region": "Lo-Fi", "isPremium": false, "weather": "Night"
  },
  {
    "id": "lofi-2", "title": "Rainy Days", "artist": "Kudasai", "album": "Falling", "duration": "3:10",
    "coverUrl": "https://picsum.photos/seed/lofi2/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-04-15", "hero": "Lofi Girl", "musicDirector": "Kudasai", "region": "Lo-Fi", "isPremium": false, "weather": "Rainy"
  },
  {
    "id": "lofi-3", "title": "Sunset Chill", "artist": "Idealism", "album": "Hiraeth", "duration": "2:30",
    "coverUrl": "https://picsum.photos/seed/lofi3/400/400", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2021-08-20", "hero": "Lofi Girl", "musicDirector": "Idealism", "region": "Lo-Fi", "isPremium": false, "weather": "Cloudy"
  }
];

export const useMusicStore = create<MusicStore>((set, get) => ({
  tracks: PRESET_TRACKS, // Initial fallback tracks
  currentWeather: null,
  userRegion: null,
  setCurrentWeather: (weather) => set({ currentWeather: weather }),
  setUserRegion: (region) => set({ userRegion: region }),
  
  fetchTracks: async () => {
    // Disabled MongoDB API fetch to use the massive local mock database (PRESET_TRACKS)
    console.log('Using local PRESET_TRACKS database.');
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

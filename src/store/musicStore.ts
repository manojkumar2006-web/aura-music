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
  {
    "id": "track-1712662870-1712662873",
    "title": "Bloody Sweet",
    "artist": "Anirudh Ravichander & Siddharth Basrur",
    "album": "Leo",
    "duration": "2:49",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-10-19",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1712662870-1712662876",
    "title": "Naa Ready",
    "artist": "Anirudh Ravichander, Vijay & Asal Kolaar",
    "album": "Leo",
    "duration": "4:08",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2023-10-19",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1712662870-1712663147",
    "title": "Glimpse of Antony Das",
    "artist": "Anirudh Ravichander",
    "album": "Leo",
    "duration": "0:40",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2023-10-19",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1712662870-1712663149",
    "title": "Anbenum",
    "artist": "Anirudh Ravichander & Lothika",
    "album": "Leo",
    "duration": "3:34",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2023-10-19",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1712662870-1712663155",
    "title": "Glimpse of Harold Das",
    "artist": "Anirudh Ravichander",
    "album": "Leo",
    "duration": "0:43",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2023-10-19",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1712662870-1712663156",
    "title": "Badass",
    "artist": "Anirudh Ravichander",
    "album": "Leo",
    "duration": "3:50",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2023-10-19",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1712662870-1712663157",
    "title": "Lokiverse 2.0",
    "artist": "Anirudh Ravichander",
    "album": "Leo",
    "duration": "1:54",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2023-10-19",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1699735063-1699735311",
    "title": "Kaavaalaa",
    "artist": "Anirudh Ravichander, Shilpa Rao & Arunraja Kamaraj",
    "album": "Jailer",
    "duration": "3:11",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-07-28",
    "hero": "Rajinikanth",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1699735063-1699735313",
    "title": "Jailer Theme (Instrumental)",
    "artist": "Anirudh Ravichander",
    "album": "Jailer",
    "duration": "1:02",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2023-07-28",
    "hero": "Rajinikanth",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1699735063-1699735322",
    "title": "Rathamaarey",
    "artist": "Vishal Mishra, Anirudh Ravichander & Vignesh Shivan",
    "album": "Jailer",
    "duration": "4:12",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2023-07-28",
    "hero": "Rajinikanth",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1699735063-1699735324",
    "title": "Muthuvel Pandian Theme (Instrumental)",
    "artist": "Anirudh Ravichander",
    "album": "Jailer",
    "duration": "1:43",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2023-07-28",
    "hero": "Rajinikanth",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1699735063-1699735327",
    "title": "Hukum - Thalaivar Alappara",
    "artist": "Anirudh Ravichander & Super Subu",
    "album": "Jailer",
    "duration": "3:28",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2023-07-28",
    "hero": "Rajinikanth",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1699735063-1699735333",
    "title": "Jailer Drill Theme (Instrumental)",
    "artist": "Anirudh Ravichander",
    "album": "Jailer",
    "duration": "0:43",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2023-07-28",
    "hero": "Rajinikanth",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1699735063-1699735637",
    "title": "Jujubee",
    "artist": "Anirudh Ravichander, Dhee, Anantha Krishnan & Super Subu",
    "album": "Jailer",
    "duration": "2:47",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2023-07-28",
    "hero": "Rajinikanth",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1699735063-1699735641",
    "title": "Alappara Theme (Instrumental)",
    "artist": "Anirudh Ravichander",
    "album": "Jailer",
    "duration": "1:18",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "releaseDate": "2023-07-28",
    "hero": "Rajinikanth",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1624359269-1624359271",
    "title": "Pathala Pathala",
    "artist": "Anirudh Ravichander & Kamal Haasan",
    "album": "Vikram",
    "duration": "3:31",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/41/41/01/41410135-baa0-1aab-7417-f6746b0f3c25/196589186973.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2022-05-15",
    "hero": "Kamal Haasan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1624359269-1624359275",
    "title": "Vikram (Title Track)",
    "artist": "Anirudh Ravichander",
    "album": "Vikram",
    "duration": "3:39",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/41/41/01/41410135-baa0-1aab-7417-f6746b0f3c25/196589186973.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-05-15",
    "hero": "Kamal Haasan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1624359269-1624359426",
    "title": "Wasted",
    "artist": "Anirudh Ravichander",
    "album": "Vikram",
    "duration": "3:03",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/41/41/01/41410135-baa0-1aab-7417-f6746b0f3c25/196589186973.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2022-05-15",
    "hero": "Kamal Haasan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1624359269-1624359429",
    "title": "Porkanda Singam",
    "artist": "Anirudh Ravichander & Ravi G",
    "album": "Vikram",
    "duration": "3:18",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/41/41/01/41410135-baa0-1aab-7417-f6746b0f3c25/196589186973.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2022-05-15",
    "hero": "Kamal Haasan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1624359269-1624359430",
    "title": "Once Upon a Time",
    "artist": "Anirudh Ravichander",
    "album": "Vikram",
    "duration": "2:24",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/41/41/01/41410135-baa0-1aab-7417-f6746b0f3c25/196589186973.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2022-05-15",
    "hero": "Kamal Haasan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1502968254-1502968258",
    "title": "Vaathi Coming",
    "artist": "Anirudh Ravichander & Gana Balachandar",
    "album": "Master",
    "duration": "3:48",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2020-03-16",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1502968254-1502968259",
    "title": "Andha Kanna Paathaakaa",
    "artist": "Anirudh Ravichander & Yuvan Shankar Raja",
    "album": "Master",
    "duration": "3:15",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2020-03-16",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1502968254-1502968260",
    "title": "Kutti Story",
    "artist": "Anirudh Ravichander & Vijay",
    "album": "Master",
    "duration": "5:01",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2020-03-16",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1502968254-1502968261",
    "title": "Quit Pannuda",
    "artist": "Anirudh Ravichander",
    "album": "Master",
    "duration": "4:17",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2020-03-16",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1502968254-1502968262",
    "title": "Beat of Master (Instrumental)",
    "artist": "Anirudh Ravichander",
    "album": "Master",
    "duration": "1:16",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2020-03-16",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1502968254-1502968263",
    "title": "Polakattum Para Para",
    "artist": "Anirudh Ravichander & Santhosh Narayanan",
    "album": "Master",
    "duration": "3:34",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2020-03-16",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1502968254-1502968264",
    "title": "Pona Pogattum",
    "artist": "Anirudh Ravichander & CB Vinith",
    "album": "Master",
    "duration": "1:37",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2020-03-16",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1502968254-1502968658",
    "title": "Vaathi Raid",
    "artist": "Anirudh Ravichander & Arivu",
    "album": "Master",
    "duration": "3:30",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "releaseDate": "2020-03-16",
    "hero": "Thalapathy Vijay",
    "musicDirector": "Anirudh Ravichander",
    "region": "Kollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1619744666-1619744667",
    "title": "Dosti",
    "artist": "Hemachandra",
    "album": "RRR",
    "duration": "5:40",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2022-04-16",
    "hero": "Ram Charan",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1619744666-1619744668",
    "title": "Naatu Naatu",
    "artist": "Rahul Sipligunj & Kaala Bhairava",
    "album": "RRR",
    "duration": "3:34",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-04-16",
    "hero": "Ram Charan",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1619744666-1619744669",
    "title": "Janani",
    "artist": "M.M. Keeravani",
    "album": "RRR",
    "duration": "3:08",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2022-04-16",
    "hero": "Ram Charan",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1619744666-1619744670",
    "title": "Komuram Bheemudo",
    "artist": "Kaala Bhairava",
    "album": "RRR",
    "duration": "4:14",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2022-04-16",
    "hero": "Ram Charan",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1619744666-1619744671",
    "title": "Raamam Raaghavam",
    "artist": "Vijay Prakash, Chandana Bala Kalyan & Charu Hariharan",
    "album": "RRR",
    "duration": "3:51",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2022-04-16",
    "hero": "Ram Charan",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1619744666-1619744673",
    "title": "Etthara Jenda",
    "artist": "Vishal Mishra, Prudhvi Chandra, M.M. Keeravani, Sahithi Chaganti & Harika Narayan",
    "album": "RRR",
    "duration": "4:22",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2022-04-16",
    "hero": "Ram Charan",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1619744666-1619744674",
    "title": "Komma Uyyala",
    "artist": "Prakruthi Reddy",
    "album": "RRR",
    "duration": "4:44",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2022-04-16",
    "hero": "Ram Charan",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1602184415-1602184663",
    "title": "Daakko Daakko Meka",
    "artist": "Sivam",
    "album": "Pushpa",
    "duration": "4:56",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2021-12-25",
    "hero": "Allu Arjun",
    "musicDirector": "Devi Sri Prasad",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Rainy"
  },
  {
    "id": "track-1602184415-1602184669",
    "title": "Srivalli",
    "artist": "Sid Sriram",
    "album": "Pushpa",
    "duration": "3:41",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2021-12-25",
    "hero": "Allu Arjun",
    "musicDirector": "Devi Sri Prasad",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Rainy"
  },
  {
    "id": "track-1602184415-1602184672",
    "title": "Oo Antava Oo Oo Antava",
    "artist": "Indravathi Chauhan",
    "album": "Pushpa",
    "duration": "3:43",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2021-12-25",
    "hero": "Allu Arjun",
    "musicDirector": "Devi Sri Prasad",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Rainy"
  },
  {
    "id": "track-1602184415-1602184675",
    "title": "Saami Saami",
    "artist": "Mounika Yadav",
    "album": "Pushpa",
    "duration": "3:44",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2021-12-25",
    "hero": "Allu Arjun",
    "musicDirector": "Devi Sri Prasad",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Rainy"
  },
  {
    "id": "track-1602184415-1602184676",
    "title": "Eyy Bidda Idhi Naa Adda",
    "artist": "Nakash Aziz",
    "album": "Pushpa",
    "duration": "3:54",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2021-12-25",
    "hero": "Allu Arjun",
    "musicDirector": "Devi Sri Prasad",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Rainy"
  },
  {
    "id": "track-1495371405-1495371407",
    "title": "Samajavaragamana",
    "artist": "Sid Sriram",
    "album": "Ala Vaikunthapurramuloo",
    "duration": "3:40",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2020-01-17",
    "hero": "Allu Arjun",
    "musicDirector": "Thaman S",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1495371405-1495372344",
    "title": "Ramuloo Ramulaa",
    "artist": "Anurag Kulkarni & Mangli",
    "album": "Ala Vaikunthapurramuloo",
    "duration": "4:06",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2020-01-17",
    "hero": "Allu Arjun",
    "musicDirector": "Thaman S",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1495371405-1495372461",
    "title": "OMG Daddy",
    "artist": "Roll Rida, Rahul Nambiar & Lady Kash",
    "album": "Ala Vaikunthapurramuloo",
    "duration": "3:48",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2020-01-17",
    "hero": "Allu Arjun",
    "musicDirector": "Thaman S",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1495371405-1495372469",
    "title": "Buttabomma",
    "artist": "Armaan Malik",
    "album": "Ala Vaikunthapurramuloo",
    "duration": "3:19",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2020-01-17",
    "hero": "Allu Arjun",
    "musicDirector": "Thaman S",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1495371405-1495372470",
    "title": "Samajavaragamana (Female Version)",
    "artist": "Shreya Ghoshal",
    "album": "Ala Vaikunthapurramuloo",
    "duration": "4:01",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2020-01-17",
    "hero": "Allu Arjun",
    "musicDirector": "Thaman S",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1495371405-1495372474",
    "title": "Ala Vaikunthapurramuloo",
    "artist": "Sri Krishna & Priya Sisters",
    "album": "Ala Vaikunthapurramuloo",
    "duration": "3:20",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2020-01-17",
    "hero": "Allu Arjun",
    "musicDirector": "Thaman S",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1495371405-1495372475",
    "title": "Sittharala Sirapadu",
    "artist": "Sooranna & Saketh Komanduri",
    "album": "Ala Vaikunthapurramuloo",
    "duration": "3:10",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2020-01-17",
    "hero": "Allu Arjun",
    "musicDirector": "Thaman S",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1646468760-1646468764",
    "title": "Punnara Kanavine",
    "artist": "M.M. Keeravani, Geetha Madhuri & Mankombu Gopalakrishnan",
    "album": "Baahubali",
    "duration": "1:40",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2015-01-01",
    "hero": "Prabhas",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1646468760-1646468767",
    "title": "Aarivan Aarivan",
    "artist": "Vaikom Vijayalakshmi & Mankombu Gopalakrishnan",
    "album": "Baahubali",
    "duration": "3:17",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2015-01-01",
    "hero": "Prabhas",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1646468760-1646468769",
    "title": "Njan Chendena",
    "artist": "Vijay Yesudas, Swetha Mohan & Mankombu Gopalakrishnan",
    "album": "Baahubali",
    "duration": "5:30",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2015-01-01",
    "hero": "Prabhas",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1646468760-1646468771",
    "title": "Pacha Theeyanu Nee",
    "artist": "Vijay Yesudas, Swetha Mohan & Mankombu Gopalakrishnan",
    "album": "Baahubali",
    "duration": "3:01",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2015-01-01",
    "hero": "Prabhas",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1646468760-1646468772",
    "title": "Theekkanal Swasamai",
    "artist": "Sachin Warrier & Mankombu Gopalakrishnan",
    "album": "Baahubali",
    "duration": "3:10",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2015-01-01",
    "hero": "Prabhas",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1646468760-1646468773",
    "title": "Irul Thingum Vaanil",
    "artist": "Yamini & Mankombu Gopalakrishnan",
    "album": "Baahubali",
    "duration": "3:48",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2015-01-01",
    "hero": "Prabhas",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1646468760-1646468774",
    "title": "Manohari",
    "artist": "Vijay Yesudas, Sayanora & Mankombu Gopalakrishnan",
    "album": "Baahubali",
    "duration": "3:37",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2015-01-01",
    "hero": "Prabhas",
    "musicDirector": "M. M. Keeravani",
    "region": "Tollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1705952061-1705952062",
    "title": "Zinda Banda",
    "artist": "Anirudh Ravichander & Irshad Kamil",
    "album": "Jawan",
    "duration": "4:24",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-09-05",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1705952061-1705952066",
    "title": "Chaleya",
    "artist": "Anirudh Ravichander, Arijit Singh, Shilpa Rao & Kumaar",
    "album": "Jawan",
    "duration": "3:20",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2023-09-05",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1705952061-1705952067",
    "title": "Not Ramaiya Vastavaiya",
    "artist": "Anirudh Ravichander, Vishal Dadlani, Shilpa Rao & Kumaar",
    "album": "Jawan",
    "duration": "3:23",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2023-09-05",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1705952061-1705952068",
    "title": "Aararaari Raaro",
    "artist": "Anirudh Ravichander, Deepthi Suresh & Irshad Kamil",
    "album": "Jawan",
    "duration": "4:38",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2023-09-05",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1705952061-1705952069",
    "title": "Jawan Title Track",
    "artist": "Anirudh Ravichander & Raja Kumari",
    "album": "Jawan",
    "duration": "3:08",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2023-09-05",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1705952061-1705952070",
    "title": "Faraatta",
    "artist": "Anirudh Ravichander, Arijit Singh, Jonita Gandhi & Badshah",
    "album": "Jawan",
    "duration": "3:15",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2023-09-05",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1705952061-1705952071",
    "title": "Chaleya Arabic Version",
    "artist": "Grini, Jamila El Badaoui & Kumaar",
    "album": "Jawan",
    "duration": "3:20",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2023-09-05",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Anirudh Ravichander",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1659644976-1659644977",
    "title": "Besharam Rang",
    "artist": "Vishal & Shekhar, Shilpa Rao, Caralisa Monteiro, Vishal Dadlani & Shekhar Ravjiani",
    "album": "Pathaan",
    "duration": "4:18",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/6a/19/8d6a197e-2aaa-5504-cd43-533351597487/Pathaan-Album-Audio-Cover-Final.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2022-12-22",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Vishal-Shekhar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1659644976-1659644978",
    "title": "Jhoome Jo Pathaan",
    "artist": "Vishal & Shekhar, Arijit Singh, Sukriti Kakar, Vishal Dadlani & Shekhar Ravjiani",
    "album": "Pathaan",
    "duration": "3:28",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/6a/19/8d6a197e-2aaa-5504-cd43-533351597487/Pathaan-Album-Audio-Cover-Final.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-12-22",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Vishal-Shekhar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1659644976-1659644979",
    "title": "Pathaan’s Theme",
    "artist": "Sanchit Balhara & Ankit Balhara",
    "album": "Pathaan",
    "duration": "2:37",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/6a/19/8d6a197e-2aaa-5504-cd43-533351597487/Pathaan-Album-Audio-Cover-Final.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2022-12-22",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Vishal-Shekhar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1659644976-1659644980",
    "title": "Jim’s Theme",
    "artist": "Sanchit Balhara & Ankit Balhara",
    "album": "Pathaan",
    "duration": "1:13",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/6a/19/8d6a197e-2aaa-5504-cd43-533351597487/Pathaan-Album-Audio-Cover-Final.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2022-12-22",
    "hero": "Shah Rukh Khan",
    "musicDirector": "Vishal-Shekhar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1718278225-1718278228",
    "title": "Arjan Vailly",
    "artist": "Manan Bhardwaj & Bhupinder Babbal",
    "album": "Animal",
    "duration": "3:02",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-11-24",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Harshavardhan Rameshwar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1718278225-1718278230",
    "title": "Hua Main",
    "artist": "Raghav Chaitanya, Manoj Muntashir & Pritam",
    "album": "Animal",
    "duration": "4:37",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2023-11-24",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Harshavardhan Rameshwar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1718278225-1718278231",
    "title": "Satranga",
    "artist": "Arijit Singh, Shreyas Puranik & Siddharth-Garima",
    "album": "Animal",
    "duration": "4:31",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2023-11-24",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Harshavardhan Rameshwar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1718278225-1718278233",
    "title": "Papa Meri Jaan",
    "artist": "Sonu Nigam, Harshavardhan Rameshwar & Raj Shekhar",
    "album": "Animal",
    "duration": "5:22",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2023-11-24",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Harshavardhan Rameshwar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1718278225-1718278234",
    "title": "Pehle Bhi Main",
    "artist": "Vishal Mishra & Raj Shekhar",
    "album": "Animal",
    "duration": "4:10",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2023-11-24",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Harshavardhan Rameshwar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1718278225-1718278236",
    "title": "Kashmir",
    "artist": "Manan Bhardwaj & Shreya Ghoshal",
    "album": "Animal",
    "duration": "3:36",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2023-11-24",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Harshavardhan Rameshwar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1718278225-1718278238",
    "title": "Saari Duniya Jalaa Denge",
    "artist": "Jaani & B. Praak",
    "album": "Animal",
    "duration": "3:02",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2023-11-24",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Harshavardhan Rameshwar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1718278225-1718278239",
    "title": "Haiwaan",
    "artist": "Ashim Kemson",
    "album": "Animal",
    "duration": "2:43",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "releaseDate": "2023-11-24",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Harshavardhan Rameshwar",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Stormy"
  },
  {
    "id": "track-1648663561-1648663570",
    "title": "Kesariya",
    "artist": "Pritam, Arijit Singh & Amitabh Bhattacharya",
    "album": "Brahmastra",
    "duration": "4:28",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2022-10-06",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Pritam",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1648663561-1648663668",
    "title": "Deva Deva",
    "artist": "Pritam, Arijit Singh, Amitabh Bhattacharya & Jonita Gandhi",
    "album": "Brahmastra",
    "duration": "4:39",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-10-06",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Pritam",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1648663561-1648663673",
    "title": "Dance Ka Bhoot",
    "artist": "Pritam, Arijit Singh & Amitabh Bhattacharya",
    "album": "Brahmastra",
    "duration": "4:06",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2022-10-06",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Pritam",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1648663561-1648663684",
    "title": "Rasiya",
    "artist": "Pritam, Shreya Ghoshal & Tushar Joshi",
    "album": "Brahmastra",
    "duration": "4:25",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2022-10-06",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Pritam",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1648663561-1648663687",
    "title": "Shiva Theme",
    "artist": "Pritam & Javed Ali",
    "album": "Brahmastra",
    "duration": "3:12",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2022-10-06",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Pritam",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1648663561-1648663692",
    "title": "Kesariya (Dance Mix)",
    "artist": "Pritam, Shashwat Singh, Antara Mitra & Arijit Singh",
    "album": "Brahmastra",
    "duration": "3:17",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2022-10-06",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Pritam",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1648663561-1648663695",
    "title": "Deva Deva (Film Version)",
    "artist": "Pritam, Arijit Singh, Jonita Gandhi & Amitabh Bhattacharya",
    "album": "Brahmastra",
    "duration": "6:15",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2022-10-06",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Pritam",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1648663561-1648663849",
    "title": "Rasiya Reprise",
    "artist": "Pritam, Arijit Singh & Amitabh Bhattacharya",
    "album": "Brahmastra",
    "duration": "4:45",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "releaseDate": "2022-10-06",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Pritam",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1648663561-1648663852",
    "title": "Dev Theme",
    "artist": "Pritam & SlowCheeta",
    "album": "Brahmastra",
    "duration": "2:55",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "releaseDate": "2022-10-06",
    "hero": "Ranbir Kapoor",
    "musicDirector": "Pritam",
    "region": "Bollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1499385848-1499385854",
    "title": "Alone Again",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "4:10",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499385861",
    "title": "Too Late",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "3:60",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386245",
    "title": "Hardest To Love",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "3:31",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386246",
    "title": "Scared To Live",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "3:11",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386249",
    "title": "Snowchild",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "4:07",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386250",
    "title": "Escape From LA",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "5:56",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386253",
    "title": "Heartless",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "3:18",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386254",
    "title": "Faith",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "4:43",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386265",
    "title": "Blinding Lights",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "3:20",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386363",
    "title": "In Your Eyes",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "3:58",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386369",
    "title": "Save Your Tears",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "3:36",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386370",
    "title": "Repeat After Me (Interlude)",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "3:16",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386375",
    "title": "After Hours",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "6:01",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1499385848-1499386377",
    "title": "Until I Bleed Out",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "3:10",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    "releaseDate": "2020-03-20",
    "hero": "The Weeknd",
    "musicDirector": "Max Martin",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870375",
    "title": "Starboy (feat. Daft Punk)",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:50",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870376",
    "title": "Party Monster",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "4:09",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870377",
    "title": "False Alarm",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:40",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870378",
    "title": "Reminder",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:39",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870381",
    "title": "Rockin’",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:53",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870382",
    "title": "Secrets",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "4:26",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870383",
    "title": "True Colors",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:26",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870384",
    "title": "Stargirl Interlude (feat. Lana Del Rey)",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "1:52",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870385",
    "title": "Sidewalks (feat. Kendrick Lamar)",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:51",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870386",
    "title": "Six Feet Under",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:58",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870387",
    "title": "Love To Lay",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:43",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870389",
    "title": "A Lonely Night",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:40",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870390",
    "title": "Attention",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:18",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870392",
    "title": "Ordinary Life",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:42",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870393",
    "title": "Nothing Without You",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "3:19",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870394",
    "title": "All I Know (feat. Future)",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "5:21",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870395",
    "title": "Die For You",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "4:20",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1440870373-1440870397",
    "title": "I Feel It Coming (feat. Daft Punk)",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "4:29",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2016-11-25",
    "hero": "The Weeknd",
    "musicDirector": "Daft Punk",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "track-1468058165-1468058169",
    "title": "I Forgot That You Existed",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "2:51",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058171",
    "title": "Cruel Summer",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "2:58",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058173",
    "title": "Lover",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:41",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058176",
    "title": "The Man",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:10",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058177",
    "title": "The Archer",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:31",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058178",
    "title": "I Think He Knows",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "2:53",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058180",
    "title": "Miss Americana & The Heartbreak Prince",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:54",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058181",
    "title": "Paper Rings",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:42",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058184",
    "title": "Cornelia Street",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "4:47",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058185",
    "title": "Death By A Thousand Cuts",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:19",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058696",
    "title": "London Boy",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:10",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058699",
    "title": "Soon You’ll Get Better (feat. The Chicks)",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:22",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058701",
    "title": "False God",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:20",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058704",
    "title": "You Need To Calm Down",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "2:51",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058705",
    "title": "Afterglow",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:43",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058706",
    "title": "ME! (feat. Brendon Urie of Panic! At The Disco)",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "3:13",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058707",
    "title": "It’s Nice To Have A Friend",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "2:30",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1468058165-1468058708",
    "title": "Daylight",
    "artist": "Taylor Swift",
    "album": "Lover",
    "duration": "4:53",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2019-08-23",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1649434996-1649435004",
    "title": "Lavender Haze",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "3:22",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435011",
    "title": "Maroon",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "3:38",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435022",
    "title": "Anti-Hero",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "3:21",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435236",
    "title": "Snow On The Beach (feat. Lana Del Rey)",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "4:16",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435238",
    "title": "You're On Your Own, Kid",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "3:14",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435243",
    "title": "Midnight Rain",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "2:55",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435249",
    "title": "Question...?",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "3:31",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435259",
    "title": "Vigilante Shit",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "2:45",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435261",
    "title": "Bejeweled",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "3:14",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435264",
    "title": "Labyrinth",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "4:08",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435543",
    "title": "Karma",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "3:25",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435553",
    "title": "Sweet Nothing",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "3:08",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435558",
    "title": "Mastermind",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "3:11",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1649434996-1649435722",
    "title": "Meet me at midnight",
    "artist": "Taylor Swift",
    "album": "Midnights",
    "duration": "0:09",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    "releaseDate": "2022-10-21",
    "hero": "Taylor Swift",
    "musicDirector": "Jack Antonoff",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1193701079-1193701326",
    "title": "Eraser",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "3:48",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701328",
    "title": "Castle on the Hill",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "4:21",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701329",
    "title": "Dive",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "3:58",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701392",
    "title": "Shape of You",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "3:54",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701400",
    "title": "Perfect",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "4:23",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701436",
    "title": "Galway Girl",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "2:51",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701439",
    "title": "Happier",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "3:28",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701440",
    "title": "New Man",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "3:09",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701441",
    "title": "Hearts Don't Break Around Here",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "4:08",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701442",
    "title": "What Do I Know?",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "3:57",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701449",
    "title": "How Would You Feel (Paean)",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "4:41",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701511",
    "title": "Supermarket Flowers",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "3:41",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701517",
    "title": "Barcelona",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "3:11",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701519",
    "title": "Bibia Be Ye Ye",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "2:57",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701520",
    "title": "Nancy Mulligan",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "2:60",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1193701079-1193701521",
    "title": "Save Myself",
    "artist": "Ed Sheeran",
    "album": "Divide",
    "duration": "4:07",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    "releaseDate": "2017-03-03",
    "hero": "Ed Sheeran",
    "musicDirector": "Steve Mac",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Sunny"
  },
  {
    "id": "track-1581087024-1581087029",
    "title": "Tides",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:16",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087034",
    "title": "Shivers",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:28",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087526",
    "title": "First Times",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:06",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087532",
    "title": "Bad Habits",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:51",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087534",
    "title": "Overpass Graffiti",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:57",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087536",
    "title": "The Joker And The Queen",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:06",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087537",
    "title": "Leave Your Life",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:44",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087540",
    "title": "Collide",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:30",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087542",
    "title": "2step",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "2:34",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087545",
    "title": "Stop The Rain",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:23",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087756",
    "title": "Love In Slow Motion",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:11",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087760",
    "title": "Visiting Hours",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:36",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087767",
    "title": "Sandman",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "4:19",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "track-1581087024-1581087780",
    "title": "Be Right Now",
    "artist": "Ed Sheeran",
    "album": "Equals",
    "duration": "3:31",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    "releaseDate": "2021-10-29",
    "hero": "Ed Sheeran",
    "musicDirector": "Johnny McDaid",
    "region": "Hollywood",
    "isPremium": false,
    "weather": "Cloudy"
  },
  {
    "id": "lofi-1",
    "title": "3 AM Study Session",
    "artist": "Lofi Girl",
    "album": "Lofi Vibes",
    "duration": "2:45",
    "coverUrl": "https://i.scdn.co/image/ab67616d0000b273d722d3b769ea8d88e6dfd150",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-01-01",
    "hero": "Lofi Girl",
    "musicDirector": "ChilledCow",
    "region": "Lo-Fi",
    "isPremium": false,
    "weather": "Night"
  },
  {
    "id": "lofi-2",
    "title": "Rainy Days",
    "artist": "Kudasai",
    "album": "Falling",
    "duration": "3:10",
    "coverUrl": "https://i.scdn.co/image/ab67616d0000b27306231bd4bf9f2b1c7ab1286c",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-04-15",
    "hero": "Lofi Girl",
    "musicDirector": "Kudasai",
    "region": "Lo-Fi",
    "isPremium": false,
    "weather": "Rainy"
  },
  {
    "id": "lofi-3",
    "title": "Sunset Chill",
    "artist": "Idealism",
    "album": "Hiraeth",
    "duration": "2:30",
    "coverUrl": "https://i.scdn.co/image/ab67616d0000b2734a6a0eec3ccce5f76f4995eb",
    "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2021-08-20",
    "hero": "Lofi Girl",
    "musicDirector": "Idealism",
    "region": "Lo-Fi",
    "isPremium": false,
    "weather": "Cloudy"
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

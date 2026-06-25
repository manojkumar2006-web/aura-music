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
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-10-19", "hero": "Thalapathy Vijay", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "k-leo-2", "title": "Naa Ready", "artist": "Anirudh Ravichander, Thalapathy Vijay", "album": "Leo", "duration": "4:08",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2023-10-19", "hero": "Thalapathy Vijay", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Cloudy"
  },
  {
    "id": "k-leo-3", "title": "Ordinary Person", "artist": "Anirudh Ravichander, Nikhita Gandhi", "album": "Leo", "duration": "2:50",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2023-10-19", "hero": "Thalapathy Vijay", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Rainy"
  },
  {
    "id": "k-jailer-1", "title": "Hukum", "artist": "Anirudh Ravichander", "album": "Jailer", "duration": "3:27",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2023-08-10", "hero": "Rajinikanth", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Stormy"
  },
  {
    "id": "k-jailer-2", "title": "Kaavaalaa", "artist": "Anirudh Ravichander, Shilpa Rao", "album": "Jailer", "duration": "3:10",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-08-10", "hero": "Rajinikanth", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "k-vikram-1", "title": "Pathala Pathala", "artist": "Anirudh Ravichander, Kamal Haasan", "album": "Vikram", "duration": "3:30",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/41/41/01/41410135-baa0-1aab-7417-f6746b0f3c25/196589186973.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-06-03", "hero": "Kamal Haasan", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "k-vikram-2", "title": "Vikram Title Track", "artist": "Anirudh Ravichander", "album": "Vikram", "duration": "3:15",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/41/41/01/41410135-baa0-1aab-7417-f6746b0f3c25/196589186973.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2022-06-03", "hero": "Kamal Haasan", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Stormy"
  },
  {
    "id": "k-master-1", "title": "Vaathi Coming", "artist": "Anirudh Ravichander, Gana Balachandar", "album": "Master", "duration": "3:50",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2021-01-13", "hero": "Thalapathy Vijay", "musicDirector": "Anirudh Ravichander", "region": "Kollywood", "isPremium": false, "weather": "Sunny"
  },

  // ================= TOLLYWOOD =================
  {
    "id": "t-rrr-1", "title": "Naatu Naatu", "artist": "Rahul Sipligunj, Kaala Bhairava", "album": "RRR", "duration": "3:35",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2022-03-24", "hero": "Ram Charan", "musicDirector": "M. M. Keeravani", "region": "Tollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "t-rrr-2", "title": "Dosti", "artist": "Hemachandra", "album": "RRR", "duration": "5:40",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-03-24", "hero": "Jr NTR", "musicDirector": "M. M. Keeravani", "region": "Tollywood", "isPremium": false, "weather": "Cloudy"
  },
  {
    "id": "t-pushpa-1", "title": "Oo Antava", "artist": "Indravathi Chauhan", "album": "Pushpa", "duration": "3:44",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2021-12-17", "hero": "Allu Arjun", "musicDirector": "Devi Sri Prasad", "region": "Tollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "t-pushpa-2", "title": "Srivalli", "artist": "Sid Sriram", "album": "Pushpa", "duration": "3:40",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2021-12-17", "hero": "Allu Arjun", "musicDirector": "Devi Sri Prasad", "region": "Tollywood", "isPremium": false, "weather": "Rainy"
  },
  {
    "id": "t-ala-1", "title": "Butta Bomma", "artist": "Armaan Malik", "album": "Ala Vaikunthapurramuloo", "duration": "3:18",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2020-01-12", "hero": "Allu Arjun", "musicDirector": "Thaman S", "region": "Tollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "t-ala-2", "title": "Ramuloo Ramulaa", "artist": "Anurag Kulkarni, Mangli", "album": "Ala Vaikunthapurramuloo", "duration": "4:30",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2020-01-12", "hero": "Allu Arjun", "musicDirector": "Thaman S", "region": "Tollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "t-baahu-1", "title": "Dheevara", "artist": "Ramya Behara, Deepu", "album": "Baahubali", "duration": "5:43",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2015-07-10", "hero": "Prabhas", "musicDirector": "M. M. Keeravani", "region": "Tollywood", "isPremium": false, "weather": "Cloudy"
  },

  // ================= BOLLYWOOD =================
  {
    "id": "b-jawan-1", "title": "Chaleya", "artist": "Arijit Singh, Shilpa Rao", "album": "Jawan", "duration": "3:20",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2023-09-07", "hero": "Shah Rukh Khan", "musicDirector": "Anirudh Ravichander", "region": "Bollywood", "isPremium": false, "weather": "Rainy"
  },
  {
    "id": "b-jawan-2", "title": "Zinda Banda", "artist": "Anirudh Ravichander", "album": "Jawan", "duration": "4:24",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-09-07", "hero": "Shah Rukh Khan", "musicDirector": "Anirudh Ravichander", "region": "Bollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "b-pathaan-1", "title": "Jhoome Jo Pathaan", "artist": "Arijit Singh, Sukriti Kakar", "album": "Pathaan", "duration": "3:28",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/6a/19/8d6a197e-2aaa-5504-cd43-533351597487/Pathaan-Album-Audio-Cover-Final.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2023-01-25", "hero": "Shah Rukh Khan", "musicDirector": "Vishal-Shekhar", "region": "Bollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "b-pathaan-2", "title": "Besharam Rang", "artist": "Shilpa Rao, Caralisa Monteiro", "album": "Pathaan", "duration": "4:18",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/6a/19/8d6a197e-2aaa-5504-cd43-533351597487/Pathaan-Album-Audio-Cover-Final.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2023-01-25", "hero": "Shah Rukh Khan", "musicDirector": "Vishal-Shekhar", "region": "Bollywood", "isPremium": false, "weather": "Cloudy"
  },
  {
    "id": "b-animal-1", "title": "Arjan Vailly", "artist": "Bhupinder Babbal", "album": "Animal", "duration": "3:02",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2023-12-01", "hero": "Ranbir Kapoor", "musicDirector": "Harshavardhan Rameshwar", "region": "Bollywood", "isPremium": false, "weather": "Stormy"
  },
  {
    "id": "b-brahmastra-1", "title": "Kesariya", "artist": "Arijit Singh", "album": "Brahmastra", "duration": "4:28",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2022-09-09", "hero": "Ranbir Kapoor", "musicDirector": "Pritam", "region": "Bollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "b-brahmastra-2", "title": "Deva Deva", "artist": "Arijit Singh, Jonita Gandhi", "album": "Brahmastra", "duration": "4:39",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-09-09", "hero": "Ranbir Kapoor", "musicDirector": "Pritam", "region": "Bollywood", "isPremium": false, "weather": "Cloudy"
  },

  // ================= HOLLYWOOD / GLOBAL =================
  {
    "id": "h-weeknd-1", "title": "Blinding Lights", "artist": "The Weeknd", "album": "After Hours", "duration": "3:20",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2020-03-20", "hero": "The Weeknd", "musicDirector": "Max Martin", "region": "Hollywood", "isPremium": false, "weather": "Night"
  },
  {
    "id": "h-weeknd-2", "title": "Starboy", "artist": "The Weeknd, Daft Punk", "album": "Starboy", "duration": "3:50",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2016-11-25", "hero": "The Weeknd", "musicDirector": "Daft Punk", "region": "Hollywood", "isPremium": false, "weather": "Night"
  },
  {
    "id": "h-swift-1", "title": "Cruel Summer", "artist": "Taylor Swift", "album": "Lover", "duration": "2:58",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2019-08-23", "hero": "Taylor Swift", "musicDirector": "Jack Antonoff", "region": "Hollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "h-swift-2", "title": "Anti-Hero", "artist": "Taylor Swift", "album": "Midnights", "duration": "3:20",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-10-21", "hero": "Taylor Swift", "musicDirector": "Jack Antonoff", "region": "Hollywood", "isPremium": false, "weather": "Cloudy"
  },
  {
    "id": "h-ed-1", "title": "Shape of You", "artist": "Ed Sheeran", "album": "Divide", "duration": "3:53",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "releaseDate": "2017-03-03", "hero": "Ed Sheeran", "musicDirector": "Steve Mac", "region": "Hollywood", "isPremium": false, "weather": "Sunny"
  },
  {
    "id": "h-ed-2", "title": "Bad Habits", "artist": "Ed Sheeran", "album": "Equals", "duration": "3:51",
    "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/1000x1000bb.jpg", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "releaseDate": "2021-10-29", "hero": "Ed Sheeran", "musicDirector": "Johnny McDaid", "region": "Hollywood", "isPremium": false, "weather": "Night"
  },

  // ================= LO-FI / VIBE =================
  {
    "id": "lofi-1", "title": "3 AM Study Session", "artist": "Lofi Girl", "album": "Lofi Vibes", "duration": "2:45",
    "coverUrl": "https://i.scdn.co/image/ab67616d0000b273d722d3b769ea8d88e6dfd150", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "releaseDate": "2023-01-01", "hero": "Lofi Girl", "musicDirector": "ChilledCow", "region": "Lo-Fi", "isPremium": false, "weather": "Night"
  },
  {
    "id": "lofi-2", "title": "Rainy Days", "artist": "Kudasai", "album": "Falling", "duration": "3:10",
    "coverUrl": "https://i.scdn.co/image/ab67616d0000b27306231bd4bf9f2b1c7ab1286c", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "releaseDate": "2022-04-15", "hero": "Lofi Girl", "musicDirector": "Kudasai", "region": "Lo-Fi", "isPremium": false, "weather": "Rainy"
  },
  {
    "id": "lofi-3", "title": "Sunset Chill", "artist": "Idealism", "album": "Hiraeth", "duration": "2:30",
    "coverUrl": "https://i.scdn.co/image/ab67616d0000b2734a6a0eec3ccce5f76f4995eb", "audioUrl128k": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
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

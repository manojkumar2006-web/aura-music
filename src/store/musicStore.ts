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
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/01/e2/6f/01e26fcf-6716-f5b0-d09f-5c0b889a1f3a/mzaf_14101440889502305367.plus.aac.p.m4a",
        "releaseDate": "2023-10-19",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "SHVV67jzNSU"
    },
    {
        "id": "track-1712662870-1712662876",
        "title": "Naa Ready",
        "artist": "Anirudh Ravichander, Vijay & Asal Kolaar",
        "album": "Leo",
        "duration": "4:08",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a8/32/c8/a832c835-a3bb-02fb-f8ee-affbf922e4df/mzaf_8172757334851723076.plus.aac.p.m4a",
        "releaseDate": "2023-10-19",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "szvt1vD0Uug"
    },
    {
        "id": "track-1712662870-1712663147",
        "title": "Glimpse of Antony Das",
        "artist": "Anirudh Ravichander",
        "album": "Leo",
        "duration": "0:40",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b9/a7/dd/b9a7dd1d-f9d2-86c5-bb8c-d47199ce0162/mzaf_18372520537198093648.plus.aac.p.m4a",
        "releaseDate": "2023-10-19",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "txFREOQGE9k"
    },
    {
        "id": "track-1712662870-1712663149",
        "title": "Anbenum",
        "artist": "Anirudh Ravichander & Lothika",
        "album": "Leo",
        "duration": "3:34",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c9/79/f0/c979f0b6-bafb-4f4a-7b05-0681e79a26da/mzaf_6575135677470977495.plus.aac.p.m4a",
        "releaseDate": "2023-10-19",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "kcTV3G-Wi34"
    },
    {
        "id": "track-1712662870-1712663155",
        "title": "Glimpse of Harold Das",
        "artist": "Anirudh Ravichander",
        "album": "Leo",
        "duration": "0:43",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a4/88/d5/a488d575-b1dc-e748-6b37-f8480120473d/mzaf_11530483767581616905.plus.aac.p.m4a",
        "releaseDate": "2023-10-19",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "H2YXo9L6l-s"
    },
    {
        "id": "track-1712662870-1712663156",
        "title": "Badass",
        "artist": "Anirudh Ravichander",
        "album": "Leo",
        "duration": "3:50",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/18/43/da/1843dab2-02e7-153a-7652-5a19b59717c8/00602527660813.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/0f/a7/01/0fa70190-b792-72e9-0f67-3c73d37473e0/mzaf_16782896223114459000.plus.aac.p.m4a",
        "releaseDate": "2023-10-19",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "IqwIOlhfCak"
    },
    {
        "id": "track-1712662870-1712663157",
        "title": "Lokiverse 2.0",
        "artist": "Anirudh Ravichander",
        "album": "Leo",
        "duration": "1:54",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/a8/70/13a87001-28ba-1bc7-0ca6-52cf10dd6f52/196871556415.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/28/8c/61/288c6104-0d07-8801-b366-1eb12d8f0c39/mzaf_3305015795576215988.plus.aac.p.m4a",
        "releaseDate": "2023-10-19",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "QuIR-9RNYbA"
    },
    {
        "id": "track-1699735063-1699735311",
        "title": "Kaavaalaa",
        "artist": "Anirudh Ravichander, Shilpa Rao & Arunraja Kamaraj",
        "album": "Jailer",
        "duration": "3:11",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a5/17/86/a517861e-ea79-edaa-0b43-82c9e75c0beb/mzaf_16913299593822611847.plus.aac.p.m4a",
        "releaseDate": "2023-07-28",
        "hero": "Rajinikanth",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "F05tvfWHU_8"
    },
    {
        "id": "track-1699735063-1699735313",
        "title": "Jailer Theme (Instrumental)",
        "artist": "Anirudh Ravichander",
        "album": "Jailer",
        "duration": "1:02",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/38/ec/a3/38eca355-bb25-1aea-06d9-20fe0a9aaa71/mzaf_9492074424387111258.plus.aac.p.m4a",
        "releaseDate": "2023-07-28",
        "hero": "Rajinikanth",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "oEzoYVJrmjQ"
    },
    {
        "id": "track-1699735063-1699735322",
        "title": "Rathamaarey",
        "artist": "Vishal Mishra, Anirudh Ravichander & Vignesh Shivan",
        "album": "Jailer",
        "duration": "4:12",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f0/bf/09/f0bf095a-f08a-b65a-275b-d6d66fb7367e/mzaf_15048535950435044120.plus.aac.p.m4a",
        "releaseDate": "2023-07-28",
        "hero": "Rajinikanth",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "m_gdEzlxKsg"
    },
    {
        "id": "track-1699735063-1699735324",
        "title": "Muthuvel Pandian Theme (Instrumental)",
        "artist": "Anirudh Ravichander",
        "album": "Jailer",
        "duration": "1:43",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/7c/09/317c09c3-f739-e348-884e-56f8aa012a04/197189667435.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/14/62/9d/14629db7-db62-1523-781b-31613dcdd8e7/mzaf_7803448372819491051.plus.aac.p.m4a",
        "releaseDate": "2023-07-28",
        "hero": "Rajinikanth",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "DObwdl3xB7U"
    },
    {
        "id": "track-1699735063-1699735327",
        "title": "Hukum - Thalaivar Alappara",
        "artist": "Anirudh Ravichander & Super Subu",
        "album": "Jailer",
        "duration": "3:28",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/29/10/dc/2910dce9-8973-7957-6a39-e8afc074aa55/197189422959.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/20/4b/a5/204ba5f1-aa95-9204-049a-3af28613dfdb/mzaf_9848955577816183835.plus.aac.p.m4a",
        "releaseDate": "2023-07-28",
        "hero": "Rajinikanth",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "DsjRNPrvq6U"
    },
    {
        "id": "track-1699735063-1699735333",
        "title": "Jailer Drill Theme (Instrumental)",
        "artist": "Anirudh Ravichander",
        "album": "Jailer",
        "duration": "0:43",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/cf/64/36/cf643626-b3e6-625e-31f0-20f3d881cd8b/mzaf_7558993224889966168.plus.aac.p.m4a",
        "releaseDate": "2023-07-28",
        "hero": "Rajinikanth",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "tN7w-E2dQH0"
    },
    {
        "id": "track-1699735063-1699735637",
        "title": "Jujubee",
        "artist": "Anirudh Ravichander, Dhee, Anantha Krishnan & Super Subu",
        "album": "Jailer",
        "duration": "2:47",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a9/53/0f/a9530f44-e109-cf69-0227-a2756c69ba7a/mzaf_8956907827402640418.plus.aac.p.m4a",
        "releaseDate": "2023-07-28",
        "hero": "Rajinikanth",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "XZnuFdUPIzE"
    },
    {
        "id": "track-1699735063-1699735641",
        "title": "Alappara Theme (Instrumental)",
        "artist": "Anirudh Ravichander",
        "album": "Jailer",
        "duration": "1:18",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e9/4f/eb/e94feba7-c105-e355-91a0-27ef50480cba/mzaf_4136692692767603458.plus.aac.p.m4a",
        "releaseDate": "2023-07-28",
        "hero": "Rajinikanth",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "UBIA4p_Sgqk"
    },
    {
        "id": "track-1624359269-1624359271",
        "title": "Pathala Pathala",
        "artist": "Anirudh Ravichander & Kamal Haasan",
        "album": "Vikram",
        "duration": "3:31",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/41/41/01/41410135-baa0-1aab-7417-f6746b0f3c25/196589186973.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/cc/b5/32/ccb532ab-45b7-5d5e-57e2-5a6766168995/mzaf_16484853298794497747.plus.aac.p.m4a",
        "releaseDate": "2022-05-15",
        "hero": "Kamal Haasan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "9VpeTiz81gc"
    },
    {
        "id": "track-1624359269-1624359275",
        "title": "Vikram (Title Track)",
        "artist": "Anirudh Ravichander",
        "album": "Vikram",
        "duration": "3:39",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/05/b5/b7/05b5b7cd-e108-dd27-a25e-f4685d3e5f8b/196589228666.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/bd/00/c6/bd00c6ba-8355-cf83-b9f4-937c2f51287b/mzaf_3284693060032213775.plus.aac.p.m4a",
        "releaseDate": "2022-05-15",
        "hero": "Kamal Haasan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "ofdqpkGuqTQ"
    },
    {
        "id": "track-1624359269-1624359426",
        "title": "Wasted",
        "artist": "Anirudh Ravichander",
        "album": "Vikram",
        "duration": "3:03",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/41/41/01/41410135-baa0-1aab-7417-f6746b0f3c25/196589186973.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/43/5a/43/435a43cf-d979-5929-a8e7-1eec1630b3ee/mzaf_347003747036672526.plus.aac.p.m4a",
        "releaseDate": "2022-05-15",
        "hero": "Kamal Haasan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "y3tfpBxoci4"
    },
    {
        "id": "track-1624359269-1624359429",
        "title": "Porkanda Singam",
        "artist": "Anirudh Ravichander & Ravi G",
        "album": "Vikram",
        "duration": "3:18",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/41/41/01/41410135-baa0-1aab-7417-f6746b0f3c25/196589186973.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/eb/20/57/eb2057de-c268-9860-899c-526907f313f3/mzaf_13505411715858287175.plus.aac.p.m4a",
        "releaseDate": "2022-05-15",
        "hero": "Kamal Haasan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "3EBs73y5iik"
    },
    {
        "id": "track-1624359269-1624359430",
        "title": "Once Upon a Time",
        "artist": "Anirudh Ravichander",
        "album": "Vikram",
        "duration": "2:24",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/05/b5/b7/05b5b7cd-e108-dd27-a25e-f4685d3e5f8b/196589228666.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/96/87/96/96879643-fa98-0abe-535c-854f202983e2/mzaf_9022531828568142342.plus.aac.p.m4a",
        "releaseDate": "2022-05-15",
        "hero": "Kamal Haasan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "Wu89nSOBf3I"
    },
    {
        "id": "track-1502968254-1502968258",
        "title": "Vaathi Coming",
        "artist": "Anirudh Ravichander & Gana Balachandar",
        "album": "Master",
        "duration": "3:48",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/20/da/f1/20daf12c-4e8f-bc03-d548-c4968cb405fd/mzaf_11939350127905472767.plus.aac.p.m4a",
        "releaseDate": "2020-03-16",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "vxzfsBDx590"
    },
    {
        "id": "track-1502968254-1502968259",
        "title": "Andha Kanna Paathaakaa",
        "artist": "Anirudh Ravichander & Yuvan Shankar Raja",
        "album": "Master",
        "duration": "3:15",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3d/b4/a3/3db4a362-edb2-11f5-79e7-c77303a5470c/mzaf_4654734155765264865.plus.aac.p.m4a",
        "releaseDate": "2020-03-16",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "3hVc3M1IEe0"
    },
    {
        "id": "track-1502968254-1502968260",
        "title": "Kutti Story",
        "artist": "Anirudh Ravichander & Vijay",
        "album": "Master",
        "duration": "5:01",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/49/3b/59/493b59d4-4fcc-2f17-f062-cac1de9b343b/mzaf_753420892877711101.plus.aac.p.m4a",
        "releaseDate": "2020-03-16",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "gjnrtCKZqYg"
    },
    {
        "id": "track-1502968254-1502968261",
        "title": "Quit Pannuda",
        "artist": "Anirudh Ravichander",
        "album": "Master",
        "duration": "4:17",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/3d/ee/a2/3deea2fd-d7ae-2874-3977-62d0b630acf4/mzaf_18322470638374828451.plus.aac.p.m4a",
        "releaseDate": "2020-03-16",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "fccXKFiXEGU"
    },
    {
        "id": "track-1502968254-1502968262",
        "title": "Beat of Master (Instrumental)",
        "artist": "Anirudh Ravichander",
        "album": "Master",
        "duration": "1:16",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/4c/68/77/4c6877fa-9fe9-0f99-8e4a-7605823563d5/886449014118.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/06/76/10/0676103d-b04e-ac7c-e863-b6e52676485b/mzaf_10111558585245341297.plus.aac.p.m4a",
        "releaseDate": "2020-03-16",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "Ue38w3CZTOw"
    },
    {
        "id": "track-1502968254-1502968263",
        "title": "Polakattum Para Para",
        "artist": "Anirudh Ravichander & Santhosh Narayanan",
        "album": "Master",
        "duration": "3:34",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/9f/47/71/9f47713a-c6c2-4a21-730f-e1aa456f6d38/mzaf_2651589219867107619.plus.aac.p.m4a",
        "releaseDate": "2020-03-16",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "dZN4TD9Ane0"
    },
    {
        "id": "track-1502968254-1502968264",
        "title": "Pona Pogattum",
        "artist": "Anirudh Ravichander & CB Vinith",
        "album": "Master",
        "duration": "1:37",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f8/1f/56/f81f56a4-649f-ef2b-bedd-0d81538d4553/mzaf_5316584740652432285.plus.aac.p.m4a",
        "releaseDate": "2020-03-16",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "b3Stbu-DZOs"
    },
    {
        "id": "track-1502968254-1502968658",
        "title": "Vaathi Raid",
        "artist": "Anirudh Ravichander & Arivu",
        "album": "Master",
        "duration": "3:30",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6a/c1/a9/6ac1a982-c0b6-a541-9ddb-b0b18e3527cb/mzaf_1681938382476126996.plus.aac.p.m4a",
        "releaseDate": "2020-03-16",
        "hero": "Thalapathy Vijay",
        "musicDirector": "Anirudh Ravichander",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "eHoIUNY-bG4"
    },
    {
        "id": "track-1619744666-1619744667",
        "title": "Dosti",
        "artist": "Hemachandra",
        "album": "RRR",
        "duration": "5:40",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/32/d3/0d/32d30d96-9cb2-807f-1b8d-69f7b77e4130/8903431821751_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/31/d3/36/31d336d4-267e-67c5-c9e2-26da5706d795/mzaf_14481367183486700565.plus.aac.p.m4a",
        "releaseDate": "2022-04-16",
        "hero": "Ram Charan",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "8zxRrPWLBy8"
    },
    {
        "id": "track-1619744666-1619744668",
        "title": "Naatu Naatu",
        "artist": "Rahul Sipligunj & Kaala Bhairava",
        "album": "RRR",
        "duration": "3:34",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/39/14/dd3914e5-a2f3-b355-51f3-9a1f0e3ca246/8903431853592_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1a/5a/0c/1a5a0c70-4986-61f0-b774-26370b41171a/mzaf_8557296633888508448.plus.aac.p.m4a",
        "releaseDate": "2022-04-16",
        "hero": "Ram Charan",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "UIOsRQaRIEY"
    },
    {
        "id": "track-1619744666-1619744669",
        "title": "Janani",
        "artist": "M.M. Keeravani",
        "album": "RRR",
        "duration": "3:08",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/84/1d/85/841d856e-df29-16f4-999a-b4f09ae8a940/mzaf_3598264920954124982.plus.aac.p.m4a",
        "releaseDate": "2022-04-16",
        "hero": "Ram Charan",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "I4tBs4xipw8"
    },
    {
        "id": "track-1619744666-1619744670",
        "title": "Komuram Bheemudo",
        "artist": "Kaala Bhairava",
        "album": "RRR",
        "duration": "4:14",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/87/cf/9b/87cf9b41-0a7c-259a-577c-e4f667331ce0/mzaf_8030023048569280419.plus.aac.p.m4a",
        "releaseDate": "2022-04-16",
        "hero": "Ram Charan",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "otcg1GoaAjo"
    },
    {
        "id": "track-1619744666-1619744671",
        "title": "Raamam Raaghavam",
        "artist": "Vijay Prakash, Chandana Bala Kalyan & Charu Hariharan",
        "album": "RRR",
        "duration": "3:51",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/f0/c2/8d/f0c28db8-5329-3dfa-3bdf-c1a6b0e472af/mzaf_9884835466944904144.plus.aac.p.m4a",
        "releaseDate": "2022-04-16",
        "hero": "Ram Charan",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "Cn-o7RzUPpU"
    },
    {
        "id": "track-1619744666-1619744673",
        "title": "Etthara Jenda",
        "artist": "Vishal Mishra, Prudhvi Chandra, M.M. Keeravani, Sahithi Chaganti & Harika Narayan",
        "album": "RRR",
        "duration": "4:22",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/4e/d8/9e/4ed89ef9-dcba-4203-b5ce-ace25917b6b9/mzaf_839214954436867470.plus.aac.p.m4a",
        "releaseDate": "2022-04-16",
        "hero": "Ram Charan",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "3aNBz9LEo7s"
    },
    {
        "id": "track-1619744666-1619744674",
        "title": "Komma Uyyala",
        "artist": "Prakruthi Reddy",
        "album": "RRR",
        "duration": "4:44",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/91/85/29/918529f8-5187-19c7-ac4f-983a9c7c5b78/8903431821683_cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d5/77/7b/d5777b90-c0f0-f740-7ff6-7001baa8d646/mzaf_4915994831793244142.plus.aac.p.m4a",
        "releaseDate": "2022-04-16",
        "hero": "Ram Charan",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "JYlabfvX-1c"
    },
    {
        "id": "track-1602184415-1602184663",
        "title": "Daakko Daakko Meka",
        "artist": "Sivam",
        "album": "Pushpa",
        "duration": "4:56",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ee/3d/5e/ee3d5e16-f727-9f76-a997-cd76d9e0cd6c/mzaf_15601020659961221889.plus.aac.p.m4a",
        "releaseDate": "2021-12-25",
        "hero": "Allu Arjun",
        "musicDirector": "Devi Sri Prasad",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Rainy",
        "youtubeId": "pc_784hcQxI"
    },
    {
        "id": "track-1602184415-1602184669",
        "title": "Srivalli",
        "artist": "Sid Sriram",
        "album": "Pushpa",
        "duration": "3:41",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9b/4a/e3/9b4ae3a2-43ee-dd7b-0474-3b7e914513cf/mzaf_10743675123561433132.plus.aac.p.m4a",
        "releaseDate": "2021-12-25",
        "hero": "Allu Arjun",
        "musicDirector": "Devi Sri Prasad",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Rainy",
        "youtubeId": "v2IGNN7CA4M"
    },
    {
        "id": "track-1602184415-1602184672",
        "title": "Oo Antava Oo Oo Antava",
        "artist": "Indravathi Chauhan",
        "album": "Pushpa",
        "duration": "3:43",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d5/f8/19/d5f8195c-8668-e1f3-fb59-77d8d35b1b53/mzaf_7616288806017835265.plus.aac.p.m4a",
        "releaseDate": "2021-12-25",
        "hero": "Allu Arjun",
        "musicDirector": "Devi Sri Prasad",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Rainy",
        "youtubeId": "EEqq0_Etuos"
    },
    {
        "id": "track-1602184415-1602184675",
        "title": "Saami Saami",
        "artist": "Mounika Yadav",
        "album": "Pushpa",
        "duration": "3:44",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/57/21/fe/5721febe-4410-e1f0-0148-bbca0c35a09f/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a4/b1/db/a4b1dbee-f8df-7ac0-1052-7beecf99b48f/mzaf_7723545249415774589.plus.aac.p.m4a",
        "releaseDate": "2021-12-25",
        "hero": "Allu Arjun",
        "musicDirector": "Devi Sri Prasad",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Rainy",
        "youtubeId": "RmR8eBzAN-c"
    },
    {
        "id": "track-1602184415-1602184676",
        "title": "Eyy Bidda Idhi Naa Adda",
        "artist": "Nakash Aziz",
        "album": "Pushpa",
        "duration": "3:54",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ba/61/74/ba617477-430c-ee84-2d6f-643c42c22615/mzaf_17426071842143680127.plus.aac.p.m4a",
        "releaseDate": "2021-12-25",
        "hero": "Allu Arjun",
        "musicDirector": "Devi Sri Prasad",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Rainy",
        "youtubeId": "jGetqo_SC9U"
    },
    {
        "id": "track-1495371405-1495371407",
        "title": "Samajavaragamana",
        "artist": "Sid Sriram",
        "album": "Ala Vaikunthapurramuloo",
        "duration": "3:40",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/53/98/c1/5398c1cf-7c16-24a6-bfa3-391dc6015376/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/94/15/98/941598ae-7248-357a-1e07-be7d50ea7b08/mzaf_11251795343892643096.plus.aac.p.m4a",
        "releaseDate": "2020-01-17",
        "hero": "Allu Arjun",
        "musicDirector": "Thaman S",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "ybBg6V6ZErc"
    },
    {
        "id": "track-1495371405-1495372344",
        "title": "Ramuloo Ramulaa",
        "artist": "Anurag Kulkarni & Mangli",
        "album": "Ala Vaikunthapurramuloo",
        "duration": "4:06",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/4d/7c/4a/4d7c4a33-0c3b-b0e5-1e5a-8182d9a25811/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e9/e9/fe/e9e9fe96-1e92-5be7-c86e-860ed15e4eda/mzaf_18220541675883973002.plus.aac.p.m4a",
        "releaseDate": "2020-01-17",
        "hero": "Allu Arjun",
        "musicDirector": "Thaman S",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "eDH_mMxRKFA"
    },
    {
        "id": "track-1495371405-1495372461",
        "title": "OMG Daddy",
        "artist": "Roll Rida, Rahul Nambiar & Lady Kash",
        "album": "Ala Vaikunthapurramuloo",
        "duration": "3:48",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/46/14/df/4614df1c-3f61-6bf5-5c3e-ee304895cfca/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e7/68/25/e768251f-9125-34fb-e1d5-da400e92390f/mzaf_6969240851358373753.plus.aac.p.m4a",
        "releaseDate": "2020-01-17",
        "hero": "Allu Arjun",
        "musicDirector": "Thaman S",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "JnxokaXq6TM"
    },
    {
        "id": "track-1495371405-1495372469",
        "title": "Buttabomma",
        "artist": "Armaan Malik",
        "album": "Ala Vaikunthapurramuloo",
        "duration": "3:19",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3a/8c/55/3a8c550b-e703-bba3-f476-44d195e4a742/mzaf_17453075177753173991.plus.aac.p.m4a",
        "releaseDate": "2020-01-17",
        "hero": "Allu Arjun",
        "musicDirector": "Thaman S",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "6DR5HU6kcbU"
    },
    {
        "id": "track-1495371405-1495372470",
        "title": "Samajavaragamana (Female Version)",
        "artist": "Shreya Ghoshal",
        "album": "Ala Vaikunthapurramuloo",
        "duration": "4:01",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/46/14/df/4614df1c-3f61-6bf5-5c3e-ee304895cfca/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/b5/7a/9d/b57a9d89-d4ff-af0e-267e-b128fedada23/mzaf_5500958006095919309.plus.aac.p.m4a",
        "releaseDate": "2020-01-17",
        "hero": "Allu Arjun",
        "musicDirector": "Thaman S",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "guj4nJFvLo4"
    },
    {
        "id": "track-1495371405-1495372474",
        "title": "Ala Vaikunthapurramuloo",
        "artist": "Sri Krishna & Priya Sisters",
        "album": "Ala Vaikunthapurramuloo",
        "duration": "3:20",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/46/14/df/4614df1c-3f61-6bf5-5c3e-ee304895cfca/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b7/f0/2c/b7f02c10-d2db-e1ee-65c0-a4c094ad5cb8/mzaf_10942902384678461937.plus.aac.p.m4a",
        "releaseDate": "2020-01-17",
        "hero": "Allu Arjun",
        "musicDirector": "Thaman S",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "ShlmWOoq1to"
    },
    {
        "id": "track-1495371405-1495372475",
        "title": "Sittharala Sirapadu",
        "artist": "Sooranna & Saketh Komanduri",
        "album": "Ala Vaikunthapurramuloo",
        "duration": "3:10",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/94/b5/51/94b551b2-036f-4d49-cf7b-9a2cd9056ef8/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/79/5e/12/795e121d-d0b4-9259-b92b-50b338864ff5/mzaf_2519467625571119182.plus.aac.p.m4a",
        "releaseDate": "2020-01-17",
        "hero": "Allu Arjun",
        "musicDirector": "Thaman S",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "fRBVe7b1_ac"
    },
    {
        "id": "track-1646468760-1646468764",
        "title": "Punnara Kanavine",
        "artist": "M.M. Keeravani, Geetha Madhuri & Mankombu Gopalakrishnan",
        "album": "Baahubali",
        "duration": "1:40",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/a6/90/ab/a690abdd-9f43-077d-a8f2-e2976e66a400/mzaf_7712107098681618056.plus.aac.p.m4a",
        "releaseDate": "2015-01-01",
        "hero": "Prabhas",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "UdXFtFb3ork"
    },
    {
        "id": "track-1646468760-1646468767",
        "title": "Aarivan Aarivan",
        "artist": "Vaikom Vijayalakshmi & Mankombu Gopalakrishnan",
        "album": "Baahubali",
        "duration": "3:17",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/c1/b8/61/c1b86116-b9c5-5477-d100-ba2a4601c9e0/mzaf_11006816863369648464.plus.aac.p.m4a",
        "releaseDate": "2015-01-01",
        "hero": "Prabhas",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "A_DgQicp-aE"
    },
    {
        "id": "track-1646468760-1646468769",
        "title": "Njan Chendena",
        "artist": "Vijay Yesudas, Swetha Mohan & Mankombu Gopalakrishnan",
        "album": "Baahubali",
        "duration": "5:30",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/da/c0/05/dac005ca-7c10-e8cd-d611-8242985df334/mzaf_15395291097591609757.plus.aac.p.m4a",
        "releaseDate": "2015-01-01",
        "hero": "Prabhas",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "aSMT7c7Q3Rc"
    },
    {
        "id": "track-1646468760-1646468771",
        "title": "Pacha Theeyanu Nee",
        "artist": "Vijay Yesudas, Swetha Mohan & Mankombu Gopalakrishnan",
        "album": "Baahubali",
        "duration": "3:01",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/4e/f6/cd/4ef6cd78-9c8d-f2f7-e26e-6eac63765bfa/mzaf_55709590809460099.plus.aac.p.m4a",
        "releaseDate": "2015-01-01",
        "hero": "Prabhas",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "N71fNkR9WBI"
    },
    {
        "id": "track-1646468760-1646468772",
        "title": "Theekkanal Swasamai",
        "artist": "Sachin Warrier & Mankombu Gopalakrishnan",
        "album": "Baahubali",
        "duration": "3:10",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/e1/5f/ba/e15fba66-864e-5c47-9acb-72d74bb97703/mzaf_2235031554594959283.plus.aac.p.m4a",
        "releaseDate": "2015-01-01",
        "hero": "Prabhas",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "qLuXIrnfrGw"
    },
    {
        "id": "track-1646468760-1646468773",
        "title": "Irul Thingum Vaanil",
        "artist": "Yamini & Mankombu Gopalakrishnan",
        "album": "Baahubali",
        "duration": "3:48",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/e1/fb/24/e1fb245a-7d27-6505-10c3-3693bbf307d9/8905778095697.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/6c/1f/94/6c1f94ef-f349-c236-7773-ff531e662596/mzaf_5279803661221780717.plus.aac.p.m4a",
        "releaseDate": "2015-01-01",
        "hero": "Prabhas",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "mfFDC6MAezc"
    },
    {
        "id": "track-1646468760-1646468774",
        "title": "Manohari",
        "artist": "Vijay Yesudas, Sayanora & Mankombu Gopalakrishnan",
        "album": "Baahubali",
        "duration": "3:37",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/1a/8e/da/1a8edac5-80a7-22aa-c014-f4f1a0190f7a/8905750011301.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/d5/ee/2e/d5ee2eea-e3c0-b477-4034-0b7f598ff15f/mzaf_8644753650862182981.plus.aac.p.m4a",
        "releaseDate": "2015-01-01",
        "hero": "Prabhas",
        "musicDirector": "M. M. Keeravani",
        "region": "Tollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "el3i9_xGEYw"
    },
    {
        "id": "track-1705952061-1705952062",
        "title": "Zinda Banda",
        "artist": "Anirudh Ravichander & Irshad Kamil",
        "album": "Jawan",
        "duration": "4:24",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/03/4f/d9/034fd992-0a8f-36b3-b67d-d68f9b2c5ebb/mzaf_3346215737863633274.plus.aac.p.m4a",
        "releaseDate": "2023-09-05",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "nuaxkTOSPX8"
    },
    {
        "id": "track-1705952061-1705952066",
        "title": "Chaleya",
        "artist": "Anirudh Ravichander, Arijit Singh, Shilpa Rao & Kumaar",
        "album": "Jawan",
        "duration": "3:20",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/87/61/a9/8761a939-8e1c-678e-b186-09401480b314/mzaf_2211340113577128300.plus.aac.p.m4a",
        "releaseDate": "2023-09-05",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "F_jU1KI82kw"
    },
    {
        "id": "track-1705952061-1705952067",
        "title": "Not Ramaiya Vastavaiya",
        "artist": "Anirudh Ravichander, Vishal Dadlani, Shilpa Rao & Kumaar",
        "album": "Jawan",
        "duration": "3:23",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/41/0a/95/410a958f-a064-f89a-ea7c-2cb5ec7dda62/mzaf_18398508884686891043.plus.aac.p.m4a",
        "releaseDate": "2023-09-05",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "Mec09_Q8zuo"
    },
    {
        "id": "track-1705952061-1705952068",
        "title": "Aararaari Raaro",
        "artist": "Anirudh Ravichander, Deepthi Suresh & Irshad Kamil",
        "album": "Jawan",
        "duration": "4:38",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/62/81/4a/62814a94-b1b2-88f4-d8ed-5d03c8ef9d18/mzaf_14088985558322708912.plus.aac.p.m4a",
        "releaseDate": "2023-09-05",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "5-aaicQENC0"
    },
    {
        "id": "track-1705952061-1705952069",
        "title": "Jawan Title Track",
        "artist": "Anirudh Ravichander & Raja Kumari",
        "album": "Jawan",
        "duration": "3:08",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/8f/24/0e/8f240eb2-6e5d-e974-cb7b-bf95ce4b6ddc/mzaf_7953783435173242853.plus.aac.p.m4a",
        "releaseDate": "2023-09-05",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "EiScA8DlzLA"
    },
    {
        "id": "track-1705952061-1705952070",
        "title": "Faraatta",
        "artist": "Anirudh Ravichander, Arijit Singh, Jonita Gandhi & Badshah",
        "album": "Jawan",
        "duration": "3:15",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/91/94/27/919427e2-3d95-f60c-81c8-ea8da231cd7f/mzaf_1238341346337365771.plus.aac.p.m4a",
        "releaseDate": "2023-09-05",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "EjwEzMZSFfg"
    },
    {
        "id": "track-1705952061-1705952071",
        "title": "Chaleya Arabic Version",
        "artist": "Grini, Jamila El Badaoui & Kumaar",
        "album": "Jawan",
        "duration": "3:20",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/7a/32/447a3258-29cc-8766-6963-b4de6cb83941/mzaf_14583345152464516832.plus.aac.p.m4a",
        "releaseDate": "2023-09-05",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Anirudh Ravichander",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "FNoNmaWGoRg"
    },
    {
        "id": "track-1659644976-1659644977",
        "title": "Besharam Rang",
        "artist": "Vishal & Shekhar, Shilpa Rao, Caralisa Monteiro, Vishal Dadlani & Shekhar Ravjiani",
        "album": "Pathaan",
        "duration": "4:18",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/6a/19/8d6a197e-2aaa-5504-cd43-533351597487/Pathaan-Album-Audio-Cover-Final.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f8/d5/fb/f8d5fb8e-ea86-4d56-32d4-28912d4623b9/mzaf_7899315727013580274.plus.aac.p.m4a",
        "releaseDate": "2022-12-22",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Vishal-Shekhar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "huxhqphtDrM"
    },
    {
        "id": "track-1659644976-1659644978",
        "title": "Jhoome Jo Pathaan",
        "artist": "Vishal & Shekhar, Arijit Singh, Sukriti Kakar, Vishal Dadlani & Shekhar Ravjiani",
        "album": "Pathaan",
        "duration": "3:28",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/6a/19/8d6a197e-2aaa-5504-cd43-533351597487/Pathaan-Album-Audio-Cover-Final.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/be/80/45/be8045ce-1ce5-b099-fc9d-7141b1d3d6f2/mzaf_10087280935419764280.plus.aac.p.m4a",
        "releaseDate": "2022-12-22",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Vishal-Shekhar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "YxWlaYCA8MU"
    },
    {
        "id": "track-1659644976-1659644979",
        "title": "Pathaan’s Theme",
        "artist": "Sanchit Balhara & Ankit Balhara",
        "album": "Pathaan",
        "duration": "2:37",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/6a/19/8d6a197e-2aaa-5504-cd43-533351597487/Pathaan-Album-Audio-Cover-Final.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/13/53/3a/13533a0a-d41f-07bc-2b85-b38a03aa333b/mzaf_9165774094447415228.plus.aac.p.m4a",
        "releaseDate": "2022-12-22",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Vishal-Shekhar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "sM9Uqtia-Lo"
    },
    {
        "id": "track-1659644976-1659644980",
        "title": "Jim’s Theme",
        "artist": "Sanchit Balhara & Ankit Balhara",
        "album": "Pathaan",
        "duration": "1:13",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/6a/19/8d6a197e-2aaa-5504-cd43-533351597487/Pathaan-Album-Audio-Cover-Final.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/0f/3e/fa/0f3efa0a-2647-7eab-bda8-177815794cb4/mzaf_3187831891662381354.plus.aac.p.m4a",
        "releaseDate": "2022-12-22",
        "hero": "Shah Rukh Khan",
        "musicDirector": "Vishal-Shekhar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "QzZLiknSbdk"
    },
    {
        "id": "track-1718278225-1718278228",
        "title": "Arjan Vailly",
        "artist": "Manan Bhardwaj & Bhupinder Babbal",
        "album": "Animal",
        "duration": "3:02",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/9a/5e/fb/9a5efbfe-acc0-7c67-9822-f1d2329afd81/mzaf_16133465960418766734.plus.aac.p.m4a",
        "releaseDate": "2023-11-24",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Harshavardhan Rameshwar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "0hYehuznQac"
    },
    {
        "id": "track-1718278225-1718278230",
        "title": "Hua Main",
        "artist": "Raghav Chaitanya, Manoj Muntashir & Pritam",
        "album": "Animal",
        "duration": "4:37",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/1d/84/89/1d8489af-ee84-1bf8-c564-a3a533734788/mzaf_8843773717280034374.plus.aac.p.m4a",
        "releaseDate": "2023-11-24",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Harshavardhan Rameshwar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "KNXYonYD59w"
    },
    {
        "id": "track-1718278225-1718278231",
        "title": "Satranga",
        "artist": "Arijit Singh, Shreyas Puranik & Siddharth-Garima",
        "album": "Animal",
        "duration": "4:31",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/0c/ba/5b/0cba5beb-c6a2-21e6-2278-936507106c56/mzaf_979325145993892341.plus.aac.p.m4a",
        "releaseDate": "2023-11-24",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Harshavardhan Rameshwar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "_Wv2iV8b0hA"
    },
    {
        "id": "track-1718278225-1718278233",
        "title": "Papa Meri Jaan",
        "artist": "Sonu Nigam, Harshavardhan Rameshwar & Raj Shekhar",
        "album": "Animal",
        "duration": "5:22",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/53/62/4b/53624b6d-67c0-4b3f-b54b-14f667bbb426/mzaf_2150450917097764001.plus.aac.p.m4a",
        "releaseDate": "2023-11-24",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Harshavardhan Rameshwar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "qXtgGCE0Doo"
    },
    {
        "id": "track-1718278225-1718278234",
        "title": "Pehle Bhi Main",
        "artist": "Vishal Mishra & Raj Shekhar",
        "album": "Animal",
        "duration": "4:10",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a5/f7/e6/a5f7e693-dee6-cd9c-2314-6e6c16a7cbb4/mzaf_9453084408617653215.plus.aac.p.m4a",
        "releaseDate": "2023-11-24",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Harshavardhan Rameshwar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "QKMTreKTpug"
    },
    {
        "id": "track-1718278225-1718278236",
        "title": "Kashmir",
        "artist": "Manan Bhardwaj & Shreya Ghoshal",
        "album": "Animal",
        "duration": "3:36",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/00/b0/81/00b08118-c997-8490-d692-00d46af445f5/mzaf_16525361741956194140.plus.aac.p.m4a",
        "releaseDate": "2023-11-24",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Harshavardhan Rameshwar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "xJC_BMNUDKY"
    },
    {
        "id": "track-1718278225-1718278238",
        "title": "Saari Duniya Jalaa Denge",
        "artist": "Jaani & B. Praak",
        "album": "Animal",
        "duration": "3:02",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/9d/6d/57/9d6d578c-0948-d839-ccc2-62f46d030381/mzaf_2753566233990789221.plus.aac.p.m4a",
        "releaseDate": "2023-11-24",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Harshavardhan Rameshwar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "y5XoL2aTgVY"
    },
    {
        "id": "track-1718278225-1718278239",
        "title": "Haiwaan",
        "artist": "Ashim Kemson",
        "album": "Animal",
        "duration": "2:43",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/29/d6/c9/29d6c9b3-feef-5231-7620-f4cb82ea7845/mzaf_5308289540043351421.plus.aac.p.m4a",
        "releaseDate": "2023-11-24",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Harshavardhan Rameshwar",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Stormy",
        "youtubeId": "ti1L-qEB7EU"
    },
    {
        "id": "track-1648663561-1648663570",
        "title": "Kesariya",
        "artist": "Pritam, Arijit Singh & Amitabh Bhattacharya",
        "album": "Brahmastra",
        "duration": "4:28",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4c/5c/384c5c8f-3ff8-e457-b2f7-3158ce108649/mzaf_12389299033886433185.plus.aac.p.m4a",
        "releaseDate": "2022-10-06",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Pritam",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "6RdS6wLu7RY"
    },
    {
        "id": "track-1648663561-1648663668",
        "title": "Deva Deva",
        "artist": "Pritam, Arijit Singh, Amitabh Bhattacharya & Jonita Gandhi",
        "album": "Brahmastra",
        "duration": "4:39",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/68/72/f9/6872f95d-9c56-beb8-2768-a5c07c304ee6/196589383044.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/24/61/2a/24612a7d-c42b-90a5-c980-07f4db2eee6f/mzaf_4575238190575326306.plus.aac.p.m4a",
        "releaseDate": "2022-10-06",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Pritam",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "mNuhKUOD_A0"
    },
    {
        "id": "track-1648663561-1648663673",
        "title": "Dance Ka Bhoot",
        "artist": "Pritam, Arijit Singh & Amitabh Bhattacharya",
        "album": "Brahmastra",
        "duration": "4:06",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/dd/66/30/dd663098-258e-aea5-7bfa-706cf4874fb1/mzaf_1882567308029774756.plus.aac.p.m4a",
        "releaseDate": "2022-10-06",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Pritam",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "mbN9MHQ0ZTU"
    },
    {
        "id": "track-1648663561-1648663684",
        "title": "Rasiya",
        "artist": "Pritam, Shreya Ghoshal & Tushar Joshi",
        "album": "Brahmastra",
        "duration": "4:25",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/c1/fc/e6/c1fce60c-c1f6-4904-6d61-02bb3ed0cfbd/196589505897.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c5/bd/4f/c5bd4f17-23ff-e2af-ccd0-b976985151a6/mzaf_6244821523021066334.plus.aac.p.m4a",
        "releaseDate": "2022-10-06",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Pritam",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "sAwisCxcLII"
    },
    {
        "id": "track-1648663561-1648663687",
        "title": "Shiva Theme",
        "artist": "Pritam & Javed Ali",
        "album": "Brahmastra",
        "duration": "3:12",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/ba/52/f9/ba52f9ad-5622-927a-b619-d6fde74217d8/mzaf_1200457286329225565.plus.aac.p.m4a",
        "releaseDate": "2022-10-06",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Pritam",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "ih-OMA94YsI"
    },
    {
        "id": "track-1648663561-1648663692",
        "title": "Kesariya (Dance Mix)",
        "artist": "Pritam, Shashwat Singh, Antara Mitra & Arijit Singh",
        "album": "Brahmastra",
        "duration": "3:17",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/d6/a3/37/d6a33794-e97a-02c7-dcba-d6311784d089/mzaf_11517579498077553635.plus.aac.p.m4a",
        "releaseDate": "2022-10-06",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Pritam",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "tk8ya-cJtrs"
    },
    {
        "id": "track-1648663561-1648663695",
        "title": "Deva Deva (Film Version)",
        "artist": "Pritam, Arijit Singh, Jonita Gandhi & Amitabh Bhattacharya",
        "album": "Brahmastra",
        "duration": "6:15",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ee/a4/bd/eea4bd64-25e9-c6d3-e462-b4dd14bf1cc9/mzaf_10548141603467789276.plus.aac.p.m4a",
        "releaseDate": "2022-10-06",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Pritam",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "mNuhKUOD_A0"
    },
    {
        "id": "track-1648663561-1648663849",
        "title": "Rasiya Reprise",
        "artist": "Pritam, Arijit Singh & Amitabh Bhattacharya",
        "album": "Brahmastra",
        "duration": "4:45",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/6a/2e/b6/6a2eb669-f6ad-4081-6785-816d59d6aa14/mzaf_10135248080157537022.plus.aac.p.m4a",
        "releaseDate": "2022-10-06",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Pritam",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "aDOs442shYU"
    },
    {
        "id": "track-1648663561-1648663852",
        "title": "Dev Theme",
        "artist": "Pritam & SlowCheeta",
        "album": "Brahmastra",
        "duration": "2:55",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/01/ef/35/01ef35ac-c046-656c-638f-928c4af51c8d/196589554871.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/4f/32/b2/4f32b213-e362-e079-03d0-fcd98545fba3/mzaf_12171194655222391459.plus.aac.p.m4a",
        "releaseDate": "2022-10-06",
        "hero": "Ranbir Kapoor",
        "musicDirector": "Pritam",
        "region": "Bollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "7o2PupZlihk"
    },
    {
        "id": "track-1499385848-1499385854",
        "title": "Alone Again",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "4:10",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/bc/67/9a/bc679ad2-1e1f-8768-2ed6-50cd25096531/mzaf_4457989875337295486.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "JH398xAYpZA"
    },
    {
        "id": "track-1499385848-1499385861",
        "title": "Too Late",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "3:60",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/54/2b/61/542b6133-80f7-f30f-4dcf-059490db9d84/mzaf_1539067797902127760.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "nl71vFvVOvw"
    },
    {
        "id": "track-1499385848-1499386245",
        "title": "Hardest To Love",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "3:31",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f1/83/cb/f183cb55-0586-c9f2-ed5e-103a1dc83c03/mzaf_7367814591140676657.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "pM3nIOYF2W8"
    },
    {
        "id": "track-1499385848-1499386246",
        "title": "Scared To Live",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "3:11",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bd/ba/ba/bdbaba61-8bd8-bbc0-cb67-73e73fe22429/mzaf_9720338300772659484.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "MzsU_sn2aIE"
    },
    {
        "id": "track-1499385848-1499386249",
        "title": "Snowchild",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "4:07",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/aa/85/2a/aa852ac5-f684-060a-c100-b2da788fa387/mzaf_4478943145367619854.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "UxPEFFHA4xw"
    },
    {
        "id": "track-1499385848-1499386250",
        "title": "Escape From LA",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "5:56",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/69/28/a5/6928a520-80d3-ecb4-5c72-1e373ca540f5/mzaf_15084501451763266737.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "vsARlcGW0jE"
    },
    {
        "id": "track-1499385848-1499386253",
        "title": "Heartless",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "3:18",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/70/14/79/701479a4-bdb2-f415-ff6a-b3233d26f733/mzaf_13658083032622956283.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "-uj9b9JCIJM"
    },
    {
        "id": "track-1499385848-1499386254",
        "title": "Faith",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "4:43",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/73/7d/78/737d783c-0bac-0085-f906-2c0473ca2a4a/mzaf_15287998063671981131.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "io4Vw5oT18k"
    },
    {
        "id": "track-1499385848-1499386265",
        "title": "Blinding Lights",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "3:20",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/b4/8f/17b48f9a-0b93-6bb8-fe1d-3a16623c2cfb/mzaf_9560252727299052414.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "ygTZZpVkmKg"
    },
    {
        "id": "track-1499385848-1499386363",
        "title": "In Your Eyes",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "3:58",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c4/f8/f2/c4f8f2e2-9db0-093d-c03b-bfa6cbf663cb/mzaf_3724293200696761935.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "E3QiD99jPAg"
    },
    {
        "id": "track-1499385848-1499386369",
        "title": "Save Your Tears",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "3:36",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8b/38/17/8b3817e4-c0e9-7e02-2654-3e2ecee93603/mzaf_18415642125637540903.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "u6lihZAcy4s"
    },
    {
        "id": "track-1499385848-1499386370",
        "title": "Repeat After Me (Interlude)",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "3:16",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/03/90/4a/03904a54-f875-d32c-c903-55637af8e5d8/mzaf_2629748706143420510.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "CE-Iy24NOTY"
    },
    {
        "id": "track-1499385848-1499386375",
        "title": "After Hours",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "6:01",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/54/2b/61/542b6133-80f7-f30f-4dcf-059490db9d84/mzaf_1539067797902127760.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "ea94GGHolFw"
    },
    {
        "id": "track-1499385848-1499386377",
        "title": "Until I Bleed Out",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": "3:10",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/86/fa/f7/86faf792-9f23-62d0-cbf1-35866885836a/mzaf_7054857112750660382.plus.aac.p.m4a",
        "releaseDate": "2020-03-20",
        "hero": "The Weeknd",
        "musicDirector": "Max Martin",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "iv1_FOdJ5s0"
    },
    {
        "id": "track-1440870373-1440870375",
        "title": "Starboy (feat. Daft Punk)",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:50",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3f/a0/ba/3fa0ba5b-088d-bcf2-e4bd-355a5d505617/mzaf_3355567893400963384.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "Rif-RTvmmss"
    },
    {
        "id": "track-1440870373-1440870376",
        "title": "Party Monster",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "4:09",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5f/71/7e/5f717eb9-c108-9ce4-f04c-1296e9df07a3/mzaf_1303083752372375662.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "j9Hije4z6O4"
    },
    {
        "id": "track-1440870373-1440870377",
        "title": "False Alarm",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:40",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f2/99/f0/f299f007-3672-041c-e867-8d9f093ab3a1/mzaf_12467640334277287816.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "7uf8xkknCxQ"
    },
    {
        "id": "track-1440870373-1440870378",
        "title": "Reminder",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:39",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9d/d9/54/9dd954c5-3ebb-0a65-25cb-e7a86d7433ec/mzaf_12143387869769563633.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "GWZ6aoIVJaE"
    },
    {
        "id": "track-1440870373-1440870381",
        "title": "Rockin’",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:53",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c3/d1/0b/c3d10b91-04fe-d1eb-1d0e-1f8579effa70/mzaf_6402069205623891922.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "Nox2RGWOOdE"
    },
    {
        "id": "track-1440870373-1440870382",
        "title": "Secrets",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "4:26",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4e/e2/b5/4ee2b52d-2141-9b10-6e40-ec7e1211492a/mzaf_7805590205753451765.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "9KJAnjqBwLU"
    },
    {
        "id": "track-1440870373-1440870383",
        "title": "True Colors",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:26",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/28/0c/6c/280c6c37-d86f-ffd2-3e36-bfe7f83ca6ef/mzaf_10363707546003156487.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "VQ5XQYpx2mg"
    },
    {
        "id": "track-1440870373-1440870384",
        "title": "Stargirl Interlude (feat. Lana Del Rey)",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "1:52",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d0/92/31/d09231f8-f4e7-c24a-5cef-3217bf43d598/mzaf_11722271680889027848.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "TkxVOa6u59M"
    },
    {
        "id": "track-1440870373-1440870385",
        "title": "Sidewalks (feat. Kendrick Lamar)",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:51",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f0/f5/2b/f0f52bae-d937-a193-9904-73ff602825b0/mzaf_4222419723899107327.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "sK-T-cmznY8"
    },
    {
        "id": "track-1440870373-1440870386",
        "title": "Six Feet Under",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:58",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/53/6b/be/536bbead-e07a-15b4-775a-fab9947fd1b4/mzaf_4484537921441190023.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "Yu7kHJqKRW8"
    },
    {
        "id": "track-1440870373-1440870387",
        "title": "Love To Lay",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:43",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/57/1f/27/571f276b-1acd-bc3b-0c92-565156c5e0fe/mzaf_15798424358412022245.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "dB4YSEHG3ac"
    },
    {
        "id": "track-1440870373-1440870389",
        "title": "A Lonely Night",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:40",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8d/e0/84/8de0844c-f6d5-e64c-d23e-776f7ca27a98/mzaf_14775387389275369866.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "iBnLoAE9kUE"
    },
    {
        "id": "track-1440870373-1440870390",
        "title": "Attention",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:18",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b1/93/dd/b193dd5b-8ab9-df32-5169-98412651338e/mzaf_3524085931372730406.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "3tHuJAZpYNw"
    },
    {
        "id": "track-1440870373-1440870392",
        "title": "Ordinary Life",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:42",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/38/a9/d5/38a9d50f-6aa8-a74f-6058-0ffb6dc78710/mzaf_17743343636836437858.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "nIM4hkelWaU"
    },
    {
        "id": "track-1440870373-1440870393",
        "title": "Nothing Without You",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "3:19",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8a/c8/b3/8ac8b37e-22ab-4df8-297e-777bb228771b/mzaf_9492178177934893344.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "WFO7r3g-JBc"
    },
    {
        "id": "track-1440870373-1440870394",
        "title": "All I Know (feat. Future)",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "5:21",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/bf/34/4e/bf344e0c-a670-ca2c-95c0-c0aea078a642/mzaf_7444744443038872735.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "4iSEJB1KJ0w"
    },
    {
        "id": "track-1440870373-1440870395",
        "title": "Die For You",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "4:20",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/50/50/1a/50501a86-bd74-e90d-8a56-68c9b5e6e7d6/mzaf_4588197682084244913.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "2AH5l-vrY9Q"
    },
    {
        "id": "track-1440870373-1440870397",
        "title": "I Feel It Coming (feat. Daft Punk)",
        "artist": "The Weeknd",
        "album": "Starboy",
        "duration": "4:29",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/71/af/e0/71afe07f-aae7-c4f0-db02-c05be07591d2/mzaf_5960554915698764959.plus.aac.p.m4a",
        "releaseDate": "2016-11-25",
        "hero": "The Weeknd",
        "musicDirector": "Daft Punk",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "5v1TOFULOWA"
    },
    {
        "id": "track-1468058165-1468058169",
        "title": "I Forgot That You Existed",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "2:51",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/9c/e2/97/9ce2976a-b1c8-aa80-3e94-f4562cbad53e/mzaf_11906958635430192793.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "p1cEvNn88jM"
    },
    {
        "id": "track-1468058165-1468058171",
        "title": "Cruel Summer",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "2:58",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/af/81/44af8168-9609-1b85-5048-ada08dceacf3/mzaf_1341699644335558812.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "ic8j13piAhQ"
    },
    {
        "id": "track-1468058165-1468058173",
        "title": "Lover",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:41",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e0/db/47/e0db47b0-7f70-0631-0414-cd4777d2fb3e/mzaf_6362891154838442638.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "cvUAzpn48xA"
    },
    {
        "id": "track-1468058165-1468058176",
        "title": "The Man",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:10",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3b/b7/c6/3bb7c6f7-d06f-f91c-7801-0ed0a6257e1c/mzaf_12747815097409700369.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "pHoHDNxay3A"
    },
    {
        "id": "track-1468058165-1468058177",
        "title": "The Archer",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:31",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/20/f2/f1/20f2f134-3309-4185-a94a-60874c49d529/mzaf_191729209789352081.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "8KpKc3C9V3w"
    },
    {
        "id": "track-1468058165-1468058178",
        "title": "I Think He Knows",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "2:53",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/36/5e/3f/365e3fba-8094-a148-2bd4-3dd6a0955ffe/mzaf_9018492115665734709.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "2d1wKn-oJnA"
    },
    {
        "id": "track-1468058165-1468058180",
        "title": "Miss Americana & The Heartbreak Prince",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:54",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8e/94/60/8e946056-a91f-77be-f615-f4f717908723/mzaf_9075445817267686583.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "Kwf7P2GNAVw"
    },
    {
        "id": "track-1468058165-1468058181",
        "title": "Paper Rings",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:42",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/05/2d/b7/052db7e1-e5cf-bfba-c309-9b3e31edeb37/mzaf_11390896675529863162.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "8zdg-pDF10g"
    },
    {
        "id": "track-1468058165-1468058184",
        "title": "Cornelia Street",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "4:47",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6a/f9/32/6af93277-3dca-7a00-edd0-5386ce4dd123/mzaf_18277705604040396242.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "VikHHWrgb4Y"
    },
    {
        "id": "track-1468058165-1468058185",
        "title": "Death By A Thousand Cuts",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:19",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8d/c5/6a/8dc56a4e-ea68-b459-9797-d6930467b414/mzaf_9247743533036363661.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "GTEFSuFfgnU"
    },
    {
        "id": "track-1468058165-1468058696",
        "title": "London Boy",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:10",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f2/34/0c/f2340c41-81b0-a5f6-b61b-6f41a395d6c4/mzaf_7441079905742391154.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "VsKoOH6DVys"
    },
    {
        "id": "track-1468058165-1468058699",
        "title": "Soon You’ll Get Better (feat. The Chicks)",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:22",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/67/1d/fb/671dfbf5-1b2a-3809-1e6c-c834fb737478/mzaf_6885608076404289573.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "tMoW5G5LU08"
    },
    {
        "id": "track-1468058165-1468058701",
        "title": "False God",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:20",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d5/3e/67/d53e6714-03cb-7365-9351-c280e8abac35/mzaf_10316874145459051650.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "acQXa5ArHIk"
    },
    {
        "id": "track-1468058165-1468058704",
        "title": "You Need To Calm Down",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "2:51",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e8/80/4f/e8804fa1-6118-74fd-4602-b96969ebef41/mzaf_5457103975229379192.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "Dkk9gvTmCXY"
    },
    {
        "id": "track-1468058165-1468058705",
        "title": "Afterglow",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:43",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/eb/86/30/eb863040-ef55-fa8e-cb45-e27cedbe9e46/mzaf_5312643549713230502.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "8HxbqAsppwU"
    },
    {
        "id": "track-1468058165-1468058706",
        "title": "ME! (feat. Brendon Urie of Panic! At The Disco)",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "3:13",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c5/6f/e3/c56fe3a6-2f25-b545-6135-aaba0a838569/mzaf_1819099962104489735.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "FuXNumBwDOM"
    },
    {
        "id": "track-1468058165-1468058707",
        "title": "It’s Nice To Have A Friend",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "2:30",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/94/75/0c/94750c81-f080-d583-650f-9b96df6709cb/mzaf_14727730034427264252.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "eaP1VswBF28"
    },
    {
        "id": "track-1468058165-1468058708",
        "title": "Daylight",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": "4:53",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/98/b6/5d/98b65dc3-5dcd-0ad8-3e26-724ef9bada98/4711099675807.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9d/10/f6/9d10f6cc-8fa8-8ea1-1323-edabdcdeadae/mzaf_15969938021558823306.plus.aac.p.m4a",
        "releaseDate": "2019-08-23",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "u9raS7-NisU"
    },
    {
        "id": "track-1649434996-1649435004",
        "title": "Lavender Haze",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "3:22",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/67/b5/01/67b501d5-362e-797e-7dbd-942b9e273084/22UM1IM24801.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e8/3d/a6/e83da665-dc67-5d12-1bcb-92b2cbff0eb2/mzaf_8022777830254348609.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "mkR_Qwix4Ho"
    },
    {
        "id": "track-1649434996-1649435011",
        "title": "Maroon",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "3:38",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/fb/b7/5d/fbb75d98-3b52-2fa5-ca82-658194f3c498/23UMGIM58157.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d0/a1/ba/d0a1baa7-f46d-01e6-685a-5358a6159c0f/mzaf_14464932978819886454.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "lvHZjvIyqsk"
    },
    {
        "id": "track-1649434996-1649435022",
        "title": "Anti-Hero",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "3:21",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/59/13/5c/59135ccc-8425-415c-7f89-8aeada60088e/22UM1IM22440.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1d/56/2a/1d562a07-dc5f-a9c0-1f36-2051a8c14eb7/mzaf_7214829135431340590.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "XqN2qFvY64U"
    },
    {
        "id": "track-1649434996-1649435236",
        "title": "Snow On The Beach (feat. Lana Del Rey)",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "4:16",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ff/e8/8a/ffe88ac5-9468-0671-9968-3438faad2cc1/22UM1IM22512.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/94/53/5d/94535d1f-a5d3-7222-5af8-55e9629899cf/mzaf_3700794681919953043.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "2CnUYMmEHrs"
    },
    {
        "id": "track-1649434996-1649435238",
        "title": "You're On Your Own, Kid",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "3:14",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a6/85/b9/a685b9f8-dad3-2ed7-58b2-ab7f64304505/23UMGIM58157.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/56/3f/81/563f8180-1a1b-48ee-bbe9-a5c3b6da617f/mzaf_699163929898856961.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "7Gbg6Z70J7E"
    },
    {
        "id": "track-1649434996-1649435243",
        "title": "Midnight Rain",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "2:55",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/59/13/5c/59135ccc-8425-415c-7f89-8aeada60088e/22UM1IM22440.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/60/83/74/608374c4-89c9-56b6-cc05-83823079093d/mzaf_7336811791578249009.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "Odh9ddPUkEY"
    },
    {
        "id": "track-1649434996-1649435249",
        "title": "Question...?",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "3:31",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ff/e8/8a/ffe88ac5-9468-0671-9968-3438faad2cc1/22UM1IM22512.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e0/0d/95/e00d9591-97a9-64d3-071a-e2e599bc3ca6/mzaf_13718150904411304409.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "xxrf_QBD5DE"
    },
    {
        "id": "track-1649434996-1649435259",
        "title": "Vigilante Shit",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "2:45",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ff/e8/8a/ffe88ac5-9468-0671-9968-3438faad2cc1/22UM1IM22512.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2a/c6/85/2ac68546-cd9d-55c6-338a-bee1e48e70cd/mzaf_870036706828961381.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "Uoey4W_3bos"
    },
    {
        "id": "track-1649434996-1649435261",
        "title": "Bejeweled",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "3:14",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/59/13/5c/59135ccc-8425-415c-7f89-8aeada60088e/22UM1IM22440.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a7/5f/72/a75f72e1-dc99-5dbe-88fe-d25342b5f00d/mzaf_16133306547828855925.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "XzKSPRqFg9E"
    },
    {
        "id": "track-1649434996-1649435264",
        "title": "Labyrinth",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "4:08",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/59/13/5c/59135ccc-8425-415c-7f89-8aeada60088e/22UM1IM22440.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/c3/34/44c33455-79ca-d1c2-e557-99ddf564b674/mzaf_12176202092445547869.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "xTXsKMXUi7w"
    },
    {
        "id": "track-1649434996-1649435543",
        "title": "Karma",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "3:25",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/fb/b7/5d/fbb75d98-3b52-2fa5-ca82-658194f3c498/23UMGIM58157.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5f/37/bf/5f37bff2-2413-d187-c153-7ffb2a93d022/mzaf_18258475033098661061.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "pzVYSfzNQ5Y"
    },
    {
        "id": "track-1649434996-1649435553",
        "title": "Sweet Nothing",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "3:08",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a6/85/b9/a685b9f8-dad3-2ed7-58b2-ab7f64304505/23UMGIM58157.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4c/d9/9d/4cd99d56-598e-5f69-8007-f0d2652b8a82/mzaf_1308049008659075487.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "rn0brgg2BpI"
    },
    {
        "id": "track-1649434996-1649435558",
        "title": "Mastermind",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "3:11",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3d/01/f2/3d01f2e5-5a08-835f-3d30-d031720b2b80/22UM1IM07364.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/33/c5/a5/33c5a567-cfce-1a3c-3545-f8a947cd07b1/mzaf_4940803706255561013.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "Tmz1lz0zcLQ"
    },
    {
        "id": "track-1649434996-1649435722",
        "title": "Meet me at midnight",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": "0:09",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3d/01/f2/3d01f2e5-5a08-835f-3d30-d031720b2b80/22UM1IM07364.rgb.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/eb/64/8e/eb648e16-67f1-be2a-0ed7-c718e9d7db18/mzaf_998298266636309055.plus.aac.p.m4a",
        "releaseDate": "2022-10-21",
        "hero": "Taylor Swift",
        "musicDirector": "Jack Antonoff",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "UUA8fg2i4_k"
    },
    {
        "id": "track-1193701079-1193701326",
        "title": "Eraser",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "3:48",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/ba/0f/61/ba0f61a9-cd5d-40f9-b54f-3f9bbba6cd45/707541066037.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/37/89/10/378910a3-b590-8daa-c6fd-7cc9b6f8279a/mzaf_15679519460476153155.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "OjGrcJ4lZCc"
    },
    {
        "id": "track-1193701079-1193701328",
        "title": "Castle on the Hill",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "4:21",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/8d/9f/d48d9f8e-3d42-e514-5999-223d52dde2f3/190295843434.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/07/be/08/07be085d-6f06-8b4e-cea1-f40b4dca3815/mzaf_12958775594313934161.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "7Qp5vcuMIlk"
    },
    {
        "id": "track-1193701079-1193701329",
        "title": "Dive",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "3:58",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e0/09/a2/e009a2a8-0631-e674-08ab-c4dfef784ee7/mzaf_6040868619573536593.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "Wv2rLZmbPMA"
    },
    {
        "id": "track-1193701079-1193701392",
        "title": "Shape of You",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "3:54",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f9/c8/96/f9c896ef-986e-e60c-0c20-d2c77918832f/5021732586186.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/c7/4f/44c74f0d-72dc-6143-d4d0-ba14d661ca0d/mzaf_9566898362556366703.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "JGwWNGJdvx8"
    },
    {
        "id": "track-1193701079-1193701400",
        "title": "Perfect",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "4:23",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/4a/02/6e/4a026ec1-532b-8f6d-50fe-f185f69f9b82/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c7/ba/bc/c7babc66-f598-aaa6-bcf6-307281795817/mzaf_16337361235117168274.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "UU5Hre1vwlA"
    },
    {
        "id": "track-1193701079-1193701436",
        "title": "Galway Girl",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "2:51",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Video52/v4/6e/5d/a4/6e5da46f-891d-ac36-49bf-a423d2a07c9f/GB1301700193.sca1.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/26/98/fc/2698fc53-3774-bd3c-8b22-f1f845eacdaf/mzaf_11930414004759637913.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "XjHr-6Zl5P8"
    },
    {
        "id": "track-1193701079-1193701439",
        "title": "Happier",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "3:28",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/ba/0f/61/ba0f61a9-cd5d-40f9-b54f-3f9bbba6cd45/707541066037.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a5/a3/4e/a5a34ec0-b0d1-a1c5-32ef-31795d968b5f/mzaf_6657904390746527335.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "8TpcBDJZsJA"
    },
    {
        "id": "track-1193701079-1193701440",
        "title": "New Man",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "3:09",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/8b/43/50/8b43506a-3f08-e156-e29d-ef54d328d493/196292594140.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/20/8d/d3/208dd317-8705-b266-71f1-72361c8322f9/mzaf_12670287989294954289.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "EwzD8U4u76k"
    },
    {
        "id": "track-1193701079-1193701441",
        "title": "Hearts Don't Break Around Here",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "4:08",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1c/02/fc/1c02fcba-cd14-bca6-dd4b-3774ada3ef09/mzaf_14124895800378810439.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "20pAJPNaAyw"
    },
    {
        "id": "track-1193701079-1193701442",
        "title": "What Do I Know?",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "3:57",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c8/b6/aa/c8b6aad2-086e-3957-beb6-1c352bec85f3/mzaf_6925313312696286336.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "6B9J3lEyffA"
    },
    {
        "id": "track-1193701079-1193701449",
        "title": "How Would You Feel (Paean)",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "4:41",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/55/fa/51/55fa51d1-7e71-6805-434f-08213de9e58d/mzaf_18129038824542630747.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "ZZMZiBCRX4c"
    },
    {
        "id": "track-1193701079-1193701511",
        "title": "Supermarket Flowers",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "3:41",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/ba/0f/61/ba0f61a9-cd5d-40f9-b54f-3f9bbba6cd45/707541066037.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/90/04/449004e1-231a-d86c-4b22-85649318a91a/mzaf_12767011678800417401.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "bIB8EWqCPrQ"
    },
    {
        "id": "track-1193701079-1193701517",
        "title": "Barcelona",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "3:11",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f8/e9/a4/f8e9a476-34d4-f292-6aec-fc97d1fdff0e/9162.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2a/70/d7/2a70d7b3-0ac0-78ed-f400-3be17f46e930/mzaf_649909377819472443.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "OVO4LhrOFiY"
    },
    {
        "id": "track-1193701079-1193701519",
        "title": "Bibia Be Ye Ye",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "2:57",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c1/76/a9/c176a91f-8c7a-72ae-6769-a4b3bfa3bcab/mzaf_17801017395853650162.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "eQlveAt9e88"
    },
    {
        "id": "track-1193701079-1193701520",
        "title": "Nancy Mulligan",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "2:60",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/5c/9a/a0/5c9aa0db-2f17-9f23-9585-a5da0059fded/mzaf_15287848746337148134.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "VFlZXlfda6Y"
    },
    {
        "id": "track-1193701079-1193701521",
        "title": "Save Myself",
        "artist": "Ed Sheeran",
        "album": "Divide",
        "duration": "4:07",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/00/fe/05/00fe0516-3b65-70f5-2d30-b37397abc523/mzaf_16091944218190160985.plus.aac.p.m4a",
        "releaseDate": "2017-03-03",
        "hero": "Ed Sheeran",
        "musicDirector": "Steve Mac",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Sunny",
        "youtubeId": "qXM0JdAwabU"
    },
    {
        "id": "track-1581087024-1581087029",
        "title": "Tides",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:16",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a3/61/77/a3617702-f421-47f1-c522-cc3b200d86cf/198001631368.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/85/96/bd/8596bdcb-9919-ca7c-b288-dfeb02515c81/mzaf_13013173343947595089.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "P_kRTqaD8Mc"
    },
    {
        "id": "track-1581087024-1581087034",
        "title": "Shivers",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:28",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/fa/22/f0/fa22f08c-b2e0-5a08-4798-b2574dd4e2e3/789577229198.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a8/9f/a5/a89fa5e9-8a3b-77bb-e081-866067d3f213/mzaf_13889707114574366771.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "z2_Lrg6rRks"
    },
    {
        "id": "track-1581087024-1581087526",
        "title": "First Times",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:06",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a3/61/77/a3617702-f421-47f1-c522-cc3b200d86cf/198001631368.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/69/70/4b/69704b4b-fdd6-b9f1-74f2-86f129ba09b2/mzaf_13164912794637483707.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "y6oryBG8xeQ"
    },
    {
        "id": "track-1581087024-1581087532",
        "title": "Bad Habits",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:51",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a3/61/77/a3617702-f421-47f1-c522-cc3b200d86cf/198001631368.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f2/08/5d/f2085d7c-a4d0-451b-4d1d-ccc3057ab6e2/mzaf_11771336260379351390.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "HeOpRzcqKrE"
    },
    {
        "id": "track-1581087024-1581087534",
        "title": "Overpass Graffiti",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:57",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a3/61/77/a3617702-f421-47f1-c522-cc3b200d86cf/198001631368.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/68/75/06/6875061b-3cc4-b1f2-d607-78f686ad9471/mzaf_14717825274781732145.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "0qTQR92UuUA"
    },
    {
        "id": "track-1581087024-1581087536",
        "title": "The Joker And The Queen",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:06",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/7b/36/ec/7b36ec5a-d752-167b-849f-2e6f8bdf90d5/190296267987.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/07/5b/79/075b79fe-c65c-f554-bcf5-21ed1b6b5fbc/mzaf_9957706621758842811.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "wyE9x5HETkY"
    },
    {
        "id": "track-1581087024-1581087537",
        "title": "Leave Your Life",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:44",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/de/fc/26/defc2669-4f37-58ff-9723-7ea3e649f3bb/mzaf_640820947760075655.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "gbcGk-xYG_M"
    },
    {
        "id": "track-1581087024-1581087540",
        "title": "Collide",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:30",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a3/61/77/a3617702-f421-47f1-c522-cc3b200d86cf/198001631368.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1e/f4/3a/1ef43a45-3b46-1588-465a-5f13cdfba600/mzaf_16839048763739142056.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "Ykq2qn1jjGk"
    },
    {
        "id": "track-1581087024-1581087542",
        "title": "2step",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "2:34",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/6e/2f/9b/6e2f9b58-78b1-4c1f-dce7-faee3c15678d/5054197150975.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3c/57/73/3c5773de-5186-eb37-5dbc-3cdfe5f71129/mzaf_8769955983632520228.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "3d6IKK7tmXY"
    },
    {
        "id": "track-1581087024-1581087545",
        "title": "Stop The Rain",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:23",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a3/61/77/a3617702-f421-47f1-c522-cc3b200d86cf/198001631368.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4e/91/46/4e9146f4-0f2b-962d-9df8-fb5e5a1e56a1/mzaf_5091300273577203434.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "JATT-mgGiPQ"
    },
    {
        "id": "track-1581087024-1581087756",
        "title": "Love In Slow Motion",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:11",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a3/61/77/a3617702-f421-47f1-c522-cc3b200d86cf/198001631368.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ab/0a/87/ab0a879b-7b38-3abc-4aca-898e98ad05de/mzaf_7305571802023006635.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "wQpU_v2cH_w"
    },
    {
        "id": "track-1581087024-1581087760",
        "title": "Visiting Hours",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:36",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a3/61/77/a3617702-f421-47f1-c522-cc3b200d86cf/198001631368.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/54/ea/6a/54ea6abc-74c8-49a6-dba3-b7a92b846ead/mzaf_4097476290466046836.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "pVqX2u6YWqI"
    },
    {
        "id": "track-1581087024-1581087767",
        "title": "Sandman",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "4:19",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a3/61/77/a3617702-f421-47f1-c522-cc3b200d86cf/198001631368.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d9/cc/e1/d9cce1a9-4e94-d087-5606-29ff8c8d3642/mzaf_14987188788437275848.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "lagKeiqYKz8"
    },
    {
        "id": "track-1581087024-1581087780",
        "title": "Be Right Now",
        "artist": "Ed Sheeran",
        "album": "Equals",
        "duration": "3:31",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a3/61/77/a3617702-f421-47f1-c522-cc3b200d86cf/198001631368.png/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e2/95/4a/e2954af4-a69d-8cbc-97b7-d3a223490f4b/mzaf_16661786544139664034.plus.aac.p.m4a",
        "releaseDate": "2021-10-29",
        "hero": "Ed Sheeran",
        "musicDirector": "Johnny McDaid",
        "region": "Hollywood",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "mqjoCX4OU0w"
    },
    {
        "id": "lofi-1",
        "title": "3 AM Study Session",
        "artist": "Lofi Girl",
        "album": "Lofi Vibes",
        "duration": "2:45",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/bb/a2/f0/bba2f0d7-4d9e-c617-d49e-3ae02fd5d440/dj.xbkfgllk.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/71/5c/80/715c80fc-ebe4-e713-487c-5bdefee6c6f3/mzaf_3698387428135478316.plus.aac.p.m4a",
        "releaseDate": "2023-01-01",
        "hero": "Lofi Girl",
        "musicDirector": "ChilledCow",
        "region": "Lo-Fi",
        "isPremium": false,
        "weather": "Night",
        "youtubeId": "lTRiuFIWV54"
    },
    {
        "id": "lofi-2",
        "title": "Rainy Days",
        "artist": "Kudasai",
        "album": "Falling",
        "duration": "3:10",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/2c/06/86/2c068675-4814-c770-8da6-aaf1cc3fbdd0/196873376462.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/11/c0/e9/11c0e95f-70fe-a7e2-9e70-11cc00cf0549/mzaf_8195718842418175910.plus.aac.p.m4a",
        "releaseDate": "2022-04-15",
        "hero": "Lofi Girl",
        "musicDirector": "Kudasai",
        "region": "Lo-Fi",
        "isPremium": false,
        "weather": "Rainy",
        "youtubeId": "k7LhdJPUTQ0"
    },
    {
        "id": "lofi-3",
        "title": "Sunset Chill",
        "artist": "Idealism",
        "album": "Hiraeth",
        "duration": "2:30",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/78/1c/93/781c934a-c233-cfce-39db-31f7284969b4/cover.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0c/5a/b0/0c5ab042-3db7-35ad-cb8c-f31939e1f475/mzaf_17010165858563185645.plus.aac.p.m4a",
        "releaseDate": "2021-08-20",
        "hero": "Lofi Girl",
        "musicDirector": "Idealism",
        "region": "Lo-Fi",
        "isPremium": false,
        "weather": "Cloudy",
        "youtubeId": "DbmmHARq4Zw"
    },
    {
        "id": "track-1782701545-0",
        "title": "Manasilaayo",
        "artist": "Unknown Artist",
        "album": "Vettaiyan",
        "duration": "3:00",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b5/fa/46/b5fa4632-dd53-32fc-25fc-e390940f7a43/196872454130.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f1/e9/c2/f1e9c23d-8087-28af-cf16-1785fb42cd14/mzaf_16351401772645005124.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "AiD6SOOBKZI"
    },
    {
        "id": "track-1782701545-1",
        "title": "Dheema",
        "artist": "Unknown Artist",
        "album": "Love Insurance Kompany",
        "duration": "3:00",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/35/b4/a5/35b4a588-2f23-7ddc-b56c-6df5759c4eb8/196872562651.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e0/3f/e1/e03fe1b4-25e5-a960-6129-092aa2dc1474/mzaf_15399118819124515247.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "5Lco4Y5fbY4"
    },
    {
        "id": "track-1782701545-2",
        "title": "Hunter Vantaar",
        "artist": "Unknown Artist",
        "album": "Vettaiyan",
        "duration": "3:00",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/be/65/79/be657915-a8d8-762b-8af7-625a9ebebcc5/196872492156.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e3/86/72/e386722b-8d3e-899d-8e3d-7f2815ad0457/mzaf_15402526032437650738.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "lIwhaTfqwzc"
    },
    {
        "id": "track-1782701545-3",
        "title": "Kadharalz",
        "artist": "Unknown Artist",
        "album": "Indian 2",
        "duration": "3:00",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/90/40/92/904092e9-46a9-06da-f052-36a13892159f/196872179736.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/92/85/d0/9285d0d3-0f72-d914-95ad-1a7bb1323d3a/mzaf_18101483807815289871.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "7CmcwzpnIJU"
    },
    {
        "id": "track-1782701545-4",
        "title": "Paaraa",
        "artist": "Unknown Artist",
        "album": "Indian 2",
        "duration": "3:00",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/90/40/92/904092e9-46a9-06da-f052-36a13892159f/196872179736.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/95/6c/d0/956cd098-3604-ac12-3640-333fa40d8653/mzaf_9059117673195150641.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "s4MvQWsEAs8"
    },
    {
        "id": "track-1782701545-5",
        "title": "Chillanjirukkiye",
        "artist": "Unknown Artist",
        "album": "Lubber Pandhu",
        "duration": "3:00",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/6a/70/a9/6a70a9cf-a45c-56b8-2168-827ae3acb6dc/196871991230.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/09/88/8a/09888ab4-e297-3054-f87a-210cc48e0b66/mzaf_4918181282056665335.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "_XhRghui8iE"
    },
    {
        "id": "track-1782701545-6",
        "title": "Aasa Orave",
        "artist": "Unknown Artist",
        "album": "Lubber Pandhu",
        "duration": "3:00",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/6a/70/a9/6a70a9cf-a45c-56b8-2168-827ae3acb6dc/196871991230.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/18/7b/6f/187b6f61-1438-2366-c758-d31abd1f59af/mzaf_3192858210709703715.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "TPVT-LWvgZQ"
    },
    {
        "id": "track-1782701545-7",
        "title": "Dhinam Dhinamum",
        "artist": "Unknown Artist",
        "album": "Viduthalai 2",
        "duration": "3:00",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/de/1d/2d/de1d2d56-833e-c02e-f0c7-b32fcbf8afab/196872659450.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/68/43/16/684316ff-064d-7bc6-0fb5-097fd2208d1e/mzaf_8759001360764682795.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "sVhXWQAhyjI"
    },
    {
        "id": "track-1782701545-8",
        "title": "Neelorpam",
        "artist": "Unknown Artist",
        "album": "Indian 2",
        "duration": "3:00",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/90/40/92/904092e9-46a9-06da-f052-36a13892159f/196872179736.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f5/0a/fd/f50afddb-513f-ad25-ceed-ef62269ed027/mzaf_13004957519673087877.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "6ZAm27NvFCY"
    },
    {
        "id": "track-1782701545-9",
        "title": "Monica",
        "artist": "Unknown Artist",
        "album": "Coolie",
        "duration": "3:00",
        "coverUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/5c/6f/07/5c6f07b3-173c-31ef-a2eb-cd23548a71d7/199538267020.jpg/600x600bb.jpg",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/17/f9/62/17f962e1-2c87-d723-aa5c-5494271e6b1f/mzaf_1318682182991792413.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "yY-nUm7o4G4"
    },
    {
        "id": "track-1782701545-10",
        "title": "Kanimaa",
        "artist": "Unknown Artist",
        "album": "Retro",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/86/68/7e/86687e88-6068-9e30-9f5d-dd7a491f4ca4/mzaf_13198581816600236055.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "tZ8ttss93G4"
    },
    {
        "id": "track-1782701545-11",
        "title": "Powerhouse",
        "artist": "Unknown Artist",
        "album": "Coolie",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6f/51/5e/6f515e16-25fd-c190-e277-6a0c27772ad8/mzaf_8795228625472102415.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "OXHTlMPbX7o"
    },
    {
        "id": "track-1782701545-12",
        "title": "Vazhithunaiye",
        "artist": "Unknown Artist",
        "album": "Dragon",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f0/ec/9c/f0ec9c21-ec83-b454-a4e2-a2500dfdac3d/mzaf_12175313712144025350.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "XMrZO7hH6sw"
    },
    {
        "id": "track-1782701545-13",
        "title": "Pattuma",
        "artist": "Unknown Artist",
        "album": "Love Insurance Kompany",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1c/4e/f8/1c4ef8eb-ceb3-7302-0393-a827f5026bb7/mzaf_885351828551274648.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "BOhXss1zQLk"
    },
    {
        "id": "track-1782701545-14",
        "title": "Thalapathy Kacheri",
        "artist": "Unknown Artist",
        "album": "Jananaayagan",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/00/12/4b/00124bc6-3928-404c-fa9a-b6157fc472f5/mzaf_6999912150450564885.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "KgpnfT5bgLY"
    },
    {
        "id": "track-1782701545-15",
        "title": "Theekkoluthi",
        "artist": "Unknown Artist",
        "album": "Bison",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ba/a1/d2/baa1d29f-ae54-858d-068f-62f98114d8b7/mzaf_9051993893925085503.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "3Lc-96oH__s"
    },
    {
        "id": "track-1782701545-16",
        "title": "Oorum Blood",
        "artist": "Unknown Artist",
        "album": "Dude",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/67/9e/8a/679e8a1c-1860-4b4c-4d4b-14d6f1c3b680/mzaf_12224164526634551006.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "4Bsc2uI_LsM"
    },
    {
        "id": "track-1782701545-17",
        "title": "Singari",
        "artist": "Unknown Artist",
        "album": "Dude",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b1/4d/b7/b14db70d-cf68-3b7b-c71d-e4580623a950/mzaf_16905950272628104445.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "0MQwuGR_tr0"
    },
    {
        "id": "track-1782701545-18",
        "title": "God Mode",
        "artist": "Unknown Artist",
        "album": "Kaaruppu",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/88/2f/2d/882f2d85-9c6d-7a1c-dea6-2c163e27220e/mzaf_13634973045223191055.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "nffLXODytdw"
    },
    {
        "id": "track-1782701545-19",
        "title": "Aura 10/10",
        "artist": "Unknown Artist",
        "album": "Meesaya Murukku 2",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ec/6a/8e/ec6a8e14-42e2-67a1-fe9b-6471421936ca/mzaf_8526677838591214793.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "Aze7zTyIRtk"
    },
    {
        "id": "track-1782701545-20",
        "title": "Pavazha Malli",
        "artist": "Unknown Artist",
        "album": "Unknown Album",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/49/e2/97/49e297f2-e69f-616d-c066-dca08cfc222e/mzaf_2291798207633215561.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "R2uGuOqYEyw"
    },
    {
        "id": "track-1782701545-21",
        "title": "Mutta Kalakki",
        "artist": "Unknown Artist",
        "album": "Youth",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f8/fd/be/f8fdbebf-6aac-634a-11e6-391eddb0e255/mzaf_13700300797754563121.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "jZEA2mMwL1k"
    },
    {
        "id": "track-1782701545-22",
        "title": "Raga of Revenge",
        "artist": "Unknown Artist",
        "album": "DC",
        "duration": "3:00",
        "coverUrl": "https://via.placeholder.com/300?text=Cover+Art",
        "audioUrl128k": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/10/2d/2a/102d2a1b-3b92-4c1f-619b-af4493e3cc61/mzaf_5359453658953590838.plus.aac.p.m4a",
        "releaseDate": "2024-01-01",
        "hero": "Unknown",
        "musicDirector": "Unknown",
        "region": "Kollywood",
        "isPremium": false,
        "weather": "Clear",
        "youtubeId": "NAkQVL61BRI"
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

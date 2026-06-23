/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlaybackState = 'idle' | 'playing' | 'paused';

export type SubscriptionTier = 'Free' | 'Premium' | 'Premium+';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  audioUrl128k: string; // Free quality stream
  audioUrl320k: string; // Premium quality stream
  audioUrlFlac: string; // Premium+ Lossless studio quality
  audioUrlAtmos: string; // Premium+ Spatial Audio Dolby Atmos
  isPremium: boolean;
  isPremiumPlus?: boolean; // Premium+ exclusive lock
  lyrics?: string;
  releaseDate?: string; // e.g., "2026-06-22"
  musicDirector?: string;
  hero?: string;
  region?: string; // e.g., "Tollywood", "Bollywood", "Kollywood", "Hollywood"
  weather?: 'Clear' | 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Snowy';
}

export interface PrivacySettings {
  isPublicProfile: boolean;
  showListeningActivity: boolean;
  playlistsPrivateByDefault: boolean;
}

export interface ListeningStats {
  tracksPlayed: number;
  minutesListened: number;
  topGenre: string;
  favArtist: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  avatarUrl: string;
  bio: string;
  stats: ListeningStats;
  privacy: PrivacySettings;
  createdAt: string;
}

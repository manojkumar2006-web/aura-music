/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music,
  Play,
  Pause,
  Heart,
  Plus,
  Search,
  Crown,
  AlignLeft,
  X,
  Home as HomeIcon,
  PlusCircle,
  Shield,
  ShieldCheck,
  FolderPlus,
  Download,
  FolderHeart,
  Check,
  TrendingUp,
  Activity,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Key,
  Mail,
  AlertTriangle,
  Edit2,
  Globe,
  Lock,
  Eye,
  Calendar,
  Sparkles,
  Radio,
  Disc,
  ListMusic,
  Mic2,
  Clock,
  LayoutGrid,
  Settings,
  Sliders,
  Users,
  Star,
  MoreVertical,
  Trash2,
  Edit3,
  BarChart2,
  Share2
} from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { AudioPlayer } from '../components/player/AudioPlayer';
import { Track, SubscriptionTier } from '../types';
import { getUserLocation, getWeather, getRegionIndustry } from '../services/locationService';
import { OnboardingWizard } from '../components/OnboardingWizard';

const ARTIST_IMAGES: Record<string, string> = {
  "Thalapathy Vijay": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/C._Joseph_Vijay_%28cropped%29.jpg/330px-C._Joseph_Vijay_%28cropped%29.jpg",
  "Rajinikanth": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Rajinikanth_in_2019.jpg/330px-Rajinikanth_in_2019.jpg",
  "Kamal Haasan": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Kamal_Haasan_at_2023_San_Diego_Comic-Con_International_by_Gage_Skidmore%2C_005_%28cropped%29.jpg/330px-Kamal_Haasan_at_2023_San_Diego_Comic-Con_International_by_Gage_Skidmore%2C_005_%28cropped%29.jpg",
  "Ram Charan": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Ram_Charan_at_Game_Changer_trailer_launch.jpg/330px-Ram_Charan_at_Game_Changer_trailer_launch.jpg",
  "Allu Arjun": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Allu_Arjun_at_Pushpa_2_The_Rule_meet.jpg/330px-Allu_Arjun_at_Pushpa_2_The_Rule_meet.jpg",
  "Prabhas": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Prabhas_by_Gage_Skidmore.jpg/330px-Prabhas_by_Gage_Skidmore.jpg",
  "Shah Rukh Khan": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg/330px-Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg",
  "Ranbir Kapoor": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Ranbir_Kapoor_snapped_at_Kalina_airport.jpg",
  "The Weeknd": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/The_Weeknd_Portrait_by_Brian_Ziff.jpg/330px-The_Weeknd_Portrait_by_Brian_Ziff.jpg",
  "Taylor Swift": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png/330px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png",
  "Ed Sheeran": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ed_Sheeran-6886_%28cropped%29.jpg/330px-Ed_Sheeran-6886_%28cropped%29.jpg",
  "Lofi Girl": "https://upload.wikimedia.org/wikipedia/en/f/f5/Lofi_Girl_logo_2024.jpg",
  "Anirudh Ravichander": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Anirudh_Ravichander_at_Audi_Ritz_Style_Awards_2017_%28cropped%29.jpg/330px-Anirudh_Ravichander_at_Audi_Ritz_Style_Awards_2017_%28cropped%29.jpg",
  "M. M. Keeravani": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/M._M._Keeravani_at_Inji_Iduppazhagi_Audio_Launch_%28cropped%29.jpg/330px-M._M._Keeravani_at_Inji_Iduppazhagi_Audio_Launch_%28cropped%29.jpg",
  "Devi Sri Prasad": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Devi_sri_prasad.jpg/330px-Devi_sri_prasad.jpg",
  "Thaman S": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/S._Thaman_at_Damaal_Dumeel_Audio_Launch.jpg/330px-S._Thaman_at_Damaal_Dumeel_Audio_Launch.jpg",
  "Vishal-Shekhar": "https://upload.wikimedia.org/wikipedia/commons/8/87/Vishal_shekhar_live_hungama_concert.jpg",
  "Pritam": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Pritam_Live_%28cropped%29.jpg/330px-Pritam_Live_%28cropped%29.jpg",
  "Max Martin": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/MaxMartin.jpg/330px-MaxMartin.jpg",
  "Daft Punk": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Daft_Punk_in_2013_2-_centered.jpg/330px-Daft_Punk_in_2013_2-_centered.jpg",
  "Jack Antonoff": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Jack_Antonoff_at_Electric_Lady_Studios_2023_%28cropped%29.jpg/330px-Jack_Antonoff_at_Electric_Lady_Studios_2023_%28cropped%29.jpg",
  "Johnny McDaid": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Snow_Patrol_-_2018153204415_2018-06-02_Rock_am_Ring_-_1D_X_MK_II_-_0578_-_B70I1885_%28cropped%29.jpg/330px-Snow_Patrol_-_2018153204415_2018-06-02_Rock_am_Ring_-_1D_X_MK_II_-_0578_-_B70I1885_%28cropped%29.jpg"
};

export const getCover = (name: string, type: 'hero' | 'director' | 'artist' | 'album', tracks?: Track[]) => {
  if (!name) return '/covers/hero-images.jpg';

  // Use real portrait for artist/hero/director if available
  if ((type === 'hero' || type === 'director' || type === 'artist') && ARTIST_IMAGES[name]) {
    return ARTIST_IMAGES[name];
  }

  // Fallback to finding an associated track's cover URL
  if (tracks) {
    let match;
    if (type === 'hero') match = tracks.find(t => t.hero === name);
    if (type === 'director') match = tracks.find(t => t.musicDirector === name);
    if (type === 'artist') match = tracks.find(t => t.artist?.includes(name));
    if (type === 'album') match = tracks.find(t => t.album === name);
    
    if (match && match.coverUrl) {
      return match.coverUrl;
    }
  }

  // Final fallback to generic covers
  const lower = name.toLowerCase();
  if (lower.includes('vijay')) return '/covers/Vijay.jpg';
  if (lower.includes('anirudh')) return '/covers/Anirudh.jpg';
  if (lower.includes('lokesh')) return '/covers/Lokesh Kanagaraj.jpg';
  if (lower.includes('leo')) return '/covers/Leo.jpg';
  if (lower.includes('sai abhyankkar')) return '/covers/Sai-Abhyankkar.avif';
  return '/covers/hero-images.jpg';
};

const COMMUNITY_PLAYLISTS = [
  { name: 'Synthwave Nights', author: 'NeonRider', coverUrl: 'https://picsum.photos/seed/music1/400/400', trackIds: ['track-1', 'track-2', 'track-3'] },
  { name: 'Focus Flow', author: 'StudyBot', coverUrl: 'https://picsum.photos/seed/music2/400/400', trackIds: ['track-4', 'track-5'] },
  { name: 'Gym Bangerz', author: 'Chad', coverUrl: 'https://picsum.photos/seed/music3/400/400', trackIds: ['track-6', 'track-7'] },
  { name: 'Acoustic Morning', author: 'CoffeeLover', coverUrl: 'https://picsum.photos/seed/music4/400/400', trackIds: ['track-8', 'track-9'] }
];

export const Home: React.FC = () => {
  const {
    tracks,
    addTrack,
    currentTrack,
    setCurrentTrack,
    playbackState,
    setPlaybackState,
    userTier,
    setTier,
    isAdminMode,
    setAdminMode,
    searchQuery,
    setSearchQuery,
    
    // Tiered states
    remainingSkips,
    downloadedTracks,
    downloadTrack,
    activeTheme,
    setTheme,
    playlists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    analyticsEvents,
    logAnalyticsEvent,
    queue,
    setQueue,

    // Auth states & actions
    currentUser,
    authLoading,
    signUp,
    logIn,
    logOut,
    updateProfile,
    updatePrivacy,
    currentWeather,
    setCurrentWeather,
    userRegion,
    setUserRegion,
    fetchTracks,
    toggleLike,
    toggleArtistLike
  } = useMusicStore();

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  // Local UI States
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [activeView, setActiveView] = useState<'library' | 'profile'>('library');
  const [sidebarNav, setSidebarNav] = useState<string>('home');
  const [activeTrackMenu, setActiveTrackMenu] = useState<string | null>(null);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [customSleepTimerInput, setCustomSleepTimerInput] = useState('');
  const [trackToAddPlaylist, setTrackToAddPlaylist] = useState<string | null>(null);
  
  // Auth Form Input States
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupAvatarUrl, setSignupAvatarUrl] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // AI Mood Analysis for Personalize your Vibe
  const vibeTracks = useMemo(() => {
    if (!currentWeather || !userRegion) return [];
    
    const w = currentWeather.toLowerCase();
    
    // Pseudo-AI Mood Mapping based on climate
    let moodKeywords: string[] = [];
    if (w.includes('rain') || w.includes('storm')) {
      moodKeywords = ['sad', 'lofi', 'melancholy', 'chill', 'acoustic', 'slow', 'rain', 'heartbreak'];
    } else if (w.includes('sun') || w.includes('clear')) {
      moodKeywords = ['upbeat', 'dance', 'happy', 'party', 'pop', 'energy', 'fast'];
    } else if (w.includes('cloud')) {
      moodKeywords = ['relax', 'calm', 'indie', 'ambient', 'focus', 'soft', 'breeze'];
    } else if (w.includes('snow')) {
      moodKeywords = ['cozy', 'winter', 'acoustic', 'peaceful', 'warm'];
    } else {
      moodKeywords = ['chill', 'pop', 'hits'];
    }

    // Filter tracks by region first (loose match)
    let regionTracks = tracks.filter(t => 
      t.region?.toLowerCase() === userRegion.toLowerCase() || 
      t.region?.toLowerCase() === 'bollywood' ||
      userRegion.toLowerCase() === 'global'
    );
    
    // Fallback if region has too few tracks
    if (regionTracks.length < 5) regionTracks = tracks;

    // Score tracks based on mood keyword matches
    const scoredTracks = regionTracks.map(track => {
      let score = 0;
      const searchableText = `${track.title} ${track.artist} ${track.album} ${track.musicDirector} ${track.weather}`.toLowerCase();
      
      // Explicit weather match bonus
      if (track.weather?.toLowerCase() === w) score += 50;
      
      // Mood keyword analysis
      moodKeywords.forEach(keyword => {
        if (searchableText.includes(keyword)) score += 15;
      });
      
      // Add random entropy to simulate dynamic AI discovery
      score += Math.random() * 10;
      
      return { track, score };
    });

    // Sort by score descending and take top tracks
    return scoredTracks
      .sort((a, b) => b.score - a.score)
      .map(st => st.track)
      .slice(0, 10);
      
  }, [currentWeather, userRegion, tracks]);

  // Sleep Timer logic
  useEffect(() => {
    let interval: number;
    if (sleepTimerRemaining !== null && sleepTimerRemaining > 0) {
      interval = window.setInterval(() => {
        setSleepTimerRemaining(prev => {
          if (prev && prev <= 1) {
            setPlaybackState('paused');
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sleepTimerRemaining, setPlaybackState]);

  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isEqualizerEnabled, setIsEqualizerEnabled] = useState(false);
  const [eqBands, setEqBands] = useState([0, 0, 0, 0, 0, 0]);
  const [activeRegion, setActiveRegion] = useState('Tollywood');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedDirector, setSelectedDirector] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [selectedMix, setSelectedMix] = useState<{title: string, desc: string, coverUrl?: string, tracks: Track[]} | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    setSelectedAlbum(null);
    setSelectedDirector(null);
    setSelectedPlaylist(null);
  }, [sidebarNav]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveTrackMenu(null);
      setActivePlaylistMenu(null);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const moviePlots: Record<string, string> = {
    "Karuppu": "In a world where shadows dictate destiny, a reluctant hero must embrace the darkness to protect the light. Karuppu is an intense journey of power, betrayal, and ultimate redemption. The groundbreaking soundtrack elevates every moment of this epic saga.",
  };

  // Scroll ref & reveal observer
  const mainScrollRef = useRef<HTMLElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const scrollEl = mainScrollRef.current;
    if (!scrollEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-revealed');
            entry.target.classList.remove('scroll-hidden');
          } else {
            entry.target.classList.remove('scroll-revealed');
            entry.target.classList.add('scroll-hidden');
          }
        });
      },
      {
        root: scrollEl,
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const observeChildren = () => {
      const items = scrollEl.querySelectorAll('[data-scroll-reveal]');
      items.forEach((el) => observer.observe(el));
    };

    // Initial + re-observe on DOM changes
    observeChildren();
    const mutationObs = new MutationObserver(observeChildren);
    mutationObs.observe(scrollEl, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObs.disconnect();
    };
  }, [activeView, sidebarNav]);

  // Synchronize admin mode via query parameter or localStorage
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('secret')) {
      const secretVal = params.get('secret');
      if (secretVal === 'aura-admin-2026') {
        setAdminMode(true);
        localStorage.setItem('aura_admin_mode', 'true');
      } else {
        setAdminMode(false);
        localStorage.setItem('aura_admin_mode', 'false');
      }
      
      // Clean up URL parameters to keep it clean
      const newUrl = window.location.pathname + window.location.search.replace(/[?&]secret=[^&]*/, '').replace(/^&/, '?');
      window.history.replaceState({}, document.title, newUrl);
    } else {
      const savedAdmin = localStorage.getItem('aura_admin_mode');
      if (savedAdmin === 'true') {
        setAdminMode(true);
      }
    }
  }, [setAdminMode]);

  // If user starts searching, return to library view and switch to songs tab to show results
  React.useEffect(() => {
    if (searchQuery.trim()) {
      if (activeView !== 'library') {
        setActiveView('library');
      }
      if (sidebarNav === 'search' || sidebarNav === 'home') {
        setSidebarNav('songs');
      }
    }
  }, [searchQuery, activeView, sidebarNav]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchQueryLocal, setSearchQueryLocal] = useState('');
  const [upgradeModalFeature, setUpgradeModalFeature] = useState('');
  const [upgradeTargetTier, setUpgradeTargetTier] = useState<SubscriptionTier>('Premium');
  const [isLocating, setIsLocating] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistCover, setNewPlaylistCover] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [editingPlaylistOldName, setEditingPlaylistOldName] = useState<string | null>(null);
  const [activePlaylistMenu, setActivePlaylistMenu] = useState<string | null>(null);
  
  // Add Song Form States
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songAlbum, setSongAlbum] = useState('');
  const [songReleaseDate, setSongReleaseDate] = useState('');
  const [songMusicDirector, setSongMusicDirector] = useState('');
  const [songHero, setSongHero] = useState('');
  const [songRegion, setSongRegion] = useState('');
  const [songCoverUrl, setSongCoverUrl] = useState('');
  const [songAudio128k, setSongAudio128k] = useState('');
  const [songAudio320k, setSongAudio320k] = useState('');
  const [songAudioFlac, setSongAudioFlac] = useState('');
  const [songAudioAtmos, setSongAudioAtmos] = useState('');
  const [songLyrics, setSongLyrics] = useState('');
  const [songIsPremium, setSongIsPremium] = useState(false);
  const [songIsPremiumPlus, setSongIsPremiumPlus] = useState(false);

  const handleToggleLike = async (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    await toggleLike(trackId);
  };

  const handleSelectTrack = (track: Track, contextTracks?: Track[]) => {
    if (contextTracks && contextTracks.length > 0) {
      const trackIndex = contextTracks.findIndex(t => t.id === track.id);
      const upNext = trackIndex !== -1 ? contextTracks.slice(trackIndex + 1) : contextTracks;
      setQueue(upNext);
    } else {
      setQueue([]);
    }
    setCurrentTrack(track);
    setPlaybackState('playing');
  };

  const triggerUpgradePrompt = (feature: string, targetTier: SubscriptionTier) => {
    setUpgradeMessage(feature);
    setUpgradeTargetTier(targetTier);
    setShowUpgradeModal(true);
    logAnalyticsEvent(`Triggered Upgrade Prompt [Action: ${feature}]`);
  };

  const handleUpgrade = (tier: SubscriptionTier) => {
    setTier(tier);
    setShowUpgradeModal(false);
  };

  // Admin: Add Track handler
  const handleAddTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !songArtist.trim() || !songAudio128k.trim()) return;

    // Cover Art Fallback
    const coverUrl = songCoverUrl.trim() || 'https://picsum.photos/seed/music5/400/400';

    const newTrack: Track = {
      id: `track-${Date.now()}`,
      title: songTitle.trim(),
      artist: songArtist.trim(),
      album: songAlbum.trim() || 'Single',
      duration: '04:00',
      coverUrl,
      audioUrl128k: songAudio128k.trim(),
      audioUrl320k: songAudio320k.trim() || songAudio128k.trim(),
      audioUrlFlac: songAudioFlac.trim() || songAudio128k.trim(),
      audioUrlAtmos: songAudioAtmos.trim() || songAudio128k.trim(),
      isPremium: songIsPremium || songIsPremiumPlus,
      isPremiumPlus: songIsPremiumPlus,
      lyrics: songLyrics.trim() || undefined,
      releaseDate: songReleaseDate || undefined,
      musicDirector: songMusicDirector.trim() || undefined,
      hero: songHero.trim() || undefined,
      region: songRegion.trim() || undefined
    };

    addTrack(newTrack);

    // Reset Form fields
    setSongTitle('');
    setSongArtist('');
    setSongAlbum('');
    setSongReleaseDate('');
    setSongMusicDirector('');
    setSongHero('');
    setSongRegion('');
    setSongCoverUrl('');
    setSongAudio128k('');
    setSongAudio320k('');
    setSongAudioFlac('');
    setSongAudioAtmos('');
    setSongLyrics('');
    setSongIsPremium(false);
    setSongIsPremiumPlus(false);
  };

  // Search Filter
  const handleLocationVibe = async () => {
    try {
      setIsLocating(true);
      const coords = await getUserLocation();
      const [weather, region] = await Promise.all([
        getWeather(coords.latitude, coords.longitude),
        getRegionIndustry(coords.latitude, coords.longitude)
      ]);
      setCurrentWeather(weather);
      setUserRegion(region);
    } catch (error) {
      console.error("Failed to get location vibe:", error);
      alert("Please allow location access in your browser to personalize your vibe.");
    } finally {
      setIsLocating(false);
    }
  };

  const filteredTracks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return tracks;

    const terms = query.split(/\s+/);

    return tracks
      .map(track => {
        let score = 0;
        const title = track.title.toLowerCase();
        const artist = track.artist.toLowerCase();
        const album = track.album?.toLowerCase() || '';
        const director = track.musicDirector?.toLowerCase() || '';
        const hero = track.hero?.toLowerCase() || '';
        const allText = `${title} ${artist} ${album} ${director} ${hero}`;

        // Exact match boosts
        if (title === query) score += 100;
        if (artist === query) score += 80;
        if (album === query) score += 70;

        // Prefix match boosts
        if (title.startsWith(query)) score += 50;
        if (artist.startsWith(query)) score += 40;

        // Substring match boosts
        if (title.includes(query)) score += 30;
        if (artist.includes(query)) score += 20;
        if (album.includes(query)) score += 15;
        if (director.includes(query)) score += 10;
        if (hero.includes(query)) score += 10;

        // Term-by-term matching (for partial queries like "anirudh leo")
        let matchedTerms = 0;
        terms.forEach(term => {
          if (title.includes(term)) { score += 5; matchedTerms++; }
          else if (artist.includes(term)) { score += 4; matchedTerms++; }
          else if (album.includes(term)) { score += 3; matchedTerms++; }
          else if (allText.includes(term)) { score += 1; matchedTerms++; }
        });

        // Require at least some terms to match if no direct substring match
        if (matchedTerms === 0 && score === 0) return { track, score: 0 };

        // Boost if all terms matched somewhere
        if (matchedTerms === terms.length) score += 25;

        return { track, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.track);
  }, [tracks, searchQuery]);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    if (editingPlaylistOldName) {
      updatePlaylist(editingPlaylistOldName, newPlaylistName, newPlaylistCover.trim() || undefined);
    } else {
      createPlaylist(newPlaylistName, newPlaylistCover.trim() || undefined);
    }
    
    setNewPlaylistName('');
    setNewPlaylistCover('');
    setIsCreatingPlaylist(false);
    setEditingPlaylistOldName(null);
  };

  const handleDownload = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userTier === 'Free') {
      triggerUpgradePrompt('download songs offline', 'Premium');
      return;
    }
    downloadTrack(trackId);
  };

  // Theme styling configurations
  const themeStyles = {
    slate: {
      bg: 'bg-shadow',
      accentText: 'text-slate-default',
      accentBg: 'bg-slate-default/15',
      accentBorder: 'border-slate-default/25',
      glow: 'shadow-[0_0_15px_rgba(58,82,86,0.25)]',
      sidebarGlow: 'from-slate-default/10 via-silver/5 to-transparent'
    },
    cyberpunk: {
      bg: 'bg-shadow',
      accentText: 'text-teal',
      accentBg: 'bg-teal/15',
      accentBorder: 'border-teal/25',
      glow: 'shadow-[0_0_15px_rgba(24, 61, 61,0.25)]',
      sidebarGlow: 'from-teal/10 via-deepblue/5 to-transparent'
    },
    gold: {
      bg: 'bg-shadow',
      accentText: 'text-[#fbbf24]',
      accentBg: 'bg-[#fbbf24]/10',
      accentBorder: 'border-[#fbbf24]/25',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.25)]',
      sidebarGlow: 'from-[#fbbf24]/10 via-ocean/5 to-transparent'
    },
    emerald: {
      bg: 'bg-shadow',
      accentText: 'text-[#10b981]',
      accentBg: 'bg-[#10b981]/10',
      accentBorder: 'border-[#10b981]/25',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      sidebarGlow: 'from-[#10b981]/10 via-slate-default/5 to-transparent'
    }
  };

  const activeThemeStyle = themeStyles[activeTheme] || themeStyles.slate;

  const handleAddToQueue = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (queue.some(t => t.id === track.id)) {
      showToastMessage("This song is already in your queue", "info");
    } else {
      setQueue([...queue, track]);
      showToastMessage(`Added "${track.title}" to Queue`, "success");
    }
    setActiveTrackMenu(null);
  };

  const handleOpenPlaylistModal = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    setTrackToAddPlaylist(trackId);
    setActiveTrackMenu(null);
  };

  const handleAddToPlaylist = (playlistName: string) => {
    if (trackToAddPlaylist) {
      const targetPlaylist = playlists.find(p => p.name === playlistName);
      if (targetPlaylist && targetPlaylist.trackIds.includes(trackToAddPlaylist)) {
        showToastMessage("This song is already in the playlist", "error");
      } else {
        addTrackToPlaylist(playlistName, trackToAddPlaylist);
        const trackObj = tracks.find(t => t.id === trackToAddPlaylist);
        showToastMessage(`Added "${trackObj?.title || 'song'}" to playlist "${playlistName}"`, "success");
      }
      setTrackToAddPlaylist(null);
    }
  };

  // ==================== AUTHENTICATION GATE ====================
  if (!currentUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[color:var(--color-onyx)] text-white relative overflow-hidden font-sans">
        {/* Immersive Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] rounded-full blur-[150px] mix-blend-screen animate-pulse-slow bg-[color:var(--color-teal)] opacity-15" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[180px] mix-blend-screen bg-[color:var(--color-ocean)] opacity-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full blur-[120px] mix-blend-screen animate-pulse bg-[color:var(--color-deepblue)] opacity-10" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04]" />
        </div>

        {/* Centralized Glass Modal */}
        <div className="z-10 w-full max-w-md px-6 relative">
          
          {/* Logo & Tagline cleanly integrated above card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center gap-2 mb-6"
          >
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-[0.3em] uppercase font-display text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">AURA</h1>
              <p className="mt-1 text-[10px] font-mono tracking-[0.2em] uppercase text-[color:var(--color-teal)] drop-shadow-md">The Future of Audio</p>
            </div>
          </motion.div>

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full bg-black/40 backdrop-blur-[40px] border border-white/10 rounded-[2rem] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.8)] relative overflow-hidden group"
          >
            {/* Edge Glow */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-gradient-to-br from-[color:var(--color-teal)] via-transparent to-[color:var(--color-ocean)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] opacity-80 bg-gradient-to-r from-transparent via-[color:var(--color-teal)] to-transparent shadow-[0_0_20px_var(--color-teal)]" />

            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-8 relative z-10">
              <button
                onClick={() => { setAuthTab('login'); setAuthError(null); setAuthSuccess(null); }}
                className={`flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-colors ${authTab === 'login' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthTab('signup'); setAuthError(null); setAuthSuccess(null); setPasswordErrors([]); }}
                className={`flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-colors ${authTab === 'signup' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Sign Up
              </button>
              {/* Animated active indicator */}
              <div 
                className="absolute bottom-[-1px] h-[2px] w-1/2 transition-transform duration-300 bg-[color:var(--color-teal)] shadow-[0_0_10px_var(--color-teal)]"
                style={{ transform: authTab === 'login' ? 'translateX(0%)' : 'translateX(100%)' }}
              />
            </div>

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {authError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 mb-6 rounded-xl border border-red-500/20 text-[#ff6b6b] bg-red-500/10 text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </motion.div>
                )}

                {authSuccess && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 mb-6 rounded-xl border text-[color:var(--color-teal)] text-xs font-semibold flex items-center gap-2 backdrop-blur-md" style={{ backgroundColor: 'rgba(147,177,166,0.1)', borderColor: 'rgba(147,177,166,0.2)' }}>
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>{authSuccess}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {authTab === 'login' ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAuthError(null);
                    const res = await logIn(loginEmail, loginPassword);
                    if (!res.success) setAuthError(res.error || 'Failed to sign in.');
                  }}
                  className="flex flex-col gap-5"
                >
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[color:var(--color-teal)] transition-colors z-10" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="peer w-full bg-white/5 border border-white/10 rounded-xl pt-5 pb-2 pl-11 pr-4 text-sm text-white placeholder-transparent focus:outline-none focus:border-[color:var(--color-teal)] focus:bg-white/10 focus:shadow-[0_0_15px_var(--color-teal)] transition-all"
                      placeholder="Email Address"
                    />
                    <label className="absolute left-11 top-1 text-[10px] uppercase font-mono transition-all peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[10px] text-slate-500 peer-focus:text-[color:var(--color-teal)] pointer-events-none">
                      Email Address
                    </label>
                  </div>
                  
                  <div className="relative group mt-2">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[color:var(--color-teal)] transition-colors z-10" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="peer w-full bg-white/5 border border-white/10 rounded-xl pt-5 pb-2 pl-11 pr-4 text-sm text-white placeholder-transparent focus:outline-none focus:border-[color:var(--color-teal)] focus:bg-white/10 focus:shadow-[0_0_15px_var(--color-teal)] transition-all"
                      placeholder="Password"
                    />
                    <label className="absolute left-11 top-1 text-[10px] uppercase font-mono transition-all peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[10px] text-slate-500 peer-focus:text-[color:var(--color-teal)] pointer-events-none">
                      Password
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="relative w-full mt-6 py-3.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2 group overflow-hidden active:scale-95 text-[color:var(--color-onyx)] bg-gradient-to-r from-[color:var(--color-teal)] to-[color:var(--color-ocean)] hover:shadow-[0_0_30px_var(--color-teal)]"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    <span className="relative z-10">{authLoading ? 'Authenticating...' : 'Enter AURA'}</span>
                    {!authLoading && <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAuthError(null);
                    setAuthSuccess(null);
                    setPasswordErrors([]);

                    if (signupPassword !== signupConfirmPassword) {
                      setAuthError('Passwords do not match.');
                      return;
                    }

                    const res = await signUp(signupUsername, signupEmail, signupPassword, signupAvatarUrl);
                    if (res.success) {
                      setAuthSuccess('Account created! Please check your email to verify your account.');
                      setSignupUsername('');
                      setSignupEmail('');
                      setSignupPassword('');
                      setSignupConfirmPassword('');
                      setAuthTab('login');
                    } else {
                      setAuthError(res.error || 'Failed to sign up.');
                      if (res.passwordErrors) setPasswordErrors(res.passwordErrors);
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="relative group mt-2">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[color:var(--color-teal)] transition-colors z-10" />
                    <input
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      required
                      className="peer w-full bg-white/5 border border-white/10 rounded-xl pt-5 pb-2 pl-11 pr-4 text-sm text-white placeholder-transparent focus:outline-none focus:border-[color:var(--color-teal)] focus:bg-white/10 focus:shadow-[0_0_15px_var(--color-teal)] transition-all"
                      placeholder="Username"
                    />
                    <label className="absolute left-11 top-1 text-[10px] uppercase font-mono transition-all peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[10px] text-slate-500 peer-focus:text-[color:var(--color-teal)] pointer-events-none">
                      Username
                    </label>
                  </div>

                  <div className="relative group mt-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[color:var(--color-teal)] transition-colors z-10" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="peer w-full bg-white/5 border border-white/10 rounded-xl pt-5 pb-2 pl-11 pr-4 text-sm text-white placeholder-transparent focus:outline-none focus:border-[color:var(--color-teal)] focus:bg-white/10 focus:shadow-[0_0_15px_var(--color-teal)] transition-all"
                      placeholder="Email Address"
                    />
                    <label className="absolute left-11 top-1 text-[10px] uppercase font-mono transition-all peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[10px] text-slate-500 peer-focus:text-[color:var(--color-teal)] pointer-events-none">
                      Email Address
                    </label>
                  </div>

                  <div className="mt-1">
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[color:var(--color-teal)] transition-colors z-10" />
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        className="peer w-full bg-white/5 border border-white/10 rounded-xl pt-5 pb-2 pl-11 pr-4 text-sm text-white placeholder-transparent focus:outline-none focus:border-[color:var(--color-teal)] focus:bg-white/10 focus:shadow-[0_0_15px_var(--color-teal)] transition-all"
                        placeholder="Password"
                      />
                      <label className="absolute left-11 top-1 text-[10px] uppercase font-mono transition-all peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[10px] text-slate-500 peer-focus:text-[color:var(--color-teal)] pointer-events-none">
                        Password
                      </label>
                    </div>
                    
                    {/* Password Strength Indicators */}
                    <div className="flex flex-col gap-1 mt-3 px-1 bg-black/20 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-[9px] font-mono">
                        <span className={signupPassword.length >= 10 ? 'drop-shadow-[0_0_5px_var(--color-teal)] text-[color:var(--color-teal)]' : 'text-slate-500'}>
                          {signupPassword.length >= 10 ? '✓' : '○'} 10+ characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-mono">
                        <span className={/[A-Z]/.test(signupPassword) ? 'drop-shadow-[0_0_5px_var(--color-teal)] text-[color:var(--color-teal)]' : 'text-slate-500'}>
                          {/[A-Z]/.test(signupPassword) ? '✓' : '○'} Uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-mono">
                        <span className={/[0-9]/.test(signupPassword) ? 'drop-shadow-[0_0_5px_var(--color-teal)] text-[color:var(--color-teal)]' : 'text-slate-500'}>
                          {/[0-9]/.test(signupPassword) ? '✓' : '○'} Number
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-mono">
                        <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(signupPassword) ? 'drop-shadow-[0_0_5px_var(--color-teal)] text-[color:var(--color-teal)]' : 'text-slate-500'}>
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(signupPassword) ? '✓' : '○'} Special character
                        </span>
                      </div>
                    </div>

                    {passwordErrors.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1 text-[10px] p-2 rounded-lg border border-red-500/20 text-[#ff6b6b] bg-red-500/10">
                        {passwordErrors.map((err, i) => <span key={i}>• {err}</span>)}
                      </div>
                    )}
                  </div>

                  <div className="mt-1">
                    <div className="relative group">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[color:var(--color-teal)] transition-colors z-10" />
                      <input
                        type="password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required
                        className={`peer w-full bg-white/5 border ${signupConfirmPassword && signupPassword !== signupConfirmPassword ? 'border-red-500/50 focus:border-red-400 focus:shadow-[0_0_15px_rgba(248,113,113,0.15)]' : 'border-white/10 focus:border-[color:var(--color-teal)] focus:shadow-[0_0_15px_var(--color-teal)]'} rounded-xl pt-5 pb-2 pl-11 pr-4 text-sm text-white placeholder-transparent focus:outline-none focus:bg-white/10 transition-all`}
                        placeholder="Confirm Password"
                      />
                      <label className={`absolute left-11 top-1 text-[10px] uppercase font-mono transition-all peer-placeholder-shown:text-slate-500 peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[10px] pointer-events-none ${signupConfirmPassword && signupPassword !== signupConfirmPassword ? 'text-red-400 peer-focus:text-red-400' : 'text-slate-500 peer-focus:text-[color:var(--color-teal)]'}`}>
                        Confirm Password
                      </label>
                      {signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-red-400 pointer-events-none">Mismatch</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={authLoading || (signupConfirmPassword !== '' && signupPassword !== signupConfirmPassword)}
                    className="relative w-full mt-4 py-3.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2 group overflow-hidden active:scale-95 text-[color:var(--color-onyx)] bg-gradient-to-r from-[color:var(--color-teal)] to-[color:var(--color-ocean)] hover:shadow-[0_0_30px_var(--color-teal)]"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    <span className="relative z-10">{authLoading ? 'Creating Account...' : 'Join AURA'}</span>
                    {!authLoading && <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </motion.form>
              )}
            </div>
            
            <p className="mt-8 text-center text-[10px] font-mono text-slate-500 relative z-10">
              By joining, you agree to the <span className="cursor-pointer hover:underline transition-colors text-[color:var(--color-teal)]">Terms of Service</span> & <span className="cursor-pointer hover:underline transition-colors text-[color:var(--color-teal)]">Privacy Policy</span>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }


  return (
    <div className={`h-screen overflow-hidden ${activeThemeStyle.bg} text-ink-primary flex flex-col relative select-none transition-colors duration-500 star-field`}>
      {currentUser && currentUser.onboardingComplete !== true && (
        <OnboardingWizard />
      )}
      {/* Ambient background blobs (atmosphere) */}
      <div className="ambient-blob free" />
      <div className="ambient-blob premium" />
      
      {/* Dynamic blurred cover background */}
      <AnimatePresence>
        {currentTrack?.coverUrl && (
          <motion.div 
            key={currentTrack.coverUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 pointer-events-none scale-110"
            style={{ 
              backgroundImage: `url(${currentTrack.coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(100px)',
              mixBlendMode: 'screen'
            }}
          />
        )}
      </AnimatePresence>

      {/* Add to Playlist Modal */}
      <AnimatePresence>
        {trackToAddPlaylist && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setTrackToAddPlaylist(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4"
            >
              <button 
                onClick={() => setTrackToAddPlaylist(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold font-display text-white">Add to Playlist</h3>
              
              {playlists.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scroll pr-2">
                  {playlists.map(p => (
                    <button
                      key={p.name}
                      onClick={() => handleAddToPlaylist(p.name)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-black/40 overflow-hidden shrink-0 flex items-center justify-center border border-white/5 group-hover:border-teal/30 transition-colors">
                        {p.coverUrl ? (
                          <img src={p.coverUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <FolderHeart className="w-5 h-5 text-teal/50" />
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-white truncate">{p.name}</span>
                        <span className="text-xs text-slate-400">{p.trackIds.length} tracks</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 flex flex-col items-center gap-3">
                  <FolderPlus className="w-8 h-8 text-slate-600" />
                  <p className="text-sm">You haven't created any playlists yet.</p>
                  <button 
                    onClick={() => {
                      setTrackToAddPlaylist(null);
                      setSidebarNav('playlists');
                      // Wait a tick before showing the create prompt
                      setTimeout(() => setIsCreatingPlaylist(true), 100);
                    }}
                    className="mt-2 text-teal text-sm hover:underline cursor-pointer font-bold"
                  >
                    Create a Playlist
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Outer grid containing Sidebar and Main Content */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 w-full p-4 md:px-6 md:py-5 gap-6 md:gap-8 relative z-10">
        
        {/* ================= SIDEBAR AREA ================= */}
        <aside className="hidden md:flex md:flex-col md:col-span-3 gap-5 overflow-y-auto custom-scroll sticky top-0 self-start max-h-full pb-20">
          {/* Logo Branding */}
          <div className={`glass-panel rounded-2xl p-5 border border-silver/8 flex items-center gap-3 bg-gradient-to-tr ${activeThemeStyle.sidebarGlow}`}>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-ocean to-teal flex items-center justify-center ${activeThemeStyle.glow}`}>
              <Crown className="w-4 h-4 text-ink-primary fill-current animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-widest text-ink-primary font-display">
              AURA
            </h1>
          </div>



          {/* User Tier Controller Card */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col gap-4 bg-gradient-to-b from-[#0c0f24]/30 to-black/25">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-ink-tertiary">Account Status</span>
              {userTier === 'Premium+' ? (
                <span className="text-[9px] uppercase font-mono tracking-widest text-ink-primary font-bold bg-gradient-to-r from-deepblue to-ocean px-2 py-0.5 rounded border border-teal/35 shadow-[0_0_8px_rgba(24, 61, 61,0.3)] flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5 fill-current" /> Premium+
                </span>
              ) : userTier === 'Premium' ? (
                <span className="text-[9px] uppercase font-mono tracking-widest text-teal font-bold bg-teal/10 px-2 py-0.5 rounded border border-teal/20 shadow-[0_0_8px_rgba(24, 61, 61,0.15)] flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5 fill-current" /> Premium
                </span>
              ) : (
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-300 font-bold bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  Free Player
                </span>
              )}
            </div>

            {userTier === 'Free' ? (
              <div className="flex flex-col gap-2.5">
                <p className="text-[10px] text-ink-secondary leading-normal">
                  Unlock ad-free streaming, 320kbps, spatial Atmos, custom themes & offline downloads.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => triggerUpgradePrompt("unlock Premium features", "Premium")}
                    className="py-2.5 btn-premium text-ink-primary font-bold text-[10px] rounded-xl cursor-pointer uppercase font-sans tracking-widest transition-all"
                  >
                    Premium
                  </button>
                  <button
                    onClick={() => triggerUpgradePrompt("unlock Lossless FLAC & Spatial Audio", "Premium+")}
                    className="py-2.5 btn-premium text-ink-primary font-bold text-[10px] rounded-xl cursor-pointer uppercase font-sans tracking-widest shimmer-sweep transition-all"
                  >
                    Premium+
                  </button>
                </div>
              </div>
            ) : userTier === 'Premium' ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => triggerUpgradePrompt("unlock Lossless FLAC, Spatial Atmos & custom themes", "Premium+")}
                  className="w-full py-2 btn-premium text-ink-primary font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer shimmer-sweep"
                >
                  <Crown className="w-3.5 h-3.5 fill-current text-ink-primary" /> Upgrade to Premium+
                </button>
                <button
                  onClick={() => setTier('Free')}
                  className="w-full py-1 text-[10px] text-ink-tertiary hover:text-teal hover:underline cursor-pointer"
                >
                  Cancel Plan (Reset Free)
                </button>
              </div>
            ) : (
              <button
                onClick={() => setTier('Free')}
                className="w-full py-2 bg-white/5 hover:bg-deepblue/10 border border-white/10 hover:border-deepblue/30 text-ink-secondary hover:text-ink-primary text-xs rounded-xl transition-all cursor-pointer font-mono"
              >
                Reset Membership (Free)
              </button>
            )}
          </div>

          {/* ============ Apple Music-style Navigation Card ============ */}
          <div className="glass-panel rounded-2xl border border-white/5 flex flex-col bg-gradient-to-b from-[#141216]/80 to-[#0a090b]/60 overflow-hidden">
            {/* Top Navigation Section */}
            <div className="flex flex-col">
              {[
                { id: 'search', label: 'Search', icon: Search, color: 'text-teal' },
                { id: 'albums', label: 'Albums', icon: Disc, color: 'text-teal' },
                { id: 'home', label: 'Home', icon: HomeIcon, color: 'text-teal' },
                { id: 'new', label: 'New', icon: Sparkles, color: 'text-teal' },
                { id: 'radio', label: 'Radio', icon: Radio, color: 'text-teal' },
              ].map((item) => {
                const isActive = sidebarNav === item.id && !selectedAlbum;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSidebarNav(item.id);
                      setSelectedAlbum(null);
                    }}
                    className={`group flex items-center gap-3 px-5 py-3 transition-all duration-200 cursor-pointer relative ${
                      isActive
                        ? 'bg-gradient-to-r from-teal/12 to-transparent'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-teal to-ocean rounded-r-full shadow-[0_0_8px_rgba(24, 61, 61,0.5)]" />
                    )}
                    <Icon className={`w-4 h-4 transition-colors duration-200 ${
                      isActive 
                        ? item.color 
                        : 'text-silver/60 group-hover:text-silver'
                    }`} />
                    <span className={`text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                      isActive 
                        ? 'text-ink-primary' 
                        : 'text-silver/70 group-hover:text-ink-secondary'
                    }`}>
                      {item.label}
                    </span>
                    {item.id === 'new' && (
                      <span className="ml-auto text-[8px] font-bold uppercase tracking-widest bg-gradient-to-r from-ocean to-teal text-black px-1.5 py-0.5 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.2)]">
                        New
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="mx-4 my-1 h-px bg-gradient-to-r from-transparent via-silver/10 to-transparent" />

            {/* Library Section */}
            <div className="flex flex-col">
              <div className="px-5 pt-3 pb-1.5">
                <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-silver/40 font-semibold">Library</span>
              </div>
              {[
                { id: 'songs', label: 'Songs', icon: ListMusic },
                { id: 'downloads', label: 'Downloads', icon: Download },
                { id: 'playlists', label: 'Playlist', icon: FolderHeart },
                { id: 'made-for-you', label: 'Made for You', icon: LayoutGrid },
              ].map((item) => {
                const isActive = sidebarNav === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSidebarNav(item.id);
                      setSelectedAlbum(null);
                    }}
                    className={`group flex items-center gap-3 px-5 py-2.5 transition-all duration-200 cursor-pointer relative ${
                      isActive
                        ? 'bg-gradient-to-r from-teal/12 to-transparent'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-gradient-to-b from-teal to-ocean rounded-r-full shadow-[0_0_8px_rgba(24, 61, 61,0.5)]" />
                    )}
                    <Icon className={`w-3.5 h-3.5 transition-colors duration-200 ${
                      isActive 
                        ? 'text-teal' 
                        : 'text-silver/40 group-hover:text-silver/70'
                    }`} />
                    <span className={`text-[12px] tracking-wide transition-colors duration-200 ${
                      isActive 
                        ? 'text-ink-primary font-medium' 
                        : 'text-silver/50 group-hover:text-silver/80'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom spacer */}
            <div className="h-2" />
          </div>


        </aside>

        {/* ================= MAIN CONTENT WINDOW ================= */}
        <main ref={mainScrollRef} className="md:col-span-9 flex flex-col gap-6 overflow-y-auto custom-scroll pb-40 md:pb-24 scroll-smooth">
          
          {/* Top Bar with Search Input & Account Action */}
          <div data-scroll-reveal className="flex gap-4 items-center w-full">
            <div className="flex-grow glass-panel rounded-2xl p-3 border border-silver/8 bg-graphite/45 flex items-center gap-3 transition-all duration-300 focus-within:border-teal/35 focus-within:shadow-[0_0_15px_rgba(24, 61, 61,0.1)]">
              <Search className="w-5 h-5 text-ink-secondary flex-shrink-0" />
              <input
                type="text"
                id="aura-search-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for songs, artists, or albums..."
                className="w-full bg-transparent border-none text-ink-primary placeholder-ink-tertiary focus:outline-none text-sm font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="p-1 hover:text-white text-ink-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setActiveView(activeView === 'profile' ? 'library' : 'profile')}
              className={`glass-panel rounded-2xl px-4 py-2 border border-silver/8 bg-graphite/45 flex items-center gap-2.5 hover:border-teal/30 hover:bg-teal/5 hover:shadow-[0_0_15px_rgba(24, 61, 61,0.1)] transition-all cursor-pointer h-12 flex-shrink-0 ${
                activeView === 'profile' ? 'border-teal/45 bg-teal/10 shadow-[0_0_15px_rgba(24, 61, 61,0.15)]' : ''
              }`}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-ocean to-teal p-0.5 flex-shrink-0">
                  <img
                    src={currentUser.avatarUrl || 'https://picsum.photos/seed/music6/400/400'}
                    className="w-full h-full object-cover rounded-full bg-graphite"
                    alt="Avatar"
                  />
                </div>
                <span className="hidden sm:inline text-xs font-bold text-ink-primary font-display truncate max-w-[100px]">
                  {currentUser.displayName}
                </span>
            </button>
          </div>
          
          {activeView === 'profile' ? (
            currentUser ? (
              // Profile Dashboard View
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="flex flex-col gap-6"
              >
                {/* Header Back Button & Title */}
                <div data-scroll-reveal className="flex items-center justify-between border-b border-white/5 pb-4">
                  <button
                    onClick={() => setActiveView('library')}
                    className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-teal transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to Library
                  </button>
                  <h2 className="text-sm font-bold text-white tracking-widest uppercase font-display flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal animate-pulse" /> Profile Dashboard
                  </h2>
                </div>

                {/* Profile Cover & Bio Card */}
                <div data-scroll-reveal className="glass-panel rounded-3xl p-6 border border-silver/8 bg-gradient-to-br from-graphite/40 to-transparent relative overflow-hidden flex flex-col gap-5">
                  {/* Subtle Background Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal/10 rounded-full filter blur-2xl pointer-events-none" />

                  {/* Profile Header Details */}
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-tr from-ocean to-teal p-1 relative z-10 flex-shrink-0 shadow-[0_0_20px_rgba(24, 61, 61,0.25)]">
                        <img
                          src={currentUser.avatarUrl || 'https://picsum.photos/seed/music7/400/400'}
                          className="w-full h-full object-cover rounded-full bg-graphite"
                          alt="Avatar"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-xl font-extrabold text-white tracking-wide font-display">
                            {currentUser.displayName}
                          </h1>
                          <span className={`text-[8.5px] uppercase font-mono tracking-widest font-bold px-2 py-0.5 rounded border ${
                            userTier === 'Premium+'
                              ? 'bg-gradient-to-r from-deepblue to-ocean border-teal/35 text-white shadow-[0_0_8px_rgba(24, 61, 61,0.3)]'
                              : userTier === 'Premium'
                              ? 'bg-teal/10 border-teal/20 text-teal shadow-[0_0_8px_rgba(24, 61, 61,0.15)]'
                              : 'bg-white/5 border-white/10 text-ink-secondary'
                          }`}>
                            {userTier}
                          </span>
                        </div>
                        <p className="text-xs text-ink-tertiary font-mono mt-0.5">{currentUser.email}</p>
                        <div className="flex items-center gap-1 text-[10px] text-ink-tertiary mt-2">
                          <Calendar className="w-3 h-3" /> Member since {currentUser.createdAt}
                        </div>
                      </div>
                    </div>

                    {!isEditingProfile && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditDisplayName(currentUser.displayName);
                            setEditBio(currentUser.bio || '');
                            setEditAvatarUrl(currentUser.avatarUrl || '');
                            setIsEditingProfile(true);
                            setAuthError(null);
                          }}
                          className="py-1.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-ink-primary font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-ink-secondary" /> Edit Profile
                        </button>
                        <button
                          onClick={() => setShowSleepTimerModal(true)}
                          className={`py-1.5 px-4 ${sleepTimerRemaining ? 'bg-teal/10 hover:bg-teal/20 border border-teal/20 hover:border-teal/30 text-teal' : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-ink-primary'} font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${sleepTimerRemaining ? 'text-teal' : 'text-ink-secondary'}`} /> {sleepTimerRemaining ? `${Math.ceil(sleepTimerRemaining / 60)}m left` : 'Sleep Timer'}
                        </button>
                        <button
                          onClick={() => {
                            logOut();
                            setActiveView('library');
                          }}
                          className="py-1.5 px-4 bg-deepblue/10 hover:bg-deepblue/20 text-teal border border-deepblue/20 hover:border-deepblue/30 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Log Out
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Profile Edit Mode vs Display Bio */}
                  {isEditingProfile ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!editDisplayName.trim()) {
                          setAuthError('Display Name cannot be blank!');
                          return;
                        }
                        updateProfile(editDisplayName, editBio, editAvatarUrl);
                        setIsEditingProfile(false);
                        setAuthError(null);
                      }}
                      className="border-t border-white/5 pt-5 flex flex-col gap-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] uppercase font-mono text-ink-tertiary">Display Name</span>
                          <input
                            type="text"
                            value={editDisplayName}
                            onChange={(e) => setEditDisplayName(e.target.value)}
                            placeholder="Display Name"
                            required
                            className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal/40"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] uppercase font-mono text-ink-tertiary">Avatar Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, setEditAvatarUrl)}
                            className="bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal/40 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-teal/20 file:text-teal hover:file:bg-teal/30 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Default Avatar Presets */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary">Or Select Premium Avatar Preset</span>
                        <div className="flex gap-3 overflow-x-auto py-1">
                          {[
                            { name: 'Producer', url: 'https://picsum.photos/seed/music8/400/400' },
                            { name: 'Vocalist', url: 'https://picsum.photos/seed/music9/400/400' },
                            { name: 'Composer', url: 'https://picsum.photos/seed/music10/400/400' },
                            { name: 'Audiophile', url: 'https://picsum.photos/seed/music11/400/400' },
                            { name: 'Astronaut', url: 'https://picsum.photos/seed/music12/400/400' }
                          ].map((avatar) => (
                            <button
                              key={avatar.name}
                              type="button"
                              onClick={() => setEditAvatarUrl(avatar.url)}
                              className={`flex-shrink-0 w-11 h-11 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                                editAvatarUrl === avatar.url ? 'border-teal' : 'border-white/10 hover:border-white/30'
                              }`}
                              title={avatar.name}
                            >
                              <img src={avatar.url} className="w-full h-full object-cover" alt="" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary">Custom Bio</span>
                        <textarea
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          placeholder="Tell us about your audio journey..."
                          rows={3}
                          className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal/40 font-sans"
                        />
                      </div>

                      {authError && (
                        <div className="p-2.5 rounded-xl bg-deepblue/20 border border-deepblue/40 text-teal text-[10px] font-mono">
                          ⚠️ {authError}
                        </div>
                      )}

                      <div className="flex justify-end gap-2.5 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setAuthError(null);
                          }}
                          className="py-2 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-ink-secondary hover:text-white text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-2 px-5 bg-gradient-to-r from-ocean to-teal text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-102 shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer"
                        >
                          Save Profile
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="border-t border-white/5 pt-4">
                      <span className="text-[9px] uppercase font-mono text-ink-tertiary block mb-1">About Me</span>
                      <p className="text-xs text-ink-secondary leading-relaxed bg-black/15 p-3 rounded-xl border border-white/5 italic">
                        {currentUser.bio || "🌌 No bio added yet. Explore the cosmos and add your description above!"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Listening Statistics Dashboards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Activity Stats Cards */}
                  <div className="flex flex-col gap-4">
                    <h3 className="font-display font-bold text-xs text-white tracking-wider uppercase flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-teal" /> Listening Metrics
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-black/20 flex flex-col gap-1 hover:border-teal/15 transition-all min-w-0">
                        <span className="text-[9px] font-mono text-ink-tertiary uppercase">Tracks Played</span>
                        <span className="text-2xl font-black text-white font-display tracking-tight truncate">
                          {currentUser.stats.tracksPlayed}
                        </span>
                        <span className="text-[8px] text-ink-tertiary truncate">All-time streams</span>
                      </div>
                      <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-black/20 flex flex-col gap-1 hover:border-teal/15 transition-all min-w-0">
                        <span className="text-[9px] font-mono text-ink-tertiary uppercase">Listening Time</span>
                        <span className="text-2xl font-black text-white font-display tracking-tight truncate">
                          {currentUser.stats.minutesListened} <span className="text-xs font-normal text-ink-secondary">min</span>
                        </span>
                        <span className="text-[8px] text-ink-tertiary truncate">Active playback</span>
                      </div>
                      <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-black/20 flex flex-col gap-1 hover:border-teal/15 transition-all min-w-0">
                        <span className="text-[9px] font-mono text-ink-tertiary uppercase">Favorite Genre</span>
                        <span className="text-xs font-extrabold text-white truncate font-sans tracking-wide mt-1">
                          {currentUser.stats.topGenre || 'None'}
                        </span>
                        <span className="text-[8px] text-ink-tertiary mt-auto truncate">Acoustic signature</span>
                      </div>
                      <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-black/20 flex flex-col gap-1 hover:border-teal/15 transition-all min-w-0">
                        <span className="text-[9px] font-mono text-ink-tertiary uppercase">Fav Artist</span>
                        <span className="text-xs font-extrabold text-white truncate font-sans tracking-wide mt-1">
                          {currentUser.stats.favArtist || 'None'}
                        </span>
                        <span className="text-[8px] text-ink-tertiary mt-auto truncate">Most streamed</span>
                      </div>
                    </div>

                    {/* Circular Weekly Progress Meter */}
                    <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-black/25 flex items-center justify-between gap-4">
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-white uppercase font-display">Weekly Listening Goal</span>
                        <p className="text-[9.5px] text-ink-secondary leading-normal">
                          Weekly target: 500 minutes. Keep streaming to hit your milestone!
                        </p>
                        <span className="text-[11px] text-teal font-mono font-bold mt-1">
                          {Math.min(Math.round((currentUser.stats.minutesListened / 500) * 100), 100)}% of goal reached
                        </span>
                      </div>

                      <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="6"
                            fill="transparent"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="url(#progress-gradient)"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={(2 * Math.PI * 34) * (1 - Math.min(currentUser.stats.minutesListened, 500) / 500)}
                            className="transition-all duration-1000 ease-out"
                          />
                          <defs>
                            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#BB0218" />
                              <stop offset="100%" stopColor="#F92D44" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="absolute text-[11px] font-bold font-mono text-white">
                          {currentUser.stats.minutesListened}m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings & Genre Distribution */}
                  <div id="settings-section" data-scroll-reveal className="flex flex-col gap-4">
                    <h3 className="font-display font-bold text-xs text-white tracking-wider uppercase flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-[#00d4ff]" /> Settings & Privacy
                    </h3>

                    {/* Toggles Console */}
                    <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-black/20 flex flex-col gap-4">
                      {/* Toggle 1: Public Profile */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-slate-400" /> Public Profile Dashboard
                          </span>
                          <span className="text-[9px] text-ink-tertiary max-w-[240px] leading-snug">
                            Allow other network users to discover your listening achievements and bio.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updatePrivacy({ isPublicProfile: !currentUser.privacy.isPublicProfile })}
                          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            currentUser.privacy.isPublicProfile ? 'bg-teal' : 'bg-white/10'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              currentUser.privacy.isPublicProfile ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="border-t border-white/5" />

                      {/* Toggle: Equalizer */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-slate-400" /> Audio Equalizer
                          </span>
                          <span className="text-[9px] text-ink-tertiary max-w-[240px] leading-snug">
                            Enable customized frequency bands for enhanced playback quality.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEqualizerEnabled(!isEqualizerEnabled)}
                          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isEqualizerEnabled ? 'bg-teal' : 'bg-white/10'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isEqualizerEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isEqualizerEnabled && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 pb-4">
                              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex justify-between items-end h-40 gap-2">
                                {eqBands.map((val, idx) => {
                                  const frequencies = ['60', '230', '910', '3.6k', '14k', 'Air'];
                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-3 h-full justify-end flex-1">
                                      <span className="text-[10px] font-mono text-teal font-bold">
                                        {val > 0 ? `+${val}` : val}
                                      </span>
                                      <div className="relative w-4 h-20 flex items-center justify-center my-2">
                                        <input
                                          type="range"
                                          min="-12"
                                          max="12"
                                          value={val}
                                          onChange={(e) => {
                                            const newBands = [...eqBands];
                                            newBands[idx] = parseInt(e.target.value);
                                            setEqBands(newBands);
                                          }}
                                          className="absolute w-20 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(24, 61, 61,0.6)] outline-none origin-center -rotate-90 hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                                        />
                                      </div>
                                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{frequencies[idx]}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="border-t border-white/5" />

                      {/* Toggle 2: Show Listening Activity */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-slate-400" /> Share Listening Activity
                          </span>
                          <span className="text-[9px] text-ink-tertiary max-w-[240px] leading-snug">
                            Broadcast currently playing track metadata in your public banner feeds.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updatePrivacy({ showListeningActivity: !currentUser.privacy.showListeningActivity })}
                          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            currentUser.privacy.showListeningActivity ? 'bg-teal' : 'bg-white/10'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              currentUser.privacy.showListeningActivity ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="border-t border-white/5" />

                      {/* Toggle 3: Playlists Private by Default */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-slate-400" /> Private Playlists by Default
                          </span>
                          <span className="text-[9px] text-ink-tertiary max-w-[240px] leading-snug">
                            New playlists created will default to private status unless manually shared.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updatePrivacy({ playlistsPrivateByDefault: !currentUser.privacy.playlistsPrivateByDefault })}
                          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            currentUser.privacy.playlistsPrivateByDefault ? 'bg-teal' : 'bg-white/10'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              currentUser.privacy.playlistsPrivateByDefault ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Genre Listening Intensity Graph */}
                    <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-black/25 flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-white uppercase font-display block">Genre Listen Intensity</span>
                      <div className="flex flex-col gap-3 mt-1">
                        <div>
                          <div className="flex justify-between text-[9px] font-mono text-ink-secondary mb-1">
                            <span>Electronic Synth</span>
                            <span>{currentUser.stats.tracksPlayed > 0 ? '70%' : '0%'}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-ocean to-teal transition-all duration-500"
                              style={{ width: currentUser.stats.tracksPlayed > 0 ? '70%' : '0%' }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] font-mono text-ink-secondary mb-1">
                            <span>Ambient Drone</span>
                            <span>{currentUser.stats.tracksPlayed > 0 ? '45%' : '0%'}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-slate-soft to-[#00d4ff] transition-all duration-500"
                              style={{ width: currentUser.stats.tracksPlayed > 0 ? '45%' : '0%' }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] font-mono text-ink-secondary mb-1">
                            <span>Atmos Lossless</span>
                            <span>{currentUser.stats.tracksPlayed > 0 ? '20%' : '0%'}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                              style={{ width: currentUser.stats.tracksPlayed > 0 ? '20%' : '0%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel rounded-3xl p-12 text-center text-ink-secondary border border-silver/8 flex flex-col gap-3 items-center justify-center">
                <User className="w-10 h-10 text-ink-tertiary animate-pulse" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Access Restricted</h3>
                <p className="text-xs text-ink-secondary">Please sign up or log in to view your listening metrics.</p>
                <button
                  onClick={() => alert("Please log in using the menu on the bottom left")}
                  className="mt-2 py-2 px-5 bg-gradient-to-r from-ocean to-teal text-black font-bold text-xs uppercase rounded-xl hover:scale-102 transition-transform cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  Authenticate
                </button>
              </div>
            )
          ) : (
            <>
              {selectedDirector ? (() => {
                const directorTracks = tracks.filter(t => t.musicDirector === selectedDirector || t.artist?.includes(selectedDirector) || t.hero?.includes(selectedDirector));
                const isHero = directorTracks.some(t => t.hero === selectedDirector);
                const directorAlbums = Array.from(new Set(directorTracks.map(t => t.album).filter(Boolean)));
                const latestAlbumName = directorAlbums[0];
                const latestAlbumTracks = directorTracks.filter(t => t.album === latestAlbumName);
                const topSongs = directorTracks.slice(0, 6);
                const isArtistLiked = currentUser?.likedArtists?.includes(selectedDirector);


                return (
                  <motion.div
                    key="director-profile"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-10 pb-10 relative pt-10"
                  >
                    <button 
                      onClick={() => setSelectedDirector(null)}
                      className="absolute top-0 left-0 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors text-slate-300 flex items-center gap-2 text-xs font-bold uppercase tracking-wider z-20"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      Back
                    </button>

                    {/* Circular Image Header */}
                    <div className="flex flex-col items-center justify-center pt-4 pb-6 border-b border-white/5 relative">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />
                       <div className="w-64 h-64 rounded-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 relative border-4 border-white/10">
                         <img src={getCover(selectedDirector, 'director', tracks)} alt={selectedDirector} className="w-full h-full object-cover" />
                       </div>
                    </div>

                    {/* Artist Name & Play Header */}
                    <div className="flex items-center justify-center md:justify-start gap-4 border-b border-white/5 pb-8">
                       <button 
                         onClick={() => topSongs[0] && handleSelectTrack(topSongs[0], topSongs)}
                         className="bg-teal hover:bg-teal/90 text-white p-4 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg flex-shrink-0"
                       >
                         <Play className="w-6 h-6 fill-current" />
                       </button>
                       <h2 className="text-4xl md:text-5xl font-black text-white font-display tracking-tight truncate">{selectedDirector}</h2>
                       {currentUser && (
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             toggleArtistLike(selectedDirector);
                           }}
                           className="ml-4 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0 group/like"
                         >
                           <Heart className={`w-6 h-6 transition-transform group-hover/like:scale-110 ${isArtistLiked ? 'text-teal fill-teal' : 'text-slate-400'}`} />
                         </button>
                       )}
                    </div>

                    {/* Latest Release & Top Songs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-white/5 pb-10">
                      {/* Latest Release */}
                      <div className="md:col-span-4 flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-white font-display tracking-wide flex items-center justify-between">
                          {isHero ? 'Latest Film' : 'Latest Release'}
                          <ChevronRight className="w-5 h-5 text-slate-500 cursor-pointer hover:text-white" />
                        </h3>
                        {latestAlbumName && (
                          <div 
                            className="flex flex-col gap-3 cursor-pointer group"
                            onClick={() => {
                               setSelectedAlbum(latestAlbumName);
                               setSelectedDirector(null);
                            }}
                          >
                            <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-lg bg-black/40">
                              <img src={latestAlbumTracks[0]?.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={latestAlbumName} />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Latest Release</span>
                              <span className="text-base font-bold text-white truncate mt-1 group-hover:text-teal transition-colors">{latestAlbumName} (Original Motion Picture Soundtrack)</span>
                              <span className="text-xs text-slate-400 mt-0.5">{latestAlbumTracks.length} song{latestAlbumTracks.length !== 1 && 's'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Top Songs */}
                      <div className="md:col-span-8 flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-white font-display tracking-wide flex items-center justify-between">
                          {isHero ? 'Popular Songs' : 'Top Songs'}
                          <ChevronRight className="w-5 h-5 text-slate-500 cursor-pointer hover:text-white" />
                        </h3>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {topSongs.map((track) => {
                            const isPlaying = currentTrack?.id === track.id;
                            return (
                              <div 
                                key={track.id}
                                onClick={() => handleSelectTrack(track)}
                                className={`flex items-center gap-4 p-2 rounded-xl cursor-pointer group transition-colors ${activeTrackMenu === track.id ? 'z-30 relative' : ''} ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'}`}
                              >
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative shadow-md">
                                  <img src={track.coverUrl} className="w-full h-full object-cover" alt={track.title} />
                                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    {isPlaying ? (
                                      <div className="flex gap-0.5 items-end h-3">
                                        <motion.div animate={{ height: [3, 8, 3] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white rounded-full" />
                                        <motion.div animate={{ height: [5, 12, 5] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-1 bg-white rounded-full" />
                                        <motion.div animate={{ height: [4, 7, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-1 bg-white rounded-full" />
                                      </div>
                                    ) : (
                                      <Play className="w-5 h-5 text-white fill-current" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col flex-1 overflow-hidden">
                                  <span className={`text-sm font-bold truncate ${isPlaying ? 'text-white' : 'text-slate-200'}`}>{track.title}</span>
                                  <span className="text-xs text-slate-400 truncate">{track.album}</span>
                                </div>
                                <div className="relative">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTrackMenu(activeTrackMenu === track.id ? null : track.id);
                                    }}
                                    className={`p-2 rounded-full transition-all text-slate-300 hover:bg-white/10 ${activeTrackMenu === track.id ? 'opacity-100 bg-white/10' : 'opacity-0 group-hover:opacity-100'}`}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                                  </button>
                                  
                                  <AnimatePresence>
                                    {activeTrackMenu === track.id && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl py-1.5 z-50 flex flex-col text-left"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          onClick={(e) => handleAddToQueue(e, track)}
                                          className="w-full px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors text-left"
                                        >
                                          <PlusCircle className="w-3.5 h-3.5 text-teal" />
                                          Add to Queue
                                        </button>
                                        <button
                                          onClick={(e) => handleOpenPlaylistModal(e, track.id)}
                                          className="w-full px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors text-left"
                                        >
                                          <FolderPlus className="w-3.5 h-3.5 text-teal" />
                                          Add to Playlist
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Discography / Albums */}
                    <div className="flex flex-col gap-4 pb-4">
                      <h3 className="text-xl font-bold text-white font-display tracking-wide flex items-center justify-between">
                        Albums
                        <div className="flex gap-2">
                          <button className="text-xs text-slate-400 hover:text-white font-bold uppercase tracking-widest flex items-center gap-1">See All <ChevronRight className="w-4 h-4" /></button>
                        </div>
                      </h3>
                      <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x">
                        {directorAlbums.map((albumName) => {
                          const albumTrack = directorTracks.find(t => t.album === albumName);
                          return (
                            <div 
                              key={albumName} 
                              onClick={() => {
                                setSelectedAlbum(albumName);
                                setSelectedDirector(null);
                              }}
                              className="min-w-[160px] w-[160px] flex flex-col gap-3 cursor-pointer group snap-start"
                            >
                              <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-lg bg-black/40">
                                <img src={albumTrack?.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={albumName} />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                <div className="absolute bottom-2 right-2 bg-teal text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg translate-y-2 group-hover:translate-y-0">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>
                              <div className="flex flex-col text-center px-1">
                                <span className="text-sm font-bold text-white truncate group-hover:text-teal transition-colors">{albumName}</span>
                                <span className="text-xs text-slate-400 truncate mt-0.5">{albumTrack?.releaseDate || '2026'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })() : selectedAlbum ? (() => {
                const albumTracks = tracks.filter(t => t.album === selectedAlbum);
                const firstTrack = albumTracks[0];
                if (!firstTrack) return null;
                return (
                  <motion.div
                    key="album-detail"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-8 pb-10"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row gap-8 md:items-end border-b border-white/5 pb-8 relative pt-10">
                      <button 
                        onClick={() => setSelectedAlbum(null)}
                        className="absolute top-0 left-0 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors text-slate-300 flex items-center gap-2 text-xs font-bold uppercase tracking-wider z-10"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                      </button>
                      
                      <div className="w-56 h-56 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex-shrink-0">
                        <img src={firstTrack.coverUrl} alt={selectedAlbum} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex flex-col gap-3 pb-2">
                        <h2 className="text-3xl md:text-4xl font-black text-white font-display tracking-wide">{selectedAlbum} <span className="text-xl text-slate-400 font-sans tracking-normal font-normal">(Original Motion Picture Soundtrack)</span></h2>
                        <div className="flex flex-col gap-1">
                          <span 
                            className="text-lg font-bold text-teal hover:text-white hover:underline cursor-pointer transition-colors w-max"
                            onClick={() => {
                              setSelectedDirector(firstTrack.musicDirector || firstTrack.artist.split(',')[0]);
                              setSelectedAlbum(null);
                            }}
                          >
                            {firstTrack.musicDirector || firstTrack.artist.split(',')[0]}
                          </span>
                          <span className="text-sm text-slate-400 font-mono uppercase tracking-widest">{firstTrack.region || 'Unknown'} • {firstTrack.releaseDate || '2026'}</span>
                        </div>
                        <p className="text-xs text-slate-500 max-w-xl mt-2 leading-relaxed">
                          {moviePlots[selectedAlbum] || `After establishing himself in the pop music world, composer-musician-singer ${firstTrack.musicDirector || 'this artist'} has quickly made a name for himself as an adept and exciting film soundtrack curator.`}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                          <button 
                            onClick={() => handleSelectTrack(albumTracks[0], albumTracks)}
                            className="bg-white hover:bg-white/90 text-black font-bold py-2.5 px-8 rounded-full flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                          >
                            <Play className="w-5 h-5 fill-current" /> Play
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tracklist Table */}
                    <div className="flex flex-col w-full">
                      {albumTracks.map((track, idx) => {
                        const isPlaying = currentTrack?.id === track.id;
                        return (
                          <div 
                            key={track.id}
                            onClick={() => handleSelectTrack(track, albumTracks)}
                            className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer group transition-colors ${activeTrackMenu === track.id ? 'z-30 relative' : ''} ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'}`}
                          >
                            <div className="w-8 flex justify-center">
                              {isPlaying ? (
                                <div className="flex gap-1 items-end h-4">
                                  <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-teal rounded-full" />
                                  <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-1 bg-teal rounded-full" />
                                  <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-1 bg-teal rounded-full" />
                                </div>
                              ) : (
                                <span className="text-sm text-slate-500 font-mono group-hover:hidden">{idx + 1}</span>
                              )}
                              <Play className={`w-4 h-4 text-white hidden ${!isPlaying && 'group-hover:block'}`} fill="currentColor" />
                            </div>
                            <div className="flex flex-col flex-1">
                              <span className={`text-sm font-bold ${isPlaying ? 'text-white' : 'text-slate-200'}`}>{track.title}</span>
                              <span className="text-xs text-slate-400">{track.artist}</span>
                            </div>
                            <div className="text-xs text-slate-500 font-mono w-12 text-right">
                              {track.duration}
                            </div>
                            <div className="relative ml-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTrackMenu(activeTrackMenu === track.id ? null : track.id);
                                }}
                                className={`p-2 rounded-full transition-all text-slate-300 hover:bg-white/10 ${activeTrackMenu === track.id ? 'opacity-100 bg-white/10' : 'opacity-0 group-hover:opacity-100'}`}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                              </button>
                              
                              <AnimatePresence>
                                {activeTrackMenu === track.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl py-1.5 z-50 flex flex-col text-left"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={(e) => handleAddToQueue(e, track)}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors text-left"
                                    >
                                      <PlusCircle className="w-3.5 h-3.5 text-teal" />
                                      Add to Queue
                                    </button>
                                    <button
                                      onClick={(e) => handleOpenPlaylistModal(e, track.id)}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors text-left"
                                    >
                                      <FolderPlus className="w-3.5 h-3.5 text-teal" />
                                      Add to Playlist
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })() : selectedPlaylist ? (() => {
                const targetPlaylist = playlists.find(p => p.name === selectedPlaylist) || COMMUNITY_PLAYLISTS.find(p => p.name === selectedPlaylist);
                if (!targetPlaylist) return null;
                const playlistTracks = tracks.filter(t => targetPlaylist.trackIds.includes(t.id));
                const coverImage = playlistTracks.length > 0 ? playlistTracks[0].coverUrl : 'https://picsum.photos/seed/music14/400/400';
                
                return (
                  <motion.div
                    key="playlist-detail"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-8 pb-10"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row gap-8 md:items-end border-b border-white/5 pb-8 relative pt-10">
                      <button 
                        onClick={() => setSelectedPlaylist(null)}
                        className="absolute top-0 left-0 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors text-slate-300 flex items-center gap-2 text-xs font-bold uppercase tracking-wider z-10"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                      </button>
                      
                      <div className="w-56 h-56 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex-shrink-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                        <img src={coverImage} alt={selectedPlaylist} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex flex-col gap-3 pb-2">
                        <h2 className="text-3xl md:text-4xl font-black text-white font-display tracking-wide">{selectedPlaylist} <span className="text-xl text-slate-400 font-sans tracking-normal font-normal">(Playlist)</span></h2>
                        <div className="flex flex-col gap-1">
                          <span className="text-lg font-bold text-teal w-max">
                            {currentUser?.username || 'You'}
                          </span>
                          <span className="text-sm text-slate-400 font-mono uppercase tracking-widest">{playlistTracks.length} tracks</span>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          <button 
                            onClick={() => playlistTracks.length > 0 && handleSelectTrack(playlistTracks[0], playlistTracks)}
                            className="bg-white hover:bg-white/90 text-black font-bold py-2.5 px-8 rounded-full flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={playlistTracks.length === 0}
                          >
                            <Play className="w-5 h-5 fill-current" /> Play
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tracks List */}
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-[16px_1fr_40px] md:grid-cols-[24px_1fr_1fr_40px] gap-4 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 mb-2">
                        <span>#</span>
                        <span>Title</span>
                        <span className="hidden md:block">Album</span>
                        <span></span>
                      </div>
                      
                      {playlistTracks.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 font-mono text-sm border border-dashed border-white/10 rounded-2xl">
                          No tracks in this playlist yet.
                        </div>
                      ) : (
                        playlistTracks.map((track, index) => {
                          const isPlaying = currentTrack?.id === track.id;
                          return (
                            <div 
                              key={track.id}
                              onClick={() => handleSelectTrack(track, playlistTracks)}
                              className={`group grid grid-cols-[16px_1fr_40px] md:grid-cols-[24px_1fr_1fr_40px] gap-4 items-center px-4 py-3 rounded-xl cursor-pointer transition-colors ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                              <span className="text-sm font-mono text-slate-500 flex justify-center">
                                {isPlaying ? <BarChart2 className="w-4 h-4 text-teal animate-pulse" /> : index + 1}
                              </span>
                              
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={track.coverUrl} className="w-10 h-10 rounded shadow-md hidden sm:block" alt={track.title} />
                                <div className="flex flex-col min-w-0">
                                  <span className={`text-sm font-bold truncate ${isPlaying ? 'text-teal' : 'text-white'}`}>{track.title}</span>
                                  <span className="text-xs text-slate-400 truncate">{track.artist}</span>
                                </div>
                              </div>
                              
                              <div className="hidden md:flex items-center min-w-0">
                                <span className="text-xs text-slate-400 truncate group-hover:text-slate-300 transition-colors">{track.album}</span>
                              </div>
                              
                              <div className="flex justify-center items-center relative">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTrackMenu(activeTrackMenu === track.id ? null : track.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white cursor-pointer"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                                </button>
                                
                                <AnimatePresence>
                                  {activeTrackMenu === track.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl py-1.5 z-50 flex flex-col text-left"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={(e) => handleAddToQueue(e, track)}
                                        className="w-full px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors text-left"
                                      >
                                        <PlusCircle className="w-3.5 h-3.5 text-teal" />
                                        Add to Queue
                                      </button>
                                      <button
                                        onClick={(e) => handleOpenPlaylistModal(e, track.id)}
                                        className="w-full px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors text-left"
                                      >
                                        <FolderPlus className="w-3.5 h-3.5 text-teal" />
                                        Add to Playlist
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                );
              })() : sidebarNav === 'home' ? (
                <div data-scroll-reveal className="flex flex-col gap-10 pb-10">
                  {/* Top: Getting Started & Radio */}
                  <div className="flex flex-col xl:flex-row gap-6">
                    {/* Getting Started Card */}
                    <div className="xl:w-[45%] relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-ocean/40 to-deepblue/60 border border-white/10 p-6 flex justify-between min-h-[240px] group cursor-pointer premium-card-hover">
                      <div className="flex flex-col justify-between relative z-10 w-[60%]">
                        <div className="mb-4">
                          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 group-hover:-translate-y-1 transition-transform duration-500">1. Start playing</h2>
                          <p className="text-white/90 text-sm leading-relaxed font-medium">Search, browse, and play your favorite artists and creators.</p>
                        </div>
                        <div className="flex items-center gap-4 mt-auto">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSidebarNav('search');
                            }}
                            className="px-6 py-2.5 bg-gradient-to-r from-ocean to-teal hover:scale-105 active:scale-95 text-black font-extrabold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                          >
                            Search
                          </button>
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTipsModal(true);
                            }}
                            className="text-white font-bold text-sm cursor-pointer hover:underline underline-offset-4 hidden sm:block"
                          >
                            Show more tips
                          </span>
                        </div>
                      </div>
                      
                      {/* Collage */}
                      <div className="absolute right-0 top-0 bottom-0 w-[45%] pointer-events-none hidden sm:block">
                         {tracks.slice(0, 4).map((t, i) => {
                           const rotations = ['rotate-12', '-rotate-6', 'rotate-3', '-rotate-12'];
                           const positions = [
                             'top-[-10%] right-[-10%]', 
                             'top-[20%] right-[15%]', 
                             'bottom-[-10%] right-[5%]',
                             'bottom-[10%] right-[30%]'
                           ];
                           const sizes = ['w-24 h-24', 'w-32 h-32', 'w-28 h-28', 'w-20 h-20'];
                           const delays = ['delay-0', 'delay-75', 'delay-150', 'delay-200'];
                           
                           return (
                             <div key={`collage-${i}`} className={`absolute ${positions[i]} ${sizes[i]} rounded-lg overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform ${rotations[i]} group-hover:scale-110 group-hover:rotate-0 transition-all duration-700 ${delays[i]}`}>
                               <img src={t.coverUrl} className="w-full h-full object-cover" alt="" />
                             </div>
                           );
                         })}
                      </div>
                    </div>

                    {/* Popular Radio */}
                    <div className="xl:flex-1 flex flex-col gap-3 min-w-0">
                      <div className="flex items-center justify-between px-1">
                         <h2 className="text-xl font-extrabold text-white">Popular radio</h2>
                         <span onClick={() => setSidebarNav('radio')} className="text-xs font-bold text-slate-300 hover:text-white cursor-pointer hover:underline">Show all</span>
                      </div>
                      <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x">
                         {[
                           { id: 'arijit', title: 'Arijit Singh', subtitle: 'With Pritam, Shreya Ghoshal...', bg: 'bg-gradient-to-br from-amber-500/20 to-black/40 border border-amber-500/20', artistQuery: 'Arijit' },
                           { id: 'arrahman', title: 'A.R. Rahman', subtitle: 'With Unnikrishnan, Hariharan...', bg: 'bg-gradient-to-br from-rose-500/20 to-black/40 border border-rose-500/20', artistQuery: 'Rahman' },
                           { id: 'anirudh', title: 'Anirudh', subtitle: 'With Dhanush, Jonita Gandhi...', bg: 'bg-gradient-to-br from-teal/20 to-black/40 border border-teal/20', artistQuery: 'Anirudh' },
                           { id: 'sid', title: 'Sid Sriram', subtitle: 'With Thaman S, Hesham Abdul...', bg: 'bg-gradient-to-br from-indigo-500/20 to-black/40 border border-indigo-500/20', artistQuery: 'Sid Sriram' }
                         ].map((radio, i) => {
                            const radioTracks = tracks.filter(t => t.artist.includes(radio.artistQuery) || t.musicDirector?.includes(radio.artistQuery) || t.title.includes(radio.artistQuery));
                            const displayTracks = radioTracks.length >= 3 ? radioTracks : [...tracks].sort(() => 0.5 - Math.random()).slice(0, 3);
                            
                            return (
                              <div key={i} className={`glass-panel min-w-[190px] w-[190px] h-[210px] rounded-3xl ${radio.bg} p-4 flex flex-col justify-between relative group cursor-pointer overflow-hidden snap-start premium-card-hover`}>
                                <div className="flex justify-end">
                                  <span className="text-[10px] font-black text-white/50 tracking-widest">RADIO</span>
                                </div>
                                
                                {/* Overlapping Circles */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] flex items-center justify-center w-[120%] h-[120px] scale-110 group-hover:scale-[1.20] transition-transform duration-500">
                                   <div className="w-16 h-16 rounded-full overflow-hidden shadow-xl absolute left-2 z-10 opacity-90 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-500">
                                     <img src={displayTracks[1]?.coverUrl} className="w-full h-full object-cover" alt="" />
                                   </div>
                                   <div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl z-30 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-shadow duration-500">
                                     <img src={displayTracks[0]?.coverUrl} className="w-full h-full object-cover" alt="" />
                                   </div>
                                   <div className="w-16 h-16 rounded-full overflow-hidden shadow-xl absolute right-2 z-20 opacity-90 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                                     <img src={displayTracks[2]?.coverUrl} className="w-full h-full object-cover" alt="" />
                                   </div>
                                   
                                   {/* Play Button Overlay */}
                                   <div 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       if (radioTracks.length > 0) handleSelectTrack(radioTracks[0], radioTracks);
                                     }}
                                     className="absolute bottom-2 right-[25%] w-10 h-10 bg-teal rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(147,177,166,0.4)] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50 hover:scale-110 hover:bg-teal/90 active:scale-95"
                                   >
                                     <Play className="w-5 h-5 text-white fill-white ml-1" />
                                   </div>
                                </div>
                                
                                <div className="flex flex-col z-10 relative">
                                  <h3 className="text-[17px] font-black text-white tracking-tight group-hover:text-teal transition-colors truncate">{radio.title}</h3>
                                  <p className="text-[10px] text-slate-300 font-semibold truncate mt-0.5">{radio.subtitle}</p>
                                </div>
                              </div>
                            );
                         })}
                      </div>
                    </div>
                  </div>
                  {/* Weather & Region Vibe Banner */}
                  <div className="flex flex-col gap-4 relative overflow-hidden rounded-3xl glass-panel p-8 border border-white/10 bg-gradient-to-br from-indigo-950/40 via-black/40 to-ocean/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal/20 rounded-full filter blur-[80px] pointer-events-none" />
                    <div className="flex justify-between items-center z-10">
                      <div className="flex flex-col gap-2 max-w-xl">
                        <h2 className="font-display font-black text-2xl text-white tracking-wider flex items-center gap-3">
                          <Globe className="w-6 h-6 text-teal" /> Personalize your Vibe
                        </h2>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          Allow AURA to detect your location and climate, and we will automatically categorize your music feed with the perfect tracks for your weather and regional film industry!
                        </p>
                      </div>
                      <button 
                        onClick={handleLocationVibe}
                        disabled={isLocating}
                        className="py-3 px-6 bg-gradient-to-r from-ocean to-teal text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                      >
                        {isLocating ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Detecting...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Get My Vibe</>
                        )}
                      </button>
                    </div>

                    {/* Vibe Results */}
                    <AnimatePresence>
                      {currentWeather && userRegion && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                          className="pt-6 border-t border-white/10 z-10"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md border border-white/5 flex items-center gap-1.5">
                              {currentWeather === 'Rainy' || currentWeather === 'Stormy' ? '🌧️' : currentWeather === 'Snowy' ? '❄️' : currentWeather === 'Sunny' ? '☀️' : '☁️'} {currentWeather} Day
                            </span>
                            <span className="px-3 py-1 bg-teal/20 text-teal rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-teal/20">
                              {userRegion}
                            </span>
                          </div>
                          
                          <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x">
                            {vibeTracks.length > 0 ? (
                              vibeTracks.map((track) => (
                                <div key={track.id} onClick={() => handleSelectTrack(track)} className="min-w-[140px] w-[140px] flex flex-col gap-2 cursor-pointer group snap-start premium-card-hover">
                                  <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-lg premium-image-hover">
                                    <img src={track.coverUrl} className="w-full h-full object-cover" alt={track.title} />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <div className="absolute bottom-2 right-2 bg-teal text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg translate-y-2 group-hover:translate-y-0">
                                      <Play className="w-3 h-3 fill-white" />
                                    </div>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white truncate group-hover:text-teal transition-colors">{track.title}</span>
                                    <span className="text-[10px] text-slate-400 truncate">{track.artist}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-slate-400 italic py-4">No matching tracks found for this vibe. Try exploring our global hits!</div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Hero / Mixes */}
                  <div className="flex flex-col gap-4">
                    <h2 className="font-display font-bold text-xl text-white tracking-wider flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal" /> Your Mixes
                    </h2>
                      <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x">
                        {(() => {
                          const likedTracksList = tracks.filter(t => currentUser?.likedTracks?.includes(t.id));
                          const explicitArtists = currentUser?.likedArtists || [];
                          
                          const mixes = [];
                          
                          // Mix 1: On Repeat (Randomized Liked Songs)
                          if (likedTracksList.length > 0) {
                            mixes.push({
                              title: 'On Repeat',
                              desc: 'Songs you love',
                              tracks: [...likedTracksList].sort(() => 0.5 - Math.random())
                            });
                          }
                          
                          // Mix 2: Favorite Artists Mix
                          if (explicitArtists.length > 0) {
                            const artistTracks = tracks.filter(t => explicitArtists.some(a => t.artist.includes(a) || t.hero?.includes(a) || t.musicDirector === a));
                            if (artistTracks.length > 0) {
                              mixes.push({
                                title: 'Favorite Artists Mix',
                                desc: 'Based on your likes',
                                tracks: artistTracks.sort(() => 0.5 - Math.random())
                              });
                            }
                            
                            // Mix 2.5: Individual Artist Mixes
                            explicitArtists.slice(0, 5).forEach(artist => {
                               const singleArtistTracks = tracks.filter(t => t.artist.includes(artist) || t.hero?.includes(artist) || t.musicDirector === artist);
                               if (singleArtistTracks.length >= 3) {
                                 mixes.push({
                                   title: `${artist} Mix`,
                                   desc: 'Made for you',
                                   tracks: singleArtistTracks.sort(() => 0.5 - Math.random())
                                 });
                               }
                            });
                          }

                          // Mix 3: Discovery Mix (Songs from same artists/directors but not liked)
                          if (likedTracksList.length > 0 || explicitArtists.length > 0) {
                            const discoveryTracks = tracks.filter(t => {
                               if (currentUser?.likedTracks?.includes(t.id)) return false;
                               const fromExplicitArtist = explicitArtists.some(a => t.artist.includes(a) || t.hero?.includes(a) || t.musicDirector === a);
                               const fromLikedTrackArtist = likedTracksList.some(lt => {
                                 const likedTrackArtists = lt.artist.split(', ');
                                 const currentTrackArtists = t.artist.split(', ');
                                 return likedTrackArtists.some(lta => currentTrackArtists.includes(lta)) || (lt.musicDirector && lt.musicDirector === t.musicDirector);
                               });
                               return fromExplicitArtist || fromLikedTrackArtist;
                            });
                            if (discoveryTracks.length > 0) {
                              mixes.push({
                                title: 'Discover Weekly',
                                desc: 'New recommendations',
                                tracks: discoveryTracks.sort(() => 0.5 - Math.random()).slice(0, 20)
                              });
                            }
                          }

                          // Fallbacks and Fillers to guarantee 10+ mixes
                          const generics = [
                            { title: 'Top Hits', desc: 'Global chart toppers', coverUrl: '/covers/mix_top_hits_1782360170480.png', tracks: [...tracks].sort(() => 0.5 - Math.random()).slice(0, 15) },
                            { title: 'Chill Vibes', desc: 'Relaxing tunes', coverUrl: '/covers/mix_chill_vibes_1782360181446.png', tracks: [...tracks].sort(() => 0.5 - Math.random()).slice(0, 15) },
                            { title: 'Workout Mix', desc: 'High energy', coverUrl: '/covers/mix_workout_1782360193898.png', tracks: [...tracks].sort(() => 0.5 - Math.random()).slice(0, 15) },
                            { title: 'Late Night Drive', desc: 'Night vibes', coverUrl: '/covers/mix_late_night_1782360208454.png', tracks: [...tracks].sort(() => 0.5 - Math.random()).slice(0, 15) },
                            { title: 'Daily Mix 1', desc: 'Made for you', coverUrl: '/covers/mix_top_hits_1782360170480.png', tracks: [...tracks].sort(() => 0.5 - Math.random()).slice(0, 15) },
                            { title: 'Upbeats', desc: 'Feel good songs', coverUrl: '/covers/mix_upbeats_1782360219265.png', tracks: [...tracks].sort(() => 0.5 - Math.random()).slice(0, 15) },
                            { title: 'Lo-Fi Chill', desc: 'Study beats', coverUrl: '/covers/mix_lofi_1782360233562.png', tracks: [...tracks].sort(() => 0.5 - Math.random()).slice(0, 15) },
                            { title: 'Tollywood Top 10', desc: 'Regional hits', coverUrl: '/covers/hero-images.jpg', tracks: tracks.filter(t => t.region === 'Tollywood').slice(0, 10) },
                            { title: 'Kollywood Top 10', desc: 'Regional hits', coverUrl: '/covers/hero-images.jpg', tracks: tracks.filter(t => t.region === 'Kollywood').slice(0, 10) },
                            { title: 'Bollywood Chartbusters', desc: 'Regional hits', coverUrl: '/covers/hero-images.jpg', tracks: tracks.filter(t => t.region === 'Bollywood').slice(0, 10) }
                          ].filter(m => m.tracks.length > 0);

                          for (const g of generics) {
                            if (mixes.length >= 10 && mixes.length > generics.length) break; 
                            if (!mixes.some(m => m.title === g.title)) {
                              mixes.push(g);
                            }
                          }

                          return mixes.map((mix, i) => (
                            <div key={i} onClick={() => { if (mix.tracks.length > 0) { setSelectedMix(mix as any); setSidebarNav('mix'); } }} className="min-w-[160px] w-[160px] glass-panel rounded-2xl p-4 flex flex-col gap-4 cursor-pointer transition-all snap-start group border border-white/5 hover:border-teal/30 premium-card-hover">
                              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-teal/20 relative overflow-hidden flex items-center justify-center premium-image-hover">
                                {(mix as any).coverUrl ? (
                                  <img src={(mix as any).coverUrl} className="w-full h-full object-cover" alt={mix.title} />
                                ) : (
                                  <Disc className="w-10 h-10 text-white/50" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-white truncate group-hover:text-teal transition-colors">{mix.title}</span>
                                <span className="text-[10px] text-slate-400 mt-0.5 truncate">{mix.desc}</span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                  </div>

                  {/* Liked Songs Preview */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end pr-2">
                      <h2 className="font-display font-bold text-xl text-white tracking-wider flex items-center gap-2">
                        <Heart className="w-5 h-5 text-teal fill-teal" /> Liked Songs & Favorites
                      </h2>
                      <span onClick={() => setSidebarNav('songs')} className="text-xs text-teal cursor-pointer hover:underline font-mono">View All</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tracks.filter(t => currentUser?.likedTracks?.includes(t.id)).slice(0, 6).map(track => (
                        <div key={track.id} onClick={() => handleSelectTrack(track)} className="glass-panel p-2 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all border border-transparent hover:border-white/10 group">
                          <img src={track.coverUrl} className="w-12 h-12 rounded-lg object-cover shadow-md" alt={track.title} />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-bold text-white truncate">{track.title}</span>
                            <span className="text-[10px] text-slate-400 truncate">{track.artist}</span>
                          </div>
                          <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-4 h-4 text-teal fill-teal" />
                          </button>
                        </div>
                      ))}
                      {tracks.filter(t => currentUser?.likedTracks?.includes(t.id)).length === 0 && (
                        <div className="col-span-full text-xs text-slate-500 font-mono py-4 text-center border border-dashed border-white/5 rounded-xl">
                          No liked songs yet. Start liking tracks!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Albums */}
                  <div className="flex flex-col gap-4">
                    <h2 className="font-display font-bold text-xl text-white tracking-wider flex items-center gap-2">
                      <Disc className="w-5 h-5 text-[#00d4ff]" /> Top Albums
                    </h2>
                    <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x">
                      {Array.from(new Set(tracks.map(t => t.album || t.title))).slice(0, 8).map((album, i) => {
                        const track = tracks.find(t => (t.album || t.title) === album)!;
                        return (
                        <div key={i} onClick={() => track.album ? setSelectedAlbum(track.album) : handleSelectTrack(track)} className="min-w-[140px] w-[140px] flex flex-col gap-2 cursor-pointer group snap-start">
                          <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-lg">
                            <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={album} />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            <div className="absolute bottom-2 right-2 bg-teal text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg translate-y-2 group-hover:translate-y-0">
                              <Play className="w-3 h-3 fill-white" />
                            </div>
                          </div>
                          <div className="flex flex-col px-1">
                            <span className="text-sm font-bold text-white truncate">{album}</span>
                            <span className="text-[10px] text-slate-400 truncate mt-0.5">{track.artist}</span>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>

                  {/* Playlists made by other users */}
                  <div className="flex flex-col gap-4">
                    <h2 className="font-display font-bold text-xl text-white tracking-wider flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" /> Community Playlists
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {COMMUNITY_PLAYLISTS.map((pl, i) => (
                        <div key={i} onClick={() => setSelectedPlaylist(pl.name)} className="glass-panel p-4 rounded-2xl flex flex-col gap-4 cursor-pointer hover:bg-white/5 hover:border-white/10 transition-all border border-transparent group shadow-md active:scale-[0.98] premium-card-hover">
                          <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-slate-800 to-[#121212] relative flex items-center justify-center overflow-hidden premium-image-hover">
                            {pl.coverUrl ? (
                              <img src={pl.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={pl.name} />
                            ) : (
                              <ListMusic className="w-8 h-8 text-slate-600 group-hover:scale-110 group-hover:text-emerald-500/50 transition-all duration-300" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white truncate group-hover:text-teal transition-colors">{pl.name}</span>
                            <span className="text-[10px] text-slate-400 truncate mt-0.5">By {pl.author} • {pl.trackIds.length} tracks</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : sidebarNav === 'songs' ? (
              <>
              {/* ADMIN: ADD SONG PANEL */}
              <AnimatePresence>
                {isAdminMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.98 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    className="overflow-hidden"
                  >
                    <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/15 to-transparent flex flex-col gap-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                          <FolderPlus className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-display">
                            Admin Song Registry
                          </h2>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            Add streamable songs with multi-bitrate links directly to AURA library.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleAddTrackSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left fields */}
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Song Title *</span>
                            <input
                              type="text"
                              value={songTitle}
                              onChange={(e) => setSongTitle(e.target.value)}
                              placeholder="e.g. Helix Symphony V"
                              required
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Artist Name *</span>
                            <input
                              type="text"
                              value={songArtist}
                              onChange={(e) => setSongArtist(e.target.value)}
                              placeholder="e.g. Helix Band"
                              required
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Album Name</span>
                            <input
                              type="text"
                              value={songAlbum}
                              onChange={(e) => setSongAlbum(e.target.value)}
                              placeholder="e.g. Helix World II"
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Release Date</span>
                            <input
                              type="date"
                              value={songReleaseDate}
                              onChange={(e) => setSongReleaseDate(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Music Director</span>
                            <input
                              type="text"
                              value={songMusicDirector}
                              onChange={(e) => setSongMusicDirector(e.target.value)}
                              placeholder="e.g. Anirudh"
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Hero / Actor</span>
                            <input
                              type="text"
                              value={songHero}
                              onChange={(e) => setSongHero(e.target.value)}
                              placeholder="e.g. Vijay"
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Region</span>
                            <select
                              value={songRegion}
                              onChange={(e) => setSongRegion(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/40"
                            >
                              <option value="">Select Region...</option>
                              <option value="Tollywood">Tollywood</option>
                              <option value="Bollywood">Bollywood</option>
                              <option value="Kollywood">Kollywood</option>
                              <option value="Hollywood">Hollywood</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Cover Art Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, setSongCoverUrl)}
                              className="bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Right fields (URLs) */}
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Audio URL (128kbps Standard) *</span>
                            <input
                              type="url"
                              value={songAudio128k}
                              onChange={(e) => setSongAudio128k(e.target.value)}
                              placeholder="e.g. https://domain.com/song_128.mp3"
                              required
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 font-mono"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Audio URL (320kbps High Quality)</span>
                            <input
                              type="url"
                              value={songAudio320k}
                              onChange={(e) => setSongAudio320k(e.target.value)}
                              placeholder="e.g. https://domain.com/song_320.mp3"
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 font-mono"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Audio URL (FLAC Lossless)</span>
                            <input
                              type="url"
                              value={songAudioFlac}
                              onChange={(e) => setSongAudioFlac(e.target.value)}
                              placeholder="e.g. https://domain.com/song.flac"
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 font-mono"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-mono text-slate-455">Audio URL (Atmos Spatial Mode)</span>
                            <input
                              type="url"
                              value={songAudioAtmos}
                              onChange={(e) => setSongAudioAtmos(e.target.value)}
                              placeholder="e.g. https://domain.com/song_atmos.mp3"
                              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 font-mono"
                            />
                          </div>
                        </div>

                        {/* Middle Settings */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                          <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-2.5">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-semibold text-white">Premium Tier Lock</span>
                              <span className="text-[8.5px] text-slate-450">Premium subscribers only</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={songIsPremium}
                              onChange={(e) => setSongIsPremium(e.target.checked)}
                              className="w-4 h-4 accent-emerald-500 cursor-pointer"
                            />
                          </div>
                          <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-2.5">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-semibold text-white">Premium+ Tier Lock</span>
                              <span className="text-[8.5px] text-slate-450">Premium+ Atmos users only</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={songIsPremiumPlus}
                              onChange={(e) => {
                                setSongIsPremiumPlus(e.target.checked);
                                if (e.target.checked) setSongIsPremium(true);
                              }}
                              className="w-4 h-4 accent-emerald-500 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Lyrics textarea */}
                        <div className="md:col-span-2 flex flex-col gap-1">
                          <span className="text-[9px] uppercase font-mono text-slate-450">Song Lyrics</span>
                          <textarea
                            value={songLyrics}
                            onChange={(e) => setSongLyrics(e.target.value)}
                            placeholder="Paste lyrics here..."
                            rows={2}
                            className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 font-sans"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="md:col-span-2 flex justify-end">
                          <button
                            type="submit"
                            className="px-5 py-2 bg-gradient-to-r from-ocean to-teal text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_5px_15px_rgba(16,185,129,0.25)] hover:scale-102 active:scale-97 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4 text-slate-950" /> Add Song Registry
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Catalog View Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Catalog List (Colspan 2) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-display font-bold text-base text-white tracking-wider flex items-center gap-2">
                      <Music className="w-5 h-5 text-teal" /> 
                      {searchQuery ? `Search Results (${filteredTracks.length})` : 'AURA Library Catalog'}
                    </h2>
                  </div>

                  {filteredTracks.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-12 text-center text-ink-tertiary text-xs font-mono border border-silver/8 flex flex-col gap-2 items-center justify-center">
                      <Search className="w-8 h-8 text-ink-tertiary animate-pulse" />
                      <span>No songs matched your query. Add one via Admin Panel!</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredTracks.map((track, idx) => {
                        const isTrackLiked = !!currentUser?.likedTracks?.includes(track.id);
                        const isSelected = currentTrack?.id === track.id;
                        
                        const isDownloaded = downloadedTracks.includes(track.id);

                        return (
                          <div
                            data-scroll-reveal
                            data-delay={String((idx % 6) + 1)}
                            key={track.id}
                            onClick={() => handleSelectTrack(track)}
                            className={`group relative rounded-2xl glass-panel p-3 cursor-pointer transition-all duration-300 flex gap-3.5 border ${
                              activeTrackMenu === track.id ? 'overflow-visible z-30' : 'overflow-hidden'
                            } ${
                              isSelected 
                                ? 'border-teal/45 shadow-[0_8px_30px_rgba(24, 61, 61,0.15)] bg-gradient-to-r from-teal/10 to-transparent' 
                                : 'border-silver/8 hover:border-teal/30 hover:bg-teal/5 hover:shadow-[0_8px_25px_rgba(24, 61, 61,0.1)]'
                            }`}
                          >
                            {/* Art */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 relative flex-shrink-0">
                              <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {isSelected && playbackState === 'playing' ? (
                                  <Pause className="w-4 h-4 fill-current text-white" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current text-white ml-0.5" />
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="flex items-center gap-1">
                                <h3 className="font-display font-bold text-xs text-white truncate group-hover:text-teal transition-colors leading-tight">
                                  {track.title}
                                  {track.isPremiumPlus ? (
                                    <span className="text-[7px] uppercase font-mono tracking-widest text-teal font-bold bg-teal/10 px-1 py-0.5 rounded border border-teal/20 flex-shrink-0 ml-1">Plus</span>
                                  ) : track.isPremium ? (
                                    <span className="text-[7px] uppercase font-mono tracking-widest text-silver font-bold bg-silver/10 px-1 py-0.5 rounded border border-silver/20 flex-shrink-0 ml-1">Prem</span>
                                  ) : null}
                                </h3>
                              </div>
                              <span className="text-[10px] text-slate-400 truncate mt-0.5">{track.artist}</span>
                              <span className="text-[9px] text-slate-500 truncate">{track.album} • {track.duration}</span>
                            </div>

                            {/* Action overlays (like / download / playlist add) */}
                            <div className="flex flex-col items-end justify-between py-0.5 relative z-20">
                              <button
                                onClick={(e) => handleToggleLike(track.id, e)}
                                className="text-slate-450 hover:text-rose-455 p-0.5 cursor-pointer"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isTrackLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                              </button>

                              <div className="relative my-0.5">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTrackMenu(activeTrackMenu === track.id ? null : track.id);
                                  }}
                                  className={`p-0.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer ${activeTrackMenu === track.id ? 'bg-white/10 text-white' : ''}`}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                                </button>
                                
                                <AnimatePresence>
                                  {activeTrackMenu === track.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl py-1.5 z-50 flex flex-col text-left"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={(e) => handleAddToQueue(e, track)}
                                        className="w-full px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors text-left"
                                      >
                                        <PlusCircle className="w-3.5 h-3.5 text-teal" />
                                        Add to Queue
                                      </button>
                                      <button
                                        onClick={(e) => handleOpenPlaylistModal(e, track.id)}
                                        className="w-full px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors text-left"
                                      >
                                        <FolderPlus className="w-3.5 h-3.5 text-teal" />
                                        Add to Playlist
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div className="flex gap-1.5 items-center">
                                {isDownloaded && (
                                  <span className="text-[7px] font-mono text-emerald-450 uppercase tracking-wider font-bold">Offline</span>
                                )}
                                <button
                                  onClick={(e) => handleDownload(track.id, e)}
                                  className={`p-0.5 transition-colors cursor-pointer ${isDownloaded ? 'text-emerald-450' : 'text-slate-400 hover:text-white'}`}
                                  title="Download Offline"
                                >
                                  {isDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Area: Fav Artists (Colspan 1) */}
                <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
                  {/* Favourite Artists Card */}
                  {(() => {
                    // Derive unique liked artists with their cover & like count
                    const likedArtistMap = new Map<string, { name: string; coverUrl: string; count: number }>();
                    tracks.forEach((track) => {
                      if (currentUser?.likedTracks?.includes(track.id)) {
                        const existing = likedArtistMap.get(track.artist);
                        if (existing) {
                          existing.count += 1;
                        } else {
                          likedArtistMap.set(track.artist, { name: track.artist, coverUrl: track.coverUrl, count: 1 });
                        }
                      }
                    });
                    const favArtists = Array.from(likedArtistMap.values()).sort((a, b) => b.count - a.count);

                    return (
                      <div data-scroll-reveal className="glass-panel rounded-3xl p-5 border border-white/5 bg-black/25 flex flex-col gap-4 flex-grow min-h-0">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-teal" /> Fav Artists
                          </span>
                          <span className="text-[9.5px] font-mono text-slate-450">{favArtists.length} artists</span>
                        </div>

                        {favArtists.length === 0 ? (
                          <div className="text-center py-6 text-slate-500 text-[10px] font-mono border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 flex-grow">
                            <Heart className="w-5 h-5 text-slate-600" />
                            Like songs to see your fav artists here!
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scroll flex-grow min-h-0">
                            {favArtists.map((artist) => (
                              <div
                                key={artist.name}
                                className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-teal/5 hover:border-teal/15 transition-all group cursor-pointer"
                              >
                                {/* Artist Avatar */}
                                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 border-transparent group-hover:border-teal/30 transition-colors shadow-[0_0_10px_rgba(0,0,0,0.3)]">
                                  <img
                                    src={artist.coverUrl}
                                    alt={artist.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {/* Name & Count */}
                                <div className="flex flex-col flex-grow min-w-0">
                                  <span className="text-[11px] font-semibold text-white truncate group-hover:text-teal transition-colors">
                                    {artist.name}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">
                                    {artist.count} liked {artist.count === 1 ? 'song' : 'songs'}
                                  </span>
                                </div>
                                {/* Heart Icon */}
                                <Heart className="w-3.5 h-3.5 text-teal/50 fill-teal/50 flex-shrink-0 group-hover:text-teal group-hover:fill-teal transition-colors" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>

              </div>
              </>
              ) : sidebarNav === 'search' ? (
                /* ===== Dedicated Search Page ===== */
                <motion.div
                  key="search-page"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-6"
                >


                  {/* Browse Categories */}
                  <div className="flex flex-col gap-4">
                    <h2 data-scroll-reveal className="font-display font-bold text-base text-white tracking-wider flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-teal" /> Browse Categories
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {[
                        { name: 'Bollywood',    bg: 'from-[#c850c0] to-[#4158d0]', emoji: '🎬' },
                        { name: 'Pop',           bg: 'from-[#f857a6] to-[#ff5858]', emoji: '🎤' },
                        { name: 'Hip-Hop/Rap',   bg: 'from-[#667eea] to-[#764ba2]', emoji: '🎧' },
                        { name: 'Charts',        bg: 'from-[#b8cc1e] to-[#5b8c00]', emoji: '📊' },
                        { name: 'Live Music',    bg: 'from-[#2193b0] to-[#6dd5ed]', emoji: '🎸' },
                        { name: 'Concerts',      bg: 'from-[#e44d26] to-[#f16529]', emoji: '🎪' },
                        { name: 'Punjabi',       bg: 'from-[#8e2de2] to-[#4a00e0]', emoji: '🥁' },
                        { name: 'Tamil',         bg: 'from-[#b721ff] to-[#21d4fd]', emoji: '🎵' },
                        { name: 'Classical',     bg: 'from-[#c79081] to-[#dfa579]', emoji: '🎻' },
                        { name: 'Rock',          bg: 'from-[#434343] to-[#000000]', emoji: '🤘' },
                        { name: 'R&B/Soul',      bg: 'from-[#fc4a1a] to-[#f7b733]', emoji: '💿' },
                        { name: 'Electronic',    bg: 'from-[#00d2ff] to-[#3a7bd5]', emoji: '⚡' },
                        { name: 'Indie',         bg: 'from-[#ee9ca7] to-[#ffdde1]', emoji: '🌿' },
                        { name: 'K-Pop',         bg: 'from-[#ff6a88] to-[#ff99ac]', emoji: '💖' },
                        { name: 'Devotional',    bg: 'from-[#f2994a] to-[#f2c94c]', emoji: '🙏' },
                        { name: 'Chill',         bg: 'from-[#0f2027] via-[#203a43] to-[#2c5364]', emoji: '🌙' },
                        { name: 'Workout',       bg: 'from-[#f12711] to-[#f5af19]', emoji: '💪' },
                        { name: 'Romance',       bg: 'from-[#eb3349] to-[#f45c43]', emoji: '❤️' },
                        { name: 'Party',         bg: 'from-[#fc466b] to-[#3f5efb]', emoji: '🎉' },
                        { name: 'Lo-Fi',         bg: 'from-[#2c3e50] to-[#4ca1af]', emoji: '☕' },
                      ].map((cat, idx) => (
                        <div
                          key={cat.name}
                          data-scroll-reveal
                          data-delay={String((idx % 6) + 1)}
                          onClick={() => {
                            setSearchQuery(cat.name);
                            setSidebarNav('home');
                          }}
                          className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/3] border border-white/5 hover:border-white/15 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] active:scale-[0.98]"
                        >
                          {/* Gradient Background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${cat.bg} opacity-85 group-hover:opacity-100 transition-opacity duration-300`} />

                          {/* Subtle pattern overlay */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_60%)]" />

                          {/* Emoji icon */}
                          <div className="absolute top-3 left-3 text-2xl opacity-40 group-hover:opacity-70 transition-all duration-300 drop-shadow-lg z-10">
                            {cat.emoji}
                          </div>

                          {/* Angled Image */}
                          <div className="absolute -right-4 -bottom-2 w-20 h-20 sm:w-24 sm:h-24 rotate-[25deg] shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500 z-10">
                            <img 
                              src={`https://picsum.photos/seed/${cat.name.replace(/[^a-zA-Z]/g,'')}/150/150`} 
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                              alt="" 
                              loading="lazy"
                            />
                          </div>

                          {/* Category Name */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                            <span className="text-[14px] font-bold text-white font-display tracking-wide drop-shadow-md">
                              {cat.name}
                            </span>
                          </div>

                          {/* Hover shine */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : sidebarNav === 'albums' ? (
                (() => {
                  const globalAlbums = Array.from(new Set(tracks.map(t => t.album)));
                  const globalHeroes = Array.from(new Set(tracks.map(t => t.hero).filter(Boolean)));
                  const globalDirectors = Array.from(new Set(tracks.map(t => t.musicDirector).filter(Boolean)));

                  return (
                    /* ===== Dedicated Albums Page ===== */
                <motion.div
                  key="albums-page"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-10 pb-10"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <h2 className="text-xl font-extrabold text-white tracking-widest uppercase font-display flex items-center gap-2">
                      <Disc className="w-6 h-6 text-teal" /> Explore Albums
                    </h2>
                  </div>

                  {/* Movies / Albums */}
                  <div className="flex flex-col gap-6">
                    <h3 className="font-display font-bold text-lg text-white tracking-wider flex items-center gap-2">
                      <Play className="w-5 h-5 text-[#00d4ff]" /> Blockbuster Albums
                    </h3>
                    <div className="flex gap-5 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                      {globalAlbums.map((albumName) => {
                        const albumTrack = tracks.find(t => t.album === albumName);
                        return (
                          <div 
                            key={albumName} 
                            onClick={() => setSelectedAlbum(albumName)}
                            className="min-w-[160px] w-[160px] flex flex-col gap-3 cursor-pointer group snap-start premium-card-hover"
                          >
                            <div className="w-full aspect-square rounded-[20px] overflow-hidden relative shadow-lg bg-black/40 premium-image-hover">
                              <img src={albumName.toLowerCase().includes('leo') ? '/covers/Leo.jpg' : albumTrack?.coverUrl} className="w-full h-full object-cover" alt={albumName} />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                              <div className="absolute bottom-3 right-3 bg-teal text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_4px_15px_rgba(24,61,61,0.5)] translate-y-2 group-hover:translate-y-0">
                                <Play className="w-4 h-4 fill-white" />
                              </div>
                            </div>
                            <div className="flex flex-col items-center text-center">
                              <span className="text-sm font-bold text-white truncate w-full group-hover:text-teal transition-colors">{albumName}</span>
                              <span className="text-[10px] text-slate-400 font-mono uppercase mt-1">{albumTrack?.region || 'Global'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Music Directors */}
                  {globalDirectors.length > 0 && (
                    <div className="flex flex-col gap-6">
                      <h3 className="font-display font-bold text-lg text-white tracking-wider flex items-center gap-2">
                        <Music className="w-5 h-5 text-emerald-400" /> Legendary Composers
                      </h3>
                      <div className="flex gap-5 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                        {globalDirectors.map((director) => (
                          <div 
                            key={director} 
                            onClick={() => setSelectedDirector(director)} 
                            className="min-w-[220px] w-[220px] glass-panel rounded-[24px] p-5 flex flex-col items-center text-center gap-4 cursor-pointer group snap-start premium-card-hover"
                          >
                            <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 premium-image-hover border-4 border-white/5 group-hover:border-emerald-500/50 transition-colors">
                              <img src={getCover(director, 'director', tracks)} className="w-full h-full object-cover" alt={director} />
                            </div>
                            <div className="flex flex-col w-full">
                              <span className="text-sm font-bold text-white truncate w-full group-hover:text-emerald-400 transition-colors">{director}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Composer</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Artists */}
                  {globalHeroes.length > 0 && (
                    <div className="flex flex-col gap-6">
                      <h3 className="font-display font-bold text-lg text-white tracking-wider flex items-center gap-2">
                        <Mic2 className="w-5 h-5 text-purple-400" /> Featured Icons
                      </h3>
                      <div className="flex gap-5 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                        {globalHeroes.map((hero) => (
                          <div 
                            key={hero} 
                            onClick={() => setSelectedDirector(hero)} 
                            className="min-w-[140px] max-w-[140px] flex flex-col items-center gap-4 snap-start group cursor-pointer text-center premium-card-hover"
                          >
                            <div className="w-full aspect-square rounded-full overflow-hidden relative shadow-lg border-4 border-transparent group-hover:border-purple-500/50 transition-all premium-image-hover">
                              <img src={getCover(hero, 'hero', tracks)} className="w-full h-full object-cover" alt={hero} />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="flex flex-col w-full">
                              <span className="text-sm font-bold text-white truncate w-full group-hover:text-purple-400 transition-colors">{hero}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Lead</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
                );
              })()
              ) : sidebarNav === 'mix' && selectedMix ? (
                /* ===== Dedicated Mix Details Page ===== */
                <motion.div
                  key="mix-details"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-8 pb-10"
                >
                  <button onClick={() => setSidebarNav('home')} className="self-start flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider mb-2">
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                  </button>

                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex-shrink-0 relative group">
                      {selectedMix.coverUrl ? (
                        <img src={selectedMix.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={selectedMix.title} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-teal/20 flex items-center justify-center">
                          <Disc className="w-24 h-24 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="flex flex-col gap-4 justify-end h-full pt-4 md:pt-16">
                      <span className="text-xs font-bold text-teal uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> AI Curated Mix
                      </span>
                      <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">{selectedMix.title}</h1>
                      <p className="text-slate-400 text-sm md:text-base max-w-xl">{selectedMix.desc} • {selectedMix.tracks.length} tracks</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button 
                          onClick={() => handleSelectTrack(selectedMix.tracks[0], selectedMix.tracks)}
                          className="w-14 h-14 rounded-full bg-teal hover:bg-teal/90 hover:scale-105 flex items-center justify-center shadow-[0_0_30px_rgba(24,61,61,0.5)] transition-all cursor-pointer"
                        >
                          <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </button>
                        <button className="w-12 h-12 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 flex items-center justify-center transition-all">
                          <Heart className="w-5 h-5 text-white" />
                        </button>
                        <button className="w-12 h-12 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 flex items-center justify-center transition-all">
                          <Share2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col mt-4">
                    <div className="grid grid-cols-[16px_1fr_120px_50px] gap-4 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-4">
                      <span>#</span>
                      <span>Title</span>
                      <span>Album</span>
                      <span className="text-right">Time</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {selectedMix.tracks.map((track, i) => (
                        <div 
                          key={`${track.id}-${i}`}
                          onClick={() => handleSelectTrack(track, selectedMix.tracks)}
                          className="grid grid-cols-[16px_1fr_120px_50px] gap-4 px-4 py-3 items-center rounded-xl hover:bg-white/5 group cursor-pointer transition-colors"
                        >
                          <span className="text-xs text-slate-500 group-hover:hidden">{i + 1}</span>
                          <Play className="w-3 h-3 text-white fill-white hidden group-hover:block" />
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={track.coverUrl} className="w-10 h-10 rounded-md object-cover shadow-md" alt="" />
                            <div className="flex flex-col min-w-0">
                              <span className={`text-sm font-bold truncate ${currentTrack?.id === track.id ? 'text-teal' : 'text-white group-hover:text-teal'} transition-colors`}>{track.title}</span>
                              <span className="text-[10px] text-slate-400 truncate">{track.artist}</span>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 truncate hidden md:block">{track.album}</span>
                          <span className="text-xs text-slate-400 text-right">{track.duration || '3:45'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : sidebarNav === 'new' ? (
                /* ===== Dedicated New Releases Page ===== */
                (() => {
                  // Filter by release date, sort by newest, and keep only ONE track per album
                  const newTracks = tracks
                    .filter(t => t.releaseDate)
                    .sort((a, b) => new Date(b.releaseDate!).getTime() - new Date(a.releaseDate!).getTime())
                    .filter((track, index, self) => 
                      index === self.findIndex((t) => t.album === track.album)
                    );
                  
                  const heroTracks = newTracks.slice(0, 2);
                  const listTracks = newTracks.slice(2, 10); // Limit list to 8 diverse new songs

                  return (
                    <motion.div
                      key="new-page"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-10 pb-10"
                    >
                      {/* Page Header */}
                      <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-extrabold text-white tracking-widest uppercase font-display flex items-center gap-3">
                          <Sparkles className="w-8 h-8 text-teal animate-pulse" /> New
                        </h1>
                      </div>

                      {/* Hero Section */}
                      {heroTracks.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {heroTracks.map((track, i) => {
                            const isSelected = currentTrack?.id === track.id;
                            const isNMD = i === 1; // Add variety to the badge
                            return (
                              <div
                                key={track.id}
                                onClick={() => handleSelectTrack(track)}
                                className={`group relative rounded-[2rem] overflow-hidden cursor-pointer aspect-video md:aspect-[16/10] lg:aspect-[16/9] border ${
                                  isSelected ? 'border-teal shadow-[0_0_40px_rgba(147, 177, 166,0.2)]' : 'border-white/5 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                                } transition-all duration-500`}
                              >
                                <img src={track.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={track.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
                                
                                {/* Top Badges */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-teal/20 shadow-lg">
                                    {isNMD ? 'Hot Release' : 'New Release'}
                                  </span>
                                  {isSelected && playbackState === 'playing' ? (
                                    <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-black shadow-[0_0_20px_rgba(147, 177, 166,0.5)] animate-pulse">
                                      <Pause className="w-5 h-5 fill-current" />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 border border-white/20">
                                      <Play className="w-5 h-5 fill-current ml-0.5" />
                                    </div>
                                  )}
                                </div>

                                {/* Content Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-1 transform transition-transform duration-500 group-hover:-translate-y-2">
                                  <h3 className="text-2xl md:text-3xl font-black font-display text-white leading-tight drop-shadow-lg">
                                    {track.album || track.title}
                                  </h3>
                                  <p className="text-slate-300 text-sm md:text-base font-medium drop-shadow-md">
                                    {track.artist}
                                  </p>
                                  {track.musicDirector && (
                                    <p className="text-[10px] uppercase tracking-widest text-white/50 mt-2 font-mono">
                                      Director: {track.musicDirector}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Best New Songs List */}
                      {listTracks.length > 0 && (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                            <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                              Best New Songs <span className="text-teal text-xl">›</span>
                            </h2>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                            {listTracks.map((track) => {
                              const isSelected = currentTrack?.id === track.id;
                              return (
                                <div
                                  key={track.id}
                                  onClick={() => handleSelectTrack(track)}
                                  className={`group flex items-center gap-4 p-2 rounded-xl cursor-pointer transition-all border border-transparent ${
                                    isSelected 
                                      ? 'bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                                      : 'hover:bg-white/5 hover:border-white/10'
                                  }`}
                                >
                                  <div className="w-12 h-12 rounded-lg overflow-hidden relative flex-shrink-0 shadow-md">
                                    <img src={track.coverUrl} className="w-full h-full object-cover" alt={track.title} />
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                      {isSelected && playbackState === 'playing' ? (
                                        <Pause className="w-4 h-4 fill-current text-white" />
                                      ) : (
                                        <Play className="w-4 h-4 fill-current text-white ml-0.5" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-teal' : 'text-white group-hover:text-teal'} transition-colors`}>
                                      {track.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                      {track.artist}
                                    </p>
                                  </div>

                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-white">
                                    <MoreVertical className="w-4 h-4" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {newTracks.length === 0 && (
                        <div className="text-sm text-slate-500 font-mono py-12 text-center border border-dashed border-white/5 rounded-2xl">
                          No new releases available at the moment.
                        </div>
                      )}
                    </motion.div>
                  );
                })()
              ) : sidebarNav === 'downloads' ? (
                /* ===== Dedicated Downloads Page ===== */
                <motion.div
                  key="downloads-page"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-6 pb-10"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-xl font-extrabold text-white tracking-widest uppercase font-display flex items-center gap-2">
                      <Download className="w-6 h-6 text-teal" /> Downloaded Songs
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tracks
                      .filter(t => downloadedTracks.includes(t.id))
                      .map((track) => {
                      const isSelected = currentTrack?.id === track.id;

                      return (
                        <div
                          key={track.id}
                          onClick={() => {
                            if (userTier === 'Free') {
                              setUpgradeTargetTier('Premium');
                              setUpgradeMessage('Offline playback of downloaded songs requires a Premium subscription.');
                              setShowUpgradeModal(true);
                            } else {
                              handleSelectTrack(track);
                            }
                          }}
                          className={`group relative rounded-2xl glass-panel p-4 cursor-pointer overflow-hidden transition-all duration-300 flex flex-col gap-3 border ${
                            isSelected 
                              ? 'border-teal/45 shadow-[0_8px_30px_rgba(24, 61, 61,0.15)] bg-gradient-to-r from-teal/10 to-transparent' 
                              : 'border-silver/8 hover:border-teal/30 hover:bg-teal/5 hover:shadow-[0_8px_25px_rgba(24, 61, 61,0.1)]'
                          }`}
                        >
                          <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 relative flex-shrink-0">
                              <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {isSelected && playbackState === 'playing' ? (
                                  <Pause className="w-4 h-4 fill-current text-white" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current text-white ml-0.5" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <span className={`text-[10px] font-mono uppercase font-bold mb-1 tracking-wider flex items-center gap-1 ${userTier === 'Free' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {userTier === 'Free' ? <Lock className="w-3 h-3" /> : <Check className="w-3 h-3" />} 
                                {userTier === 'Free' ? 'Premium Required' : 'Offline Ready'}
                              </span>
                              <h3 className="font-display font-bold text-sm text-white truncate group-hover:text-teal transition-colors">
                                {track.title}
                              </h3>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {tracks.filter(t => downloadedTracks.includes(t.id)).length === 0 && (
                      <div className="col-span-full text-xs text-slate-500 font-mono py-8 text-center border border-dashed border-white/5 rounded-xl">
                        No downloaded songs. Download some tracks to listen offline!
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : sidebarNav === 'playlists' ? (
                /* ===== Dedicated Playlists Page ===== */
                <motion.div
                  key="playlists-page"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-6 pb-10"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-xl font-extrabold text-white tracking-widest uppercase font-display flex items-center gap-2">
                      <FolderHeart className="w-6 h-6 text-teal" /> Your Playlists
                    </h2>
                    <button
                      onClick={() => {
                        setIsCreatingPlaylist(!isCreatingPlaylist);
                        if (isCreatingPlaylist) {
                          setEditingPlaylistOldName(null);
                          setNewPlaylistName('');
                          setNewPlaylistCover('');
                        }
                      }}
                      className="px-4 py-2 bg-teal/10 text-teal hover:bg-teal hover:text-black rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {isCreatingPlaylist ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {isCreatingPlaylist ? 'Cancel' : 'Create Playlist'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isCreatingPlaylist && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleCreatePlaylist}
                        className="glass-panel p-5 rounded-2xl border border-teal/20 flex flex-col gap-4 overflow-hidden"
                      >
                        <h3 className="text-sm font-bold text-white tracking-wide">
                          {editingPlaylistOldName ? 'Edit Playlist Details' : 'New Playlist Details'}
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase font-mono text-slate-400">Playlist Name</label>
                            <input
                              type="text"
                              required
                              value={newPlaylistName}
                              onChange={(e) => setNewPlaylistName(e.target.value)}
                              placeholder="e.g. Late Night Vibes"
                              className="bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal/50"
                            />
                          </div>
                          <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase font-mono text-slate-400">Cover Image (Optional)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, setNewPlaylistCover)}
                              className="bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal/50 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-teal/10 file:text-teal hover:file:bg-teal/20 cursor-pointer"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="self-end px-6 py-2.5 bg-gradient-to-r from-ocean to-teal text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all cursor-pointer"
                        >
                          {editingPlaylistOldName ? 'Save Changes' : 'Create'}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                    {playlists.map(playlist => (
                      <div key={playlist.name} onClick={() => setSelectedPlaylist(playlist.name)} className="group relative rounded-3xl glass-panel p-4 transition-all duration-300 border border-silver/8 hover:border-teal/30 hover:bg-teal/5 cursor-pointer flex flex-col gap-4 active:scale-[0.98]">
                        <div className="w-full aspect-square rounded-2xl bg-black/40 overflow-hidden relative shadow-lg border border-white/5">
                          {playlist.coverUrl ? (
                            <img src={playlist.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={playlist.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-graphite to-black group-hover:scale-110 transition-transform duration-500">
                              <FolderHeart className="w-12 h-12 text-teal/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col truncate pr-2">
                              <h3 className="font-display font-bold text-base text-white truncate group-hover:text-teal transition-colors">
                                {playlist.name}
                              </h3>
                              <p className="text-xs text-slate-400 mt-1">{playlist.trackIds.length} tracks</p>
                            </div>
                            
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePlaylistMenu(activePlaylistMenu === playlist.name ? null : playlist.name);
                                }}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              <AnimatePresence>
                                {activePlaylistMenu === playlist.name && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute top-full right-0 mt-2 w-40 bg-carbon-black border border-white/5 rounded-xl shadow-2xl overflow-hidden z-30"
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (playlist.trackIds.length > 0) {
                                          const firstTrack = tracks.find(t => t.id === playlist.trackIds[0]);
                                          if (firstTrack) {
                                            setCurrentTrack(firstTrack);
                                            setPlaybackState('playing');
                                          }
                                        } else {
                                          alert("Playlist is empty!");
                                        }
                                        setActivePlaylistMenu(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-ink-primary hover:bg-white/5 hover:text-teal flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Play className="w-3.5 h-3.5" /> Play
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingPlaylistOldName(playlist.name);
                                        setNewPlaylistName(playlist.name);
                                        setNewPlaylistCover(playlist.coverUrl || '');
                                        setIsCreatingPlaylist(true);
                                        setActivePlaylistMenu(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-ink-primary hover:bg-white/5 hover:text-teal flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" /> Edit Playlist
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`Delete playlist "${playlist.name}"?`)) {
                                          deletePlaylist(playlist.name);
                                        }
                                        setActivePlaylistMenu(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-ink-primary hover:bg-white/5 hover:text-teal flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {playlists.length === 0 && !isCreatingPlaylist && (
                      <div className="col-span-full py-16 text-center text-slate-500 flex flex-col items-center gap-4">
                        <FolderHeart className="w-12 h-12 text-slate-700" />
                        <p className="font-mono text-sm">No playlists yet. Create one to organize your music.</p>
                        <button onClick={() => setIsCreatingPlaylist(true)} className="mt-2 text-xs text-teal hover:underline cursor-pointer">
                          Create Playlist
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : sidebarNav === 'made-for-you' ? (
                /* ===== Made For You Page ===== */
                (() => {
                  const likedSongTracks = tracks.filter(t => currentUser?.likedTracks?.includes(t.id));
                  
                  // Extract artists and directors from liked songs
                  const likedArtists = new Set(likedSongTracks.flatMap(t => t.artist.split(', ')));
                  const likedDirectors = new Set(likedSongTracks.map(t => t.musicDirector).filter(Boolean));

                  // Find recommendations: tracks not liked, but sharing artist or director
                  const recommendedTracks = tracks.filter(t => {
                    if (currentUser?.likedTracks?.includes(t.id)) return false;
                    const hasSharedArtist = t.artist.split(', ').some(a => likedArtists.has(a));
                    const hasSharedDirector = t.musicDirector && likedDirectors.has(t.musicDirector);
                    return hasSharedArtist || hasSharedDirector;
                  });
                  
                  // Shuffle and limit to 10 recommendations to keep it fresh
                  const shuffledRecommendations = [...recommendedTracks].sort(() => 0.5 - Math.random()).slice(0, 10);
                  
                  // Explicitly Liked Artists/Composers
                  const explicitlyLikedCreators = currentUser?.likedArtists || [];
                  const likedComposers = explicitlyLikedCreators.filter(name => tracks.some(t => t.musicDirector === name)).map(name => ({
                    name,
                    cover: getCover(name, 'director', tracks),
                    role: 'Music Director'
                  }));
                  
                  const favoriteArtists = explicitlyLikedCreators.filter(name => !tracks.some(t => t.musicDirector === name)).map(name => ({
                    name,
                    cover: getCover(name, 'hero', tracks),
                    role: tracks.some(t => t.hero === name) ? 'Lead Actor' : 'Singer/Artist'
                  }));

                  return (
                    <motion.div
                      key="made-for-you-page"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-10 pb-10"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="text-xl font-extrabold text-white tracking-widest uppercase font-display flex items-center gap-2">
                          <LayoutGrid className="w-6 h-6 text-teal" /> Made for You
                        </h2>
                      </div>

                      {likedSongTracks.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-4 border border-dashed border-white/5 rounded-3xl">
                          <Heart className="w-12 h-12 text-slate-700" />
                          <p className="font-mono text-sm max-w-sm">Your Made for You hub is empty. Like some songs to generate your personalized collections!</p>
                        </div>
                      ) : (
                        <>
                          {/* Liked Songs */}
                          <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-bold text-white tracking-widest uppercase font-display border-b border-white/10 pb-2">
                              Your Liked Songs <span className="text-slate-500 font-mono text-[10px] lowercase ml-2">({likedSongTracks.length} tracks)</span>
                            </h3>
                            <div className="flex gap-4 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                              {likedSongTracks.map(track => (
                                <div key={`song-${track.id}`} className="min-w-[140px] max-w-[140px] flex flex-col gap-2 snap-start group cursor-pointer active:scale-95 transition-transform" onClick={() => handleSelectTrack(track)}>
                                  <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-lg">
                                    <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={track.title} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white truncate group-hover:text-teal transition-colors">{track.title}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Liked Music Composers */}
                          {likedComposers.length > 0 && (
                            <div className="flex flex-col gap-4 mt-6">
                              <h3 className="text-sm font-bold text-white tracking-widest uppercase font-display border-b border-white/10 pb-2 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-teal fill-teal" /> Liked Music Composers
                              </h3>
                              <div className="flex gap-4 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                                {likedComposers.map(artist => (
                                  <div key={`liked-composer-${artist.name}`} onClick={() => setSelectedDirector(artist.name)} className="min-w-[120px] max-w-[120px] flex flex-col items-center gap-3 snap-start group cursor-pointer text-center active:scale-95 transition-transform">
                                    <div className="w-full aspect-square rounded-full overflow-hidden relative shadow-lg border-2 border-transparent group-hover:border-teal transition-all">
                                      <img src={artist.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={artist.name} />
                                    </div>
                                    <div className="flex flex-col">
                                      <p className="text-xs font-bold text-white line-clamp-2 group-hover:text-teal transition-colors">{artist.name}</p>
                                      <span className="text-[10px] text-slate-400 truncate mt-0.5">{artist.role}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Favorite Artists */}
                          {favoriteArtists.length > 0 && (
                            <div className="flex flex-col gap-4 mt-6">
                              <h3 className="text-sm font-bold text-white tracking-widest uppercase font-display border-b border-white/10 pb-2 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-purple-400 fill-purple-400" /> Favorite Artists & Heroes
                              </h3>
                              <div className="flex gap-4 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                                {favoriteArtists.map(artist => (
                                  <div key={`fav-artist-${artist.name}`} onClick={() => setSelectedDirector(artist.name)} className="min-w-[120px] max-w-[120px] flex flex-col items-center gap-3 snap-start group cursor-pointer text-center active:scale-95 transition-transform">
                                    <div className="w-full aspect-square rounded-full overflow-hidden relative shadow-lg border-2 border-transparent group-hover:border-purple-400 transition-all">
                                      <img src={artist.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={artist.name} />
                                    </div>
                                    <div className="flex flex-col">
                                      <p className="text-xs font-bold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">{artist.name}</p>
                                      <span className="text-[10px] text-slate-400 truncate mt-0.5">{artist.role}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommended For You */}
                          {shuffledRecommendations.length > 0 && (
                            <div className="flex flex-col gap-4">
                              <h3 className="text-sm font-bold text-white tracking-widest uppercase font-display border-b border-white/10 pb-2">
                                Recommended Based on Your Likes
                              </h3>
                              <div className="flex gap-4 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                                {shuffledRecommendations.map(track => (
                                  <div key={`rec-${track.id}`} className="min-w-[140px] max-w-[140px] flex flex-col gap-2 snap-start group cursor-pointer active:scale-95 transition-transform" onClick={() => handleSelectTrack(track, shuffledRecommendations)}>
                                    <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-lg">
                                      <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={track.title} />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-white truncate group-hover:text-teal transition-colors">{track.title}</p>
                                      <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  );
                })()
              ) : (
                /* ===== Sidebar Nav Sub-Pages ===== */
                <motion.div
                  key={sidebarNav}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-6"
                >
                  {/* Page Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <button
                      onClick={() => setSidebarNav('home')}
                      className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-teal transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back to Home
                    </button>
                    <h2 className="text-sm font-bold text-white tracking-widest uppercase font-display flex items-center gap-2">
                      {sidebarNav === 'radio' && <><Radio className="w-4 h-4 text-teal" /> Radio</>}
                    </h2>
                  </div>

                  {sidebarNav === 'radio' ? (
                    <div className="flex flex-col gap-12 pb-8">
                      {/* On Air Now (Aura Live Stations) */}
                      <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">On Air Now</h2>
                        <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x hide-scrollbar">
                          {[
                            { id: '1', label: '1', title: 'HITS', subtitle: 'Aura Radio', bg: 'bg-[#ff0000]', textColor: 'text-white' },
                            { id: 'hits', label: 'HITS\nHITS\nHITS', title: 'BOLLYWOOD', subtitle: 'Aura Radio', bg: 'bg-white', textColor: 'text-[#007aff]' },
                            { id: 'country', label: 'COUNTRY', title: 'COUNTRY', subtitle: 'Aura Radio', bg: 'bg-white', textColor: 'text-[#ff9f0a]' },
                            { id: 'musica', label: 'MÚSICA\nUNO', title: 'LATIN', subtitle: 'Aura Radio', bg: 'bg-white', textColor: 'text-[#ff2d55]' },
                            { id: 'club', label: 'Club', title: 'DANCE', subtitle: 'Aura Radio', bg: 'bg-white', textColor: 'text-[#1c1c1e]' },
                            { id: 'chill', label: 'Chill', title: 'LO-FI', subtitle: 'Aura Radio', bg: 'bg-white', textColor: 'text-[#32ade6]' },
                          ].map((station, i) => {
                            return (
                              <div 
                                key={i} 
                                onClick={() => handleSelectTrack(tracks[Math.floor(Math.random() * tracks.length)], [...tracks].sort(() => 0.5 - Math.random()))}
                                className={`min-w-[280px] w-[280px] h-[280px] rounded-[32px] ${station.bg} p-6 flex flex-col justify-between relative cursor-pointer snap-start overflow-hidden premium-card-hover group shadow-xl`}
                              >
                                <div className="flex-grow flex items-center justify-center">
                                   <h3 className={`${station.id === '1' ? 'text-[150px] leading-none' : 'text-5xl'} font-black ${station.textColor} text-center tracking-tighter leading-tight group-hover:scale-105 transition-transform duration-500 whitespace-pre-line`}>
                                     {station.label}
                                   </h3>
                                </div>
                                <div className={`flex items-center gap-1.5 mt-auto ${station.bg === 'bg-white' ? 'text-black/80' : 'text-white'}`}>
                                  <Radio className={`w-4 h-4 ${station.bg === 'bg-white' ? 'fill-black/80' : 'fill-white'}`} />
                                  <span className="font-bold text-sm tracking-tight">{station.subtitle}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Subscribe to Play Episodes */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold text-white hover:underline cursor-pointer flex items-center gap-1">
                            Subscribe to Play Episodes <ChevronRight className="w-5 h-5 text-slate-400" />
                          </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                          {[
                            { title: 'livies radio', subtitle: 'FOR THE FANS', desc: "We break down Olivia Rodrigo's third studio album.", cover: tracks[0]?.coverUrl },
                            { title: 'Ariana Grande, Petal: How We Got Here', subtitle: 'HOW WE GOT HERE', desc: "The story of how her album bloomed.", cover: tracks[1]?.coverUrl },
                            { title: 'Episode 735', subtitle: 'SOULECTION', desc: "Highlights from Joe Kay's set at Tempo NY.", cover: tracks[2]?.coverUrl },
                            { title: 'Key Glock', subtitle: 'NEW MUSIC DAILY RADIO', desc: "Spotlighting LPs from Key Glock, Tierra Whack and more.", cover: tracks[3]?.coverUrl },
                            { title: 'Track of the Week', subtitle: 'THE MATT WILKINSON SHOW', desc: "Matt salutes mary in the junkyard's 'New Muscles'.", cover: tracks[4]?.coverUrl },
                            { title: 'Essential Album: VICE VERSA', subtitle: 'ESSENTIALS RADIO', desc: "El álbum que nos presentó a un nuevo Rauw Alejandro.", cover: tracks[5]?.coverUrl },
                          ].map((episode, i) => (
                            <div 
                              key={i}
                              onClick={() => handleSelectTrack(tracks[Math.floor(Math.random() * tracks.length)], [...tracks].sort(() => 0.5 - Math.random()))}
                              className="flex gap-4 items-center cursor-pointer group p-2 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                            >
                              <div className="w-[100px] h-[100px] rounded-xl overflow-hidden flex-shrink-0 shadow-lg relative premium-image-hover">
                                <img src={episode.cover} className="w-full h-full object-cover" alt="" />
                                <div className="absolute top-1.5 right-1.5 bg-black/60 rounded px-1 py-0.5 flex items-center gap-1 backdrop-blur-md">
                                  <Radio className="w-2 h-2 text-white fill-white" />
                                  <span className="text-[7px] font-bold text-white uppercase tracking-wider">Music</span>
                                </div>
                              </div>
                              <div className="flex flex-col min-w-0 pr-2">
                                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate mb-0.5">{episode.subtitle}</p>
                                <h4 className="text-[15px] font-bold text-white truncate group-hover:text-teal transition-colors leading-tight mb-1">{episode.title}</h4>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-snug">{episode.desc}</p>
                              </div>
                              <button className="ml-auto opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty State Card */
                    <div className="glass-panel rounded-3xl p-16 border border-silver/8 bg-gradient-to-br from-graphite/30 to-transparent flex flex-col items-center justify-center gap-5 text-center relative overflow-hidden">
                      {/* Background glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal/[0.03] via-transparent to-ocean/[0.02] pointer-events-none" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-teal/5 rounded-full filter blur-3xl pointer-events-none" />

                      {/* Icon */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-ocean/20 to-teal/10 border border-teal/15 flex items-center justify-center shadow-[0_0_25px_rgba(24, 61, 61,0.1)] relative z-10">
                        {sidebarNav === 'made-for-you' && <LayoutGrid className="w-7 h-7 text-teal/70" />}
                      </div>

                      <div className="relative z-10 flex flex-col gap-2">
                        <h3 className="text-lg font-bold text-white/90 font-display tracking-wide capitalize">
                          {sidebarNav === 'recent' ? 'Recently Added' : sidebarNav}
                        </h3>
                        <p className="text-xs text-silver/50 max-w-xs leading-relaxed">
                          {sidebarNav === 'albums' && 'Your album collection will appear here. Start exploring to build your library.'}
                          {sidebarNav === 'artists' && 'Artists you follow and listen to will show up here.'}
                          {sidebarNav === 'new' && 'Fresh releases and new additions will be featured here.'}
                          {sidebarNav === 'recent' && 'Your recently added tracks and albums will appear here.'}
                          {sidebarNav === 'downloads' && 'Songs you\'ve downloaded for offline listening will appear here.'}
                          {sidebarNav === 'playlists' && 'Your custom playlists and saved collections live here.'}
                          {sidebarNav === 'made-for-you' && 'Personalized mixes and recommendations tailored to your taste.'}
                        </p>
                      </div>

                      <button
                        onClick={() => setSidebarNav('home')}
                        className="relative z-10 mt-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Explore Music
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}

        </main>
      </div>

      {/* ================= LYRICS MODAL OVERLAY ================= */}
      <AnimatePresence>
        {/* Sleep Timer Modal */}
        <AnimatePresence>
          {showSleepTimerModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowSleepTimerModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-graphite/95 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl flex flex-col gap-6 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(24,61,61,0.2)]">
                  <Clock className="w-8 h-8 text-teal" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Sleep Timer</h2>
                  <p className="text-slate-400 text-sm mt-1">Stop audio automatically after a set amount of time.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[15, 30, 45, 60].map(mins => (
                    <button 
                      key={mins}
                      onClick={() => {
                        setSleepTimerRemaining(mins * 60);
                        setShowSleepTimerModal(false);
                      }}
                      className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all shadow-lg hover:border-teal/30 hover:bg-teal/5"
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Custom mins..."
                    value={customSleepTimerInput}
                    onChange={(e) => setCustomSleepTimerInput(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-teal transition-colors text-center font-bold"
                  />
                  <button 
                    onClick={() => {
                      if (customSleepTimerInput && !isNaN(Number(customSleepTimerInput))) {
                        setSleepTimerRemaining(Number(customSleepTimerInput) * 60);
                        setShowSleepTimerModal(false);
                      }
                    }}
                    className="px-6 bg-teal hover:bg-teal/90 text-black font-bold rounded-xl transition-all shadow-xl"
                  >
                    Set
                  </button>
                </div>
                
                {sleepTimerRemaining !== null && (
                  <button 
                    onClick={() => {
                      setSleepTimerRemaining(null);
                      setShowSleepTimerModal(false);
                    }}
                    className="mt-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl transition-all border border-red-500/20"
                  >
                    Turn off Timer
                  </button>
                )}

                <button 
                  onClick={() => setShowSleepTimerModal(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Getting Started Tips Modal */}
        <AnimatePresence>
          {showTipsModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowTipsModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-graphite/95 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowTipsModal(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col gap-1 pr-12">
                  <h2 className="text-2xl font-black text-white tracking-tight">Getting started</h2>
                  <p className="text-slate-400 text-sm">Hints and tips for the best Aura experience.</p>
                </div>
                
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 group-hover:border-teal/30 transition-colors">
                      <Play className="w-6 h-6 text-slate-300 group-hover:text-teal transition-colors ml-1" />
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <h4 className="text-white font-bold text-[15px]">1. Start playing</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">Search, browse, and play your favorite artists and creators effortlessly.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 group-hover:border-teal/30 transition-colors">
                      <Globe className="w-6 h-6 text-slate-300 group-hover:text-teal transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <h4 className="text-white font-bold text-[15px]">2. Personalize your Vibe</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">Let Aura detect your location and climate to curate music for your current environment.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 group-hover:border-teal/30 transition-colors">
                      <Disc className="w-6 h-6 text-slate-300 group-hover:text-teal transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <h4 className="text-white font-bold text-[15px]">3. Dynamic Mixes</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">Enjoy "On Repeat" and "Discover Weekly" mixes generated dynamically based on your likes.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 group-hover:border-teal/30 transition-colors">
                      <Music className="w-6 h-6 text-slate-300 group-hover:text-teal transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <h4 className="text-white font-bold text-[15px]">4. Premium Sound</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">Experience uninterrupted high-fidelity audio with our immersive 3D player interface.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 group-hover:border-teal/30 transition-colors">
                      <PlusCircle className="w-6 h-6 text-slate-300 group-hover:text-teal transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <h4 className="text-white font-bold text-[15px]">5. Queue it up</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">Add tracks to your Queue to effortlessly control what plays next.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {showLyricsModal && currentTrack?.lyrics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/10 glass-panel p-6 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <img src={currentTrack.coverUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{currentTrack.title}</h3>
                    <p className="text-[11px] text-slate-400">{currentTrack.artist} • Lyrics</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLyricsModal(false)}
                  className="p-1 px-1.5 rounded-full hover:bg-white/10 text-slate-450 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Text display */}
              <div className="flex-1 overflow-y-auto py-5 pr-2 custom-scroll mt-2 text-center">
                <pre className="whitespace-pre-wrap font-display text-sm leading-relaxed text-slate-200 tracking-wide font-medium">
                  {currentTrack.lyrics}
                </pre>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                AURA Karaoke Module
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DUAL TIER PREMIUM UPGRADE MODAL ================= */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shadow/85 backdrop-blur-[24px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg rounded-3xl border border-silver/10 bg-gradient-to-b from-graphite via-shadow to-shadow p-6 shadow-2xl flex flex-col gap-6 text-ink-primary"
            >
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/5 text-ink-secondary hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-ocean to-teal rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(24, 61, 61,0.35)] mb-3">
                  <Crown className="w-6 h-6 text-ink-primary fill-current animate-bounce" />
                </div>
                <h3 className="font-display font-extrabold text-xl text-white uppercase tracking-wider">AURA Subscription Portal</h3>
                {upgradeMessage && (
                  <p className="text-[11px] text-ink-secondary mt-1 max-w-sm mx-auto leading-relaxed">
                    Action required to: <strong className="text-teal">{upgradeMessage}</strong>
                  </p>
                )}
              </div>

              {/* Plans side-by-side grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tier 1: Premium */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between h-full bg-graphite/40 transition-all ${
                  upgradeTargetTier === 'Premium' ? 'border-teal/50 bg-teal/5' : 'border-silver/8'
                }`}>
                  <div>
                    <div className="flex justify-between items-center border-b border-silver/10 pb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wide">AURA Premium</span>
                      <span className="text-[10px] font-mono text-teal">$4.99/mo</span>
                    </div>
                    <ul className="text-[10px] text-ink-secondary flex flex-col gap-2 mt-3 text-left">
                      <li>✨ Ad-free listening</li>
                      <li>✨ Download up to 100 songs</li>
                      <li>✨ 320kbps High Quality Audio</li>
                      <li>✨ Unlimited skips</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleUpgrade('Premium')}
                    className="w-full mt-4 py-2 btn-premium text-ink-primary font-black text-[10px] uppercase tracking-wider rounded-xl transition-transform active:scale-95 cursor-pointer shadow-md"
                  >
                    Activate Premium
                  </button>
                </div>

                {/* Tier 2: Premium+ */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between h-full bg-graphite/40 transition-all ${
                  upgradeTargetTier === 'Premium+' ? 'border-teal/70 bg-deepblue/20' : 'border-silver/8'
                }`}>
                  <div>
                    <div className="flex justify-between items-center border-b border-silver/10 pb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wide">AURA Premium+</span>
                      <span className="text-[10px] font-mono text-teal">$9.99/mo</span>
                    </div>
                    <ul className="text-[10px] text-ink-secondary flex flex-col gap-2 mt-3 text-left">
                      <li className="text-teal font-semibold">Includes all Premium perks +</li>
                      <li>✨ Lossless Studio FLAC Audio</li>
                      <li>✨ Dolby Atmos Spatial Mode</li>
                      <li>✨ Custom Appearance Themes</li>
                      <li>✨ Add up to 5 family members</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleUpgrade('Premium+')}
                    className="w-full mt-4 py-2 bg-gradient-to-r from-deepblue via-ocean to-teal text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-transform active:scale-95 cursor-pointer shadow-lg"
                  >
                    Activate Premium+
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-center text-slate-500 hover:text-white transition-colors cursor-pointer text-[10px] uppercase font-mono tracking-widest"
              >
                Dismiss portal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= TOAST NOTIFICATION ================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border ${
              toast.type === 'success' ? 'bg-teal/20 border-teal/50 text-teal-100' :
              toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-100' :
              'bg-blue-500/20 border-blue-500/50 text-blue-100'
            }`}
          >
            {toast.type === 'success' && <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />}
            {toast.type === 'error' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            {toast.type === 'info' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
            <span className="font-semibold text-sm tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around px-1 py-2 bg-[#0e0e10]/96 backdrop-blur-2xl border-t border-white/[0.06]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {([
          { id: 'home',      label: 'Home',    icon: HomeIcon  },
          { id: 'search',    label: 'Search',  icon: Search    },
          { id: 'songs',     label: 'Songs',   icon: ListMusic  },
          { id: 'albums',    label: 'Albums',  icon: Disc      },
          { id: 'playlists', label: 'Library', icon: FolderHeart },
        ] as const).map(({ id, label, icon: Icon }) => {
          const isActive = sidebarNav === id && !selectedAlbum;
          return (
            <button
              key={id}
              onClick={() => { setSidebarNav(id); setSelectedAlbum(null); }}
              className="flex flex-col items-center gap-[3px] flex-1 py-1.5 rounded-xl transition-all active:scale-90 relative"
            >
              <Icon
                className={`w-[22px] h-[22px] transition-all duration-200 ${
                  isActive ? 'text-white scale-110' : 'text-slate-500'
                }`}
              />
              <span className={`text-[10px] font-medium leading-none transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-slate-500'
              }`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-white opacity-80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ================= FIXED BOTTOM PLAYER BAR ================= */}
      <footer className="fixed bottom-[64px] md:bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="pointer-events-auto">
          <AudioPlayer 
            onLyricsToggle={() => setShowLyricsModal(true)} 
            onUpgradePrompt={(msg, target) => triggerUpgradePrompt(msg, target)} 
          />
        </div>
      </footer>

    </div>
  );
};



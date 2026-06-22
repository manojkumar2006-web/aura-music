/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Edit3
} from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { AudioPlayer } from '../components/player/AudioPlayer';
import { Track, SubscriptionTier } from '../types';

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
    pendingAuthUser,
    activeOtpCode,
    signUp,
    logIn,
    socialLogin,
    logOut,
    requestPasswordReset,
    verifyOtpCode,
    resetPassword,
    updateProfile,
    updatePrivacy
  } = useMusicStore();

  // Local UI States
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [activeView, setActiveView] = useState<'library' | 'profile'>('library');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [sidebarNav, setSidebarNav] = useState<string>('home');
  const [activeTrackMenu, setActiveTrackMenu] = useState<string | null>(null);
  const [trackToAddPlaylist, setTrackToAddPlaylist] = useState<string | null>(null);
  
  // Auth Form Input States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupAvatarUrl, setSignupAvatarUrl] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

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

  // If user starts searching, return to library view
  React.useEffect(() => {
    if (searchQuery.trim() && activeView !== 'library') {
      setActiveView('library');
    }
  }, [searchQuery, activeView]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTargetTier, setUpgradeTargetTier] = useState<SubscriptionTier>('Premium');
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistCover, setNewPlaylistCover] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [editingPlaylistOldName, setEditingPlaylistOldName] = useState<string | null>(null);
  const [activePlaylistMenu, setActivePlaylistMenu] = useState<string | null>(null);
  
  // Track likes mapping
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});

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

  const toggleLike = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !likedTracks[trackId];
    setLikedTracks((prev) => ({ ...prev, [trackId]: nextState }));
    logAnalyticsEvent(`${nextState ? 'Liked' : 'Unliked'} track ID: ${trackId}`);
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
    const coverUrl = songCoverUrl.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80';

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
  const filteredTracks = tracks.filter((track) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.album.toLowerCase().includes(query)
    );
  });

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
      glow: 'shadow-[0_0_15px_rgba(136, 13, 30,0.25)]',
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

  return (
    <div className={`h-screen overflow-hidden ${activeThemeStyle.bg} text-ink-primary flex flex-col relative select-none transition-colors duration-500 star-field`}>
      {/* Ambient background blobs (atmosphere) */}
      <div className="ambient-blob free" />
      <div className="ambient-blob premium" />

      {activeTrackMenu && (
        <div 
          className="fixed inset-0 z-40 bg-transparent cursor-default" 
          onClick={() => setActiveTrackMenu(null)}
        />
      )}
      
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
        <aside className="md:col-span-3 flex flex-col gap-5 overflow-y-auto custom-scroll sticky top-0 self-start max-h-full pb-20">
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
                <span className="text-[9px] uppercase font-mono tracking-widest text-ink-primary font-bold bg-gradient-to-r from-deepblue to-ocean px-2 py-0.5 rounded border border-teal/35 shadow-[0_0_8px_rgba(136, 13, 30,0.3)] flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5 fill-current" /> Premium+
                </span>
              ) : userTier === 'Premium' ? (
                <span className="text-[9px] uppercase font-mono tracking-widest text-teal font-bold bg-teal/10 px-2 py-0.5 rounded border border-teal/20 shadow-[0_0_8px_rgba(136, 13, 30,0.15)] flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5 fill-current" /> Premium
                </span>
              ) : (
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-soft font-bold bg-slate-default/15 px-2 py-0.5 rounded border border-slate-default/20">
                  Free Player
                </span>
              )}
            </div>

            {userTier === 'Free' ? (
              <div className="flex flex-col gap-2.5">
                <p className="text-[10px] text-ink-secondary leading-normal">
                  Unlock ad-free streaming, 320kbps, spatial Atmos, custom themes & offline downloads.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => triggerUpgradePrompt("unlock Premium features", "Premium")}
                    className="py-2 btn-premium text-ink-primary font-bold text-[10px] rounded-xl cursor-pointer uppercase font-sans tracking-wide"
                  >
                    Premium
                  </button>
                  <button
                    onClick={() => triggerUpgradePrompt("unlock Lossless FLAC & Spatial Audio", "Premium+")}
                    className="py-2 btn-premium text-ink-primary font-bold text-[10px] rounded-xl cursor-pointer uppercase font-sans tracking-wide shimmer-sweep"
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
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-teal to-ocean rounded-r-full shadow-[0_0_8px_rgba(136, 13, 30,0.5)]" />
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
                      <span className="ml-auto text-[8px] font-bold uppercase tracking-widest bg-gradient-to-r from-ocean to-teal text-ink-primary px-1.5 py-0.5 rounded-full shadow-[0_0_6px_rgba(136, 13, 30,0.3)]">
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
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-gradient-to-b from-teal to-ocean rounded-r-full shadow-[0_0_8px_rgba(136, 13, 30,0.5)]" />
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
        <main ref={mainScrollRef} className="md:col-span-9 flex flex-col gap-6 overflow-y-auto custom-scroll pb-24 scroll-smooth">
          
          {/* Top Bar with Search Input & Account Action */}
          <div data-scroll-reveal className="flex gap-4 items-center w-full">
            <div className="flex-grow glass-panel rounded-2xl p-3 border border-silver/8 bg-graphite/45 flex items-center gap-3 transition-all duration-300 focus-within:border-teal/35 focus-within:shadow-[0_0_15px_rgba(136, 13, 30,0.1)]">
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

            {currentUser ? (
              <button
                onClick={() => setActiveView(activeView === 'profile' ? 'library' : 'profile')}
                className={`glass-panel rounded-2xl px-4 py-2 border border-silver/8 bg-graphite/45 flex items-center gap-2.5 hover:border-teal/30 hover:bg-teal/5 hover:shadow-[0_0_15px_rgba(136, 13, 30,0.1)] transition-all cursor-pointer h-12 flex-shrink-0 ${
                  activeView === 'profile' ? 'border-teal/45 bg-teal/10 shadow-[0_0_15px_rgba(136, 13, 30,0.15)]' : ''
                }`}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-ocean to-teal p-0.5 flex-shrink-0">
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      className="w-full h-full object-cover rounded-full bg-graphite"
                      alt="Avatar"
                    />
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-ink-primary font-display truncate max-w-[100px]">
                    {currentUser.displayName}
                  </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthTab('login');
                  setAuthError(null);
                  useMusicStore.setState({ pendingAuthUser: null, activeOtpCode: null });
                  setShowAuthModal(true);
                }}
                className="glass-panel rounded-2xl px-5 border border-silver/8 bg-graphite/45 hover:border-teal/35 hover:bg-teal/5 hover:shadow-[0_0_15px_rgba(136, 13, 30,0.1)] transition-all flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider cursor-pointer h-12 flex-shrink-0 hover:scale-102 active:scale-98"
              >
                <User className="w-4 h-4 text-teal" />
                <span>Sign In</span>
              </button>
            )}
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
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-tr from-ocean to-teal p-1 relative z-10 flex-shrink-0 shadow-[0_0_20px_rgba(136, 13, 30,0.25)]">
                        <img
                          src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
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
                              ? 'bg-gradient-to-r from-deepblue to-ocean border-teal/35 text-white shadow-[0_0_8px_rgba(136, 13, 30,0.3)]'
                              : userTier === 'Premium'
                              ? 'bg-teal/10 border-teal/20 text-teal shadow-[0_0_8px_rgba(136, 13, 30,0.15)]'
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
                            { name: 'Producer', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' },
                            { name: 'Vocalist', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
                            { name: 'Composer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
                            { name: 'Audiophile', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
                            { name: 'Astronaut', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80' }
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
                          className="py-2 px-5 bg-gradient-to-r from-ocean to-teal text-ink-primary font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-102 shadow-lg cursor-pointer"
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
                      <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-black/20 flex flex-col gap-1 hover:border-teal/15 transition-all">
                        <span className="text-[9px] font-mono text-ink-tertiary uppercase">Tracks Played</span>
                        <span className="text-2xl font-black text-white font-display tracking-tight">
                          {currentUser.stats.tracksPlayed}
                        </span>
                        <span className="text-[8px] text-ink-tertiary">All-time streams</span>
                      </div>
                      <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-black/20 flex flex-col gap-1 hover:border-teal/15 transition-all">
                        <span className="text-[9px] font-mono text-ink-tertiary uppercase">Listening Time</span>
                        <span className="text-2xl font-black text-teal font-display tracking-tight">
                          {currentUser.stats.minutesListened} <span className="text-xs font-normal text-ink-secondary">min</span>
                        </span>
                        <span className="text-[8px] text-ink-tertiary">Active playback</span>
                      </div>
                      <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-black/20 flex flex-col gap-1 hover:border-teal/15 transition-all">
                        <span className="text-[9px] font-mono text-ink-tertiary uppercase">Favorite Genre</span>
                        <span className="text-xs font-extrabold text-white truncate font-sans tracking-wide mt-1">
                          {currentUser.stats.topGenre || 'None'}
                        </span>
                        <span className="text-[8px] text-ink-tertiary mt-auto">Acoustic signature</span>
                      </div>
                      <div className="glass-panel rounded-2xl p-4 border border-white/5 bg-black/20 flex flex-col gap-1 hover:border-teal/15 transition-all">
                        <span className="text-[9px] font-mono text-ink-tertiary uppercase">Fav Artist</span>
                        <span className="text-xs font-extrabold text-emerald-400 truncate font-sans tracking-wide mt-1">
                          {currentUser.stats.favArtist || 'None'}
                        </span>
                        <span className="text-[8px] text-ink-tertiary mt-auto">Most streamed</span>
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
                                          className="absolute w-20 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(136, 13, 30,0.6)] outline-none origin-center -rotate-90 hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
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
                  onClick={() => setShowAuthModal(true)}
                  className="mt-2 py-2 px-5 bg-gradient-to-r from-ocean to-teal text-ink-primary font-bold text-xs uppercase rounded-xl hover:scale-102 transition-transform cursor-pointer"
                >
                  Authenticate
                </button>
              </div>
            )
          ) : (
            <>
              {selectedDirector ? (() => {
                const directorTracks = tracks.filter(t => t.musicDirector === selectedDirector || t.artist?.includes(selectedDirector));
                const directorAlbums = Array.from(new Set(directorTracks.map(t => t.album).filter(Boolean)));
                const latestAlbumName = directorAlbums[0];
                const latestAlbumTracks = directorTracks.filter(t => t.album === latestAlbumName);
                const topSongs = directorTracks.slice(0, 6);

                const getCover = (name: string, type: 'hero' | 'director' | 'artist') => {
                  if (name.includes('Sai Abhyankkar')) return '/covers/Sai-Abhyankkar.avif';
                  if (type === 'hero' || name.includes('Unknown')) return '/covers/hero-images.jpg';
                  return `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80&sig=${name.replace(/\s/g, '')}`;
                };

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
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#fa2d48]/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />
                       <div className="w-64 h-64 rounded-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 relative border-4 border-white/10">
                         <img src={getCover(selectedDirector, 'director')} alt={selectedDirector} className="w-full h-full object-cover" />
                       </div>
                    </div>

                    {/* Artist Name & Play Header */}
                    <div className="flex items-center justify-center md:justify-start gap-4 border-b border-white/5 pb-8">
                       <button 
                         onClick={() => topSongs[0] && handleSelectTrack(topSongs[0], topSongs)}
                         className="bg-[#fa2d48] hover:bg-[#fa2d48]/90 text-white p-4 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg flex-shrink-0"
                       >
                         <Play className="w-6 h-6 fill-current" />
                       </button>
                       <h2 className="text-4xl md:text-5xl font-black text-white font-display tracking-tight truncate">{selectedDirector}</h2>
                    </div>

                    {/* Latest Release & Top Songs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-white/5 pb-10">
                      {/* Latest Release */}
                      <div className="md:col-span-4 flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-white font-display tracking-wide flex items-center justify-between">
                          Latest Release
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
                              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{latestAlbumTracks[0]?.releaseDate || '2026'}</span>
                              <span className="text-base font-bold text-white truncate mt-1 group-hover:text-[#fa2d48] transition-colors">{latestAlbumName} (Original Motion Picture Soundtrack)</span>
                              <span className="text-xs text-slate-400 mt-0.5">{latestAlbumTracks.length} song{latestAlbumTracks.length !== 1 && 's'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Top Songs */}
                      <div className="md:col-span-8 flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-white font-display tracking-wide flex items-center justify-between">
                          Top Songs
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
                                <div className="absolute bottom-2 right-2 bg-[#fa2d48] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg translate-y-2 group-hover:translate-y-0">
                                  <Play className="w-3 h-3 fill-white" />
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-white truncate group-hover:text-[#fa2d48] transition-colors">{albumName}</span>
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
                            <Play className="w-5 h-5 fill-current" /> Preview
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
                const targetPlaylist = playlists.find(p => p.name === selectedPlaylist);
                if (!targetPlaylist) return null;
                const playlistTracks = tracks.filter(t => targetPlaylist.trackIds.includes(t.id));
                const coverImage = playlistTracks.length > 0 ? playlistTracks[0].coverUrl : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400';
                
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
                            {user?.username || 'You'}
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
                  {/* Hero / Mixes */}
                  <div className="flex flex-col gap-4">
                    <h2 className="font-display font-bold text-xl text-white tracking-wider flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal" /> Your Mixes
                    </h2>
                    <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x">
                      {['Daily Mix 1', 'Chill Vibes', 'Discover Weekly', 'Late Night Drive', 'Upbeats', 'Lo-Fi Chill'].map((mix, i) => (
                        <div key={i} className="min-w-[160px] w-[160px] glass-panel rounded-2xl p-4 flex flex-col gap-4 cursor-pointer hover:bg-white/5 transition-all snap-start group border border-white/5 hover:border-teal/30 shadow-lg">
                          <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-teal/20 relative overflow-hidden flex items-center justify-center">
                            <Disc className="w-10 h-10 text-white/50 group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white truncate">{mix}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Made for you</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Liked Songs Preview */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end pr-2">
                      <h2 className="font-display font-bold text-xl text-white tracking-wider flex items-center gap-2">
                        <Heart className="w-5 h-5 text-teal fill-teal" /> Liked Songs
                      </h2>
                      <span onClick={() => setSidebarNav('songs')} className="text-xs text-teal cursor-pointer hover:underline font-mono">View All</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tracks.filter(t => likedTracks[t.id]).slice(0, 6).map(track => (
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
                      {tracks.filter(t => likedTracks[t.id]).length === 0 && (
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
                      {[
                        { title: 'Synthwave Nights', author: 'NeonRider', tracks: 42 },
                        { title: 'Focus Flow', author: 'StudyBot', tracks: 128 },
                        { title: 'Gym Bangerz', author: 'Chad', tracks: 55 },
                        { title: 'Acoustic Morning', author: 'CoffeeLover', tracks: 31 }
                      ].map((pl, i) => (
                        <div key={i} className="glass-panel p-4 rounded-2xl flex flex-col gap-4 cursor-pointer hover:bg-white/5 hover:border-white/10 transition-all border border-transparent group shadow-md">
                          <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-slate-800 to-[#121212] relative flex items-center justify-center overflow-hidden">
                            <ListMusic className="w-8 h-8 text-slate-600 group-hover:scale-110 group-hover:text-emerald-500/50 transition-all duration-300" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white truncate">{pl.title}</span>
                            <span className="text-[10px] text-slate-400 truncate mt-0.5">By {pl.author} • {pl.tracks} tracks</span>
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
                            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_5px_15px_rgba(16,185,129,0.25)] hover:scale-102 active:scale-97 transition-all flex items-center gap-1.5 cursor-pointer"
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
              <div data-scroll-reveal className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
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
                        const isTrackLiked = !!likedTracks[track.id];
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
                                ? 'border-teal/45 shadow-[0_8px_30px_rgba(136, 13, 30,0.15)] bg-gradient-to-r from-teal/10 to-transparent' 
                                : 'border-silver/8 hover:border-teal/30 hover:bg-teal/5 hover:shadow-[0_8px_25px_rgba(136, 13, 30,0.1)]'
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
                                onClick={(e) => toggleLike(track.id, e)}
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
                      if (likedTracks[track.id]) {
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
                          <div className="absolute top-3 right-3 text-2xl opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-300 drop-shadow-lg">
                            {cat.emoji}
                          </div>

                          {/* Category Name */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                            <span className="text-[13px] font-bold text-white font-display tracking-wide drop-shadow-md">
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
                  const regionTracks = tracks.filter(t => t.region === activeRegion || (activeRegion === 'Kollywood' && t.region === 'Tamil') || (activeRegion === 'Tollywood' && !t.region));
                  
                  const regionalAlbums = Array.from(new Set(regionTracks.map(t => t.album)));
                  const regionalHeroes = Array.from(new Set(regionTracks.map(t => t.hero).filter(Boolean)));
                  const regionalDirectors = Array.from(new Set(regionTracks.map(t => t.musicDirector).filter(Boolean)));
                  const regionalArtists = Array.from(new Set(regionTracks.flatMap(t => t.artist.split(', '))));

                  const getCover = (name: string, type: 'hero' | 'director' | 'artist') => {
                    if (name.includes('Sai Abhyankkar')) return '/covers/Sai-Abhyankkar.avif';
                    if (type === 'hero' || name.includes('Unknown')) return '/covers/hero-images.jpg';
                    return `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80&sig=${name.replace(/\s/g, '')}`;
                  };



                  return (
                    /* ===== Dedicated Albums Page ===== */
                <motion.div
                  key="albums-page"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-8 pb-10"
                >
                  {/* Header & Region Selector */}
                  <div className="flex flex-col gap-6 border-b border-white/5 pb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold text-white tracking-widest uppercase font-display flex items-center gap-2">
                        <Disc className="w-6 h-6 text-teal" /> Regional Albums
                      </h2>
                    </div>
                    <div className="flex gap-3 overflow-x-auto custom-scroll pb-2">
                      {['Tollywood', 'Bollywood', 'Kollywood', 'Hollywood'].map(region => (
                        <button
                          key={region}
                          onClick={() => {
                            setActiveRegion(region);
                            setSelectedAlbum(null);
                          }}
                          className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                            activeRegion === region 
                              ? 'bg-teal border-teal text-white shadow-[0_0_15px_rgba(136, 13, 30,0.4)]' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Region Content */}
                  <div className="flex flex-col gap-10">
                    {/* Movies */}
                    <div className="flex flex-col gap-4">
                      <h3 className="font-display font-bold text-base text-white tracking-wider flex items-center gap-2">
                        <Play className="w-4 h-4 text-[#00d4ff]" /> Blockbuster Movies
                      </h3>
                      <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x">
                        {regionalAlbums.map((albumName, i) => {
                          const albumTrack = regionTracks.find(t => t.album === albumName);
                          return (
                            <div 
                              key={albumName} 
                              onClick={() => setSelectedAlbum(albumName)}
                              className="min-w-[140px] w-[140px] flex flex-col gap-2 cursor-pointer group snap-start"
                            >
                              <div className="w-full aspect-[2/3] rounded-xl overflow-hidden relative shadow-lg bg-black/40">
                                <img src={albumTrack?.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={albumName} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                <div className="absolute bottom-3 left-3 right-3 flex flex-col">
                                  <span className="text-xs font-bold text-white truncate">{albumName}</span>
                                  <span className="text-[9px] text-teal font-mono uppercase mt-0.5">{activeRegion}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>



                    {/* Music Directors */}
                    {regionalDirectors.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <h3 className="font-display font-bold text-base text-white tracking-wider flex items-center gap-2">
                          <Music className="w-4 h-4 text-emerald-400" /> Music Directors
                        </h3>
                        <div className="flex gap-5 overflow-x-auto custom-scroll pb-4 snap-x">
                          {regionalDirectors.map((director, i) => (
                            <div key={director} className="min-w-[200px] w-[200px] glass-panel rounded-2xl p-5 flex items-center gap-4 cursor-pointer group snap-start hover:border-emerald-500/30 transition-colors">
                              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                <img src={getCover(director, 'director')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={director} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-white truncate">{director}</span>
                                <span className="text-[9px] text-slate-400 truncate">Composer</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Particular Artists */}
                    {regionalHeroes.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <h3 className="font-display font-bold text-base text-white tracking-wider flex items-center gap-2">
                          <Mic2 className="w-4 h-4 text-purple-400" /> Trending Artists
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {regionalHeroes.map((hero, i) => (
                            <div key={hero} className="glass-panel p-3 rounded-2xl flex flex-col gap-3 cursor-pointer hover:bg-white/5 transition-all group">
                              <div className="w-full aspect-video rounded-xl overflow-hidden relative">
                                <img src={getCover(hero, 'hero')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={hero} />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-white truncate">{hero}</span>
                                <span className="text-[10px] text-slate-400 truncate mt-0.5">Lead Actor</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
                );
              })()
              ) : sidebarNav === 'new' ? (
                /* ===== Dedicated New Releases Page ===== */
                <motion.div
                  key="new-page"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-6 pb-10"
                >
                  {/* Page Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-xl font-extrabold text-white tracking-widest uppercase font-display flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-teal animate-pulse" /> New Releases
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Sort tracks by releaseDate (newest first) */}
                    {tracks
                      .filter(t => t.releaseDate)
                      .sort((a, b) => new Date(b.releaseDate!).getTime() - new Date(a.releaseDate!).getTime())
                      .map((track) => {
                      const isSelected = currentTrack?.id === track.id;
                      const dateObj = new Date(track.releaseDate!);
                      const releaseDateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

                      return (
                        <div
                          key={track.id}
                          onClick={() => handleSelectTrack(track)}
                          className={`group relative rounded-2xl glass-panel p-4 cursor-pointer overflow-hidden transition-all duration-300 flex flex-col gap-3 border ${
                            isSelected 
                              ? 'border-teal/45 shadow-[0_8px_30px_rgba(136, 13, 30,0.15)] bg-gradient-to-r from-teal/10 to-transparent' 
                              : 'border-silver/8 hover:border-teal/30 hover:bg-teal/5 hover:shadow-[0_8px_25px_rgba(136, 13, 30,0.1)]'
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
                              <span className="text-[10px] text-teal font-mono uppercase font-bold mb-1 tracking-wider">{releaseDateStr}</span>
                              <h3 className="font-display font-bold text-sm text-white truncate group-hover:text-teal transition-colors">
                                {track.title}
                              </h3>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {tracks.filter(t => t.releaseDate).length === 0 && (
                      <div className="col-span-full text-xs text-slate-500 font-mono py-8 text-center border border-dashed border-white/5 rounded-xl">
                        No tracks with release dates found.
                      </div>
                    )}
                  </div>
                </motion.div>
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
                              ? 'border-teal/45 shadow-[0_8px_30px_rgba(136, 13, 30,0.15)] bg-gradient-to-r from-teal/10 to-transparent' 
                              : 'border-silver/8 hover:border-teal/30 hover:bg-teal/5 hover:shadow-[0_8px_25px_rgba(136, 13, 30,0.1)]'
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
                      className="px-4 py-2 bg-teal/10 text-teal hover:bg-teal hover:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
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
                          className="self-end px-6 py-2.5 bg-gradient-to-r from-ocean to-teal text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(136, 13, 30,0.4)] transition-all cursor-pointer"
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
                  const likedSongTracks = tracks.filter(t => likedTracks[t.id]);
                  
                  // Extract unique artists
                  const likedArtistsMap = new Map<string, string>();
                  likedSongTracks.forEach(t => {
                    if (!likedArtistsMap.has(t.artist)) {
                      likedArtistsMap.set(t.artist, t.coverUrl);
                    }
                  });
                  const likedArtists = Array.from(likedArtistsMap.entries()).map(([name, cover]) => ({ name, cover }));

                  // Extract unique music directors
                  const likedDirectorsMap = new Map<string, string>();
                  likedSongTracks.forEach(t => {
                    if (t.musicDirector && !likedDirectorsMap.has(t.musicDirector)) {
                      likedDirectorsMap.set(t.musicDirector, t.coverUrl);
                    }
                  });
                  const likedDirectors = Array.from(likedDirectorsMap.entries()).map(([name, cover]) => ({ name, cover }));

                  // Extract unique albums
                  const likedAlbumsMap = new Map<string, string>();
                  likedSongTracks.forEach(t => {
                    if (t.album && t.album !== 'Single' && !likedAlbumsMap.has(t.album)) {
                      likedAlbumsMap.set(t.album, t.coverUrl);
                    }
                  });
                  const likedAlbums = Array.from(likedAlbumsMap.entries()).map(([name, cover]) => ({ name, cover }));

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

                          {/* Liked Artists */}
                          {likedArtists.length > 0 && (
                            <div className="flex flex-col gap-4">
                              <h3 className="text-sm font-bold text-white tracking-widest uppercase font-display border-b border-white/10 pb-2">
                                Liked Artists
                              </h3>
                              <div className="flex gap-4 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                                {likedArtists.map(artist => (
                                  <div key={`artist-${artist.name}`} className="min-w-[120px] max-w-[120px] flex flex-col items-center gap-3 snap-start group cursor-pointer text-center active:scale-95 transition-transform">
                                    <div className="w-full aspect-square rounded-full overflow-hidden relative shadow-lg border-2 border-transparent group-hover:border-teal transition-all">
                                      <img src={artist.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={artist.name} />
                                    </div>
                                    <p className="text-xs font-bold text-white line-clamp-2 group-hover:text-teal transition-colors">{artist.name}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Liked Music Directors */}
                          {likedDirectors.length > 0 && (
                            <div className="flex flex-col gap-4">
                              <h3 className="text-sm font-bold text-white tracking-widest uppercase font-display border-b border-white/10 pb-2">
                                Liked Music Directors
                              </h3>
                              <div className="flex gap-4 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                                {likedDirectors.map(director => (
                                  <div key={`director-${director.name}`} className="min-w-[140px] max-w-[140px] flex flex-col gap-2 snap-start group cursor-pointer active:scale-95 transition-transform">
                                    <div className="w-full aspect-video rounded-xl overflow-hidden relative shadow-lg border border-white/5 group-hover:border-teal/30 transition-colors">
                                      <img src={director.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" alt={director.name} />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                      <div className="absolute bottom-2 left-2 right-2">
                                        <p className="text-xs font-bold text-white truncate">{director.name}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Liked Albums */}
                          {likedAlbums.length > 0 && (
                            <div className="flex flex-col gap-4">
                              <h3 className="text-sm font-bold text-white tracking-widest uppercase font-display border-b border-white/10 pb-2">
                                Liked Albums
                              </h3>
                              <div className="flex gap-4 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                                {likedAlbums.map(album => (
                                  <div key={`album-${album.name}`} className="min-w-[140px] max-w-[140px] flex flex-col gap-2 snap-start group cursor-pointer active:scale-95 transition-transform">
                                    <div className="w-full aspect-square rounded-md overflow-hidden relative shadow-lg">
                                      <img src={album.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={album.name} />
                                      <div className="absolute inset-0 border border-white/10 rounded-md group-hover:border-teal/30 transition-colors" />
                                    </div>
                                    <p className="text-xs font-bold text-white truncate group-hover:text-teal transition-colors">{album.name}</p>
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

                  {/* Empty State Card */}
                  <div className="glass-panel rounded-3xl p-16 border border-silver/8 bg-gradient-to-br from-graphite/30 to-transparent flex flex-col items-center justify-center gap-5 text-center relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal/[0.03] via-transparent to-ocean/[0.02] pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-teal/5 rounded-full filter blur-3xl pointer-events-none" />

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-ocean/20 to-teal/10 border border-teal/15 flex items-center justify-center shadow-[0_0_25px_rgba(136, 13, 30,0.1)] relative z-10">
                      {sidebarNav === 'radio' && <Radio className="w-7 h-7 text-teal/70" />}
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
                        {sidebarNav === 'radio' && 'Curated radio stations and live streams coming soon.'}
                        {sidebarNav === 'recent' && 'Your recently added tracks and albums will appear here.'}
                        {sidebarNav === 'downloads' && 'Songs you\'ve downloaded for offline listening will appear here.'}
                        {sidebarNav === 'playlists' && 'Your custom playlists and saved collections live here.'}
                        {sidebarNav === 'made-for-you' && 'Personalized mixes and recommendations tailored to your taste.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setSidebarNav('home')}
                      className="relative z-10 mt-2 px-5 py-2 bg-gradient-to-r from-ocean to-teal text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-[0_4px_15px_rgba(136, 13, 30,0.25)] hover:shadow-[0_4px_20px_rgba(136, 13, 30,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Browse Library
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}

        </main>
      </div>

      {/* ================= LYRICS MODAL OVERLAY ================= */}
      <AnimatePresence>
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

      {/* ================= AUTHENTICATION MODAL ================= */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shadow/85 backdrop-blur-[24px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-md rounded-3xl border border-silver/10 bg-gradient-to-b from-graphite via-shadow to-shadow p-6 shadow-2xl flex flex-col gap-6 text-ink-primary"
            >
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError(null);
                  useMusicStore.setState({ pendingAuthUser: null, activeOtpCode: null });
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 text-ink-secondary hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Conditional views: OTP Verification vs Pass Reset vs Normal Tabs */}
              {pendingAuthUser ? (
                // OTP Verification Flow or New Password Flow
                pendingAuthUser.type === 'reset' && !activeOtpCode ? (
                  // New Password Entry Flow after OTP success for Reset
                  <div className="flex flex-col gap-4">
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-3">
                        <Key className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                        Create New Password
                      </h3>
                      <p className="text-[10px] text-ink-secondary mt-1">
                        Enter your new secure password below for <span className="text-white font-semibold">{pendingAuthUser.data.email}</span>.
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (resetNewPassword !== confirmNewPassword) {
                          setAuthError('Passwords do not match!');
                          return;
                        }
                        if (resetNewPassword.length < 6) {
                          setAuthError('Password must be at least 6 characters!');
                          return;
                        }
                        resetPassword(pendingAuthUser.data.email, resetNewPassword);
                        // Reset forms
                        setResetNewPassword('');
                        setConfirmNewPassword('');
                        setAuthError(null);
                        setAuthTab('login');
                      }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary">New Password</span>
                        <input
                          type="password"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-teal/45"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary">Confirm Password</span>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-teal/45"
                        />
                      </div>

                      {authError && (
                        <div className="p-2.5 rounded-xl bg-deepblue/20 border border-deepblue/40 text-teal text-[10px] text-center font-mono leading-normal">
                          ⚠️ {authError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full mt-2 py-2 bg-gradient-to-r from-ocean to-teal text-ink-primary font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-102 transition-transform shadow-lg cursor-pointer"
                      >
                        Reset Password
                      </button>
                    </form>
                  </div>
                ) : (
                  // OTP Challenge Flow (Signup OTP or Reset OTP)
                  <div className="flex flex-col gap-4">
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-teal/10 border border-teal/20 text-teal rounded-full flex items-center justify-center mb-3 animate-pulse">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                        Security Verification
                      </h3>
                      <p className="text-[10px] text-ink-secondary mt-1 max-w-xs mx-auto leading-relaxed">
                        A 6-digit confirmation code was sent to <strong className="text-ink-primary">{pendingAuthUser.data.email}</strong>.
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
                          setAuthError('OTP must be a 6-digit number!');
                          return;
                        }
                        setAuthError(null);
                        const success = verifyOtpCode(otpCode);
                        if (success) {
                          setOtpCode('');
                          if (pendingAuthUser.type === 'signup') {
                            setShowAuthModal(false);
                          }
                        } else {
                          setAuthError('Incorrect code. Please check details or retry.');
                        }
                      }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary text-center">Enter 6-Digit Code</span>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-center text-xl font-mono font-bold tracking-[0.5em] text-white focus:outline-none focus:border-teal/45 w-full"
                          required
                          autoFocus
                        />
                      </div>

                      {authError && (
                        <div className="p-2.5 rounded-xl bg-deepblue/20 border border-deepblue/40 text-teal text-[10px] text-center font-mono leading-normal">
                          ⚠️ {authError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full mt-2 py-2 bg-gradient-to-r from-ocean to-teal text-ink-primary font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-102 transition-transform shadow-lg cursor-pointer"
                      >
                        Verify Identity
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setOtpCode('');
                          useMusicStore.setState({ pendingAuthUser: null, activeOtpCode: null });
                        }}
                        className="text-center text-ink-tertiary hover:text-ink-secondary text-[10px] uppercase font-mono tracking-widest mt-1 cursor-pointer transition-colors"
                      >
                        Back to Credentials
                      </button>
                    </form>
                  </div>
                )
              ) : (
                // Regular tabs login / signup / forgot pass
                <div className="flex flex-col gap-4">
                  {/* Tabs */}
                  <div className="flex border-b border-white/5">
                    {(['login', 'signup', 'reset'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setAuthTab(tab);
                          setAuthError(null);
                        }}
                        className={`flex-1 pb-2 text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          authTab === tab
                            ? 'text-teal border-b-2 border-teal'
                            : 'text-ink-tertiary hover:text-ink-secondary'
                        }`}
                      >
                        {tab === 'login' ? 'Sign In' : tab === 'signup' ? 'Sign Up' : 'Reset Pin'}
                      </button>
                    ))}
                  </div>

                  {/* Errors */}
                  {authError && (
                    <div className="p-2.5 rounded-xl bg-deepblue/20 border border-deepblue/40 text-teal text-[10px] font-mono leading-normal">
                      ⚠️ {authError}
                    </div>
                  )}

                  {authTab === 'login' && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setAuthError(null);
                        const success = logIn(loginEmail, loginPassword);
                        if (success) {
                          setLoginEmail('');
                          setLoginPassword('');
                          setShowAuthModal(false);
                        } else {
                          setAuthError('Incorrect email or password.');
                        }
                      }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary">Email Address</span>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="name@domain.com"
                          required
                          className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal/45"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase font-mono text-ink-tertiary">Password</span>
                          <button
                            type="button"
                            onClick={() => setAuthTab('reset')}
                            className="text-[9px] text-teal hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal/45"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-2 bg-gradient-to-r from-ocean to-teal text-ink-primary font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-102 transition-transform shadow-lg cursor-pointer"
                      >
                        Sign In
                      </button>
                    </form>
                  )}

                  {authTab === 'signup' && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (signupPassword.length < 6) {
                          setAuthError('Password must be at least 6 characters.');
                          return;
                        }
                        setAuthError(null);
                        signUp(signupEmail, signupPassword, signupDisplayName, signupAvatarUrl);
                      }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary">Display Name</span>
                        <input
                          type="text"
                          value={signupDisplayName}
                          onChange={(e) => setSignupDisplayName(e.target.value)}
                          placeholder="Aura Enthusiast"
                          required
                          className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal/45"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary">Email Address</span>
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="name@domain.com"
                          required
                          className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal/45"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary">Password (min 6 chars)</span>
                        <input
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal/45"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary">Avatar Image (Optional)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setSignupAvatarUrl)}
                          className="bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal/45 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-teal/20 file:text-teal hover:file:bg-teal/30 cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-2 bg-gradient-to-r from-ocean to-teal text-ink-primary font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-102 transition-transform shadow-lg cursor-pointer"
                      >
                        Create Account
                      </button>
                    </form>
                  )}

                  {authTab === 'reset' && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setAuthError(null);
                        const success = requestPasswordReset(resetEmail);
                        if (success) {
                          setAuthError(null);
                        } else {
                          setAuthError('Email not found in database.');
                        }
                      }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-mono text-ink-tertiary">Email Address</span>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="name@domain.com"
                          required
                          className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal/45"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-2 bg-gradient-to-r from-ocean to-teal text-ink-primary font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-102 transition-transform shadow-lg cursor-pointer"
                      >
                        Send Reset Code
                      </button>
                    </form>
                  )}

                  {/* Social Logins Divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="text-[8.5px] uppercase font-mono text-ink-tertiary">Or Connect Via</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  {/* Social Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        socialLogin('google');
                        setShowAuthModal(false);
                      }}
                      className="py-2 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/12 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.437 0-3.555 2.882-6.438 6.437-6.438 1.54 0 2.947.55 4.054 1.45l3.068-3.068C19.183 2.164 15.973 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.898 0 10.79-4.26 10.79-10.79 0-.583-.052-1.138-.15-1.685H12.24z"/>
                      </svg>
                      Google
                    </button>
                    <button
                      onClick={() => {
                        socialLogin('github');
                        setShowAuthModal(false);
                      }}
                      className="py-2 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/12 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                      </svg>
                      GitHub
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
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
                <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-ocean to-teal rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(136, 13, 30,0.35)] mb-3">
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
                    className="w-full mt-4 py-2 bg-gradient-to-r from-deepblue via-ocean to-teal text-ink-primary font-black text-[10px] uppercase tracking-wider rounded-xl transition-transform active:scale-95 cursor-pointer shadow-lg"
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

      {/* ================= FIXED BOTTOM PLAYER BAR ================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0e27]/95 backdrop-blur-md border-t border-white/5 shadow-2xl">
        <AudioPlayer 
          onLyricsToggle={() => setShowLyricsModal(true)} 
          onUpgradePrompt={(msg, target) => triggerUpgradePrompt(msg, target)} 
        />
      </footer>

    </div>
  );
};



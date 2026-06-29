/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  AlignLeft, 
  Heart,
  Crown,
  Settings,
  Download,
  Check,
  ListMusic,
  Maximize2,
  Minimize2,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import { useMusicStore } from '../../store/musicStore';
import { Track } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface AudioPlayerProps {
  onLyricsToggle?: () => void;
  onUpgradePrompt?: (feature: string, tier: 'Premium' | 'Premium+') => void;
}

type AudioQuality = '128k' | '320k' | 'flac' | 'atmos';

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  onLyricsToggle,
  onUpgradePrompt 
}) => {
  const {
    tracks,
    currentTrack,
    setCurrentTrack,
    playbackState,
    setPlaybackState,
    userTier,
    isMuted,
    setMuted,
    volume,
    setVolume,
    useSkip,
    remainingSkips,
    downloadedTracks,
    downloadTrack,
    logAnalyticsEvent,
    incrementStats,
    queue,
    setQueue,
    toggleLike,
    currentUser
  } = useMusicStore();
  
  const [showQueue, setShowQueue] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const lastPlayedTrackRef = useRef<string | null>(null);

  // Trigger play stat update when currentTrack changes during active play
  useEffect(() => {
    if (currentTrack && playbackState === 'playing') {
      if (lastPlayedTrackRef.current !== currentTrack.id) {
        incrementStats('play');
        lastPlayedTrackRef.current = currentTrack.id;
      }
    }
  }, [currentTrack, playbackState, incrementStats]);

  // Trigger minutes listened increment
  useEffect(() => {
    if (playbackState !== 'playing') return;

    const interval = setInterval(() => {
      incrementStats('minute');
    }, 60000); // every 60 seconds

    return () => clearInterval(interval);
  }, [playbackState]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Quality settings
  const [quality, setQuality] = useState<AudioQuality>('128k');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // YouTube Time Sync
  useEffect(() => {
    let interval: any;
    if (playbackState === 'playing' && currentTrack?.youtubeId) {
      interval = setInterval(async () => {
        if (ytPlayerRef.current) {
          try {
            const time = await ytPlayerRef.current.getCurrentTime();
            if (time !== undefined) setCurrentTime(time);
            const dur = await ytPlayerRef.current.getDuration();
            if (dur > 0) setDuration(dur);
          } catch(e) {}
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [playbackState, currentTrack]);

  
  // Initialize and sync audio source
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, isShuffle, isRepeat]);

  const lastTrackIdRef = useRef<string | null>(null);

  // Handle track source and quality change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Determine correct URL based on quality selection
    let audioUrl = currentTrack.audioUrl128k;
    if (quality === '320k' && currentTrack.audioUrl320k) audioUrl = currentTrack.audioUrl320k;
    else if (quality === 'flac' && currentTrack.audioUrlFlac) audioUrl = currentTrack.audioUrlFlac;
    else if (quality === 'atmos' && currentTrack.audioUrlAtmos) audioUrl = currentTrack.audioUrlAtmos;

    // audio.src returns absolute URL, so we check if the ends match to avoid unnecessary reloads
    const isSameSource = audio.src.endsWith(audioUrl);
    if (!isSameSource && !currentTrack.youtubeId) {
      const savedTime = audio.currentTime;
      const isBitrateSwitch = lastTrackIdRef.current === currentTrack.id;
      
      audio.src = audioUrl;
      audio.load();
      
      // Restore playback scrubber timeline position ONLY if we are just switching bitrates on the same track
      if (isBitrateSwitch && savedTime > 0 && savedTime < duration) {
        audio.currentTime = savedTime;
      } else {
        audio.currentTime = 0;
        setCurrentTime(0);
      }
    }
    
    lastTrackIdRef.current = currentTrack.id;

    if (currentTrack.youtubeId) {
      audio.pause();
      if (ytPlayerRef.current) {
        if (playbackState === 'playing') ytPlayerRef.current.playVideo();
        else ytPlayerRef.current.pauseVideo();
      }
    } else {
      if (ytPlayerRef.current) try { ytPlayerRef.current.pauseVideo(); } catch(e) {}
      if (playbackState === 'playing') {
        audio.play().catch((err) => {
          console.warn('Playback failed, user interaction required:', err);
          setPlaybackState('paused');
        });
      } else {
        audio.pause();
      }
    }
  }, [currentTrack, playbackState, userTier, quality]);

  // Sync volume and mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (ytPlayerRef.current) {
      try { ytPlayerRef.current.setVolume(isMuted ? 0 : volume * 100); } catch(e) {}
    }
  }, [volume, isMuted]);

  // Reset quality selection if subscription tier downgrades
  useEffect(() => {
    if (userTier === 'Free') {
      setQuality('128k');
    } else if (userTier === 'Premium' && (quality === 'flac' || quality === 'atmos')) {
      setQuality('320k');
    }
  }, [userTier]);

  const handlePlayPause = () => {
    if (!currentTrack) return;
    
    if (playbackState === 'playing') {
      setPlaybackState('paused');
    } else {
      setPlaybackState('playing');
    }
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    
    // Free Skips gate check
    if (!useSkip()) {
      if (onUpgradePrompt) {
        onUpgradePrompt('bypass free skip limits', 'Premium');
      }
      return;
    }

    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    if (queue.length > 0) {
      let nextTrack: Track;
      let newQueue: Track[];
      if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        nextTrack = queue[randomIndex];
        newQueue = queue.filter((_, i) => i !== randomIndex);
      } else {
        nextTrack = queue[0];
        newQueue = queue.slice(1);
      }
      setQueue(newQueue);
      setCurrentTrack(nextTrack);
      setPlaybackState('playing');
      return;
    }

    let nextTrack: Track;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      nextTrack = tracks[randomIndex];
    } else {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % tracks.length;
      nextTrack = tracks[nextIndex];
    }

    setCurrentTrack(nextTrack);
    setPlaybackState('playing');
  };

  const handlePrev = () => {
    if (tracks.length === 0 || !currentTrack) return;
    
    // Free Skips gate check
    if (!useSkip()) {
      if (onUpgradePrompt) {
        onUpgradePrompt('bypass free skip limits', 'Premium');
      }
      return;
    }

    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = tracks.length - 1;
    
    const prevTrack = tracks[prevIndex];

    setCurrentTrack(prevTrack);
    setPlaybackState('playing');
  };

  const handlePlayFromQueue = (index: number) => {
    const nextTrack = queue[index];
    const newQueue = queue.slice(index + 1);
    setCurrentTrack(nextTrack);
    setQueue(newQueue);
    setPlaybackState('playing');
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCurrentTime(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
    if (ytPlayerRef.current) {
      ytPlayerRef.current.currentTime = value;
    }
  };

  const handleQualitySelect = (targetQuality: AudioQuality) => {
    setShowQualityMenu(false);
    if (targetQuality === '128k') {
      setQuality('128k');
      return;
    }
    
    if (targetQuality === '320k') {
      if (userTier === 'Free') {
        if (onUpgradePrompt) onUpgradePrompt('stream in 320kbps High Quality', 'Premium');
      } else {
        setQuality('320k');
        logAnalyticsEvent('Selected high audio quality: 320kbps');
      }
      return;
    }

    if (targetQuality === 'flac') {
      if (userTier !== 'Premium+') {
        if (onUpgradePrompt) onUpgradePrompt('stream in Lossless FLAC Studio Quality', 'Premium+');
      } else {
        setQuality('flac');
        logAnalyticsEvent('Selected lossless quality: FLAC');
      }
      return;
    }

    if (targetQuality === 'atmos') {
      if (userTier !== 'Premium+') {
        if (onUpgradePrompt) onUpgradePrompt('stream in Spatial Audio Dolby Atmos', 'Premium+');
      } else {
        setQuality('atmos');
        logAnalyticsEvent('Selected spatial audio mode: Dolby Atmos');
      }
      return;
    }
  };

  const handleDownload = () => {
    if (!currentTrack) return;
    if (userTier === 'Free') {
      if (onUpgradePrompt) onUpgradePrompt('download tracks for offline play', 'Premium');
      return;
    }
    downloadTrack(currentTrack.id);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getQualityBadgeColor = () => {
    if (quality === 'atmos') return 'text-teal bg-teal/10 border-teal/20';
    if (quality === 'flac') return 'text-ocean bg-ocean/10 border-ocean/20';
    if (quality === '320k') return 'text-slate-soft bg-slate-default/10 border-slate-default/20';
    return 'text-ink-secondary bg-white/5 border-white/10';
  };

  const isDownloaded = currentTrack ? downloadedTracks.includes(currentTrack.id) : false;

  return (
    <>
    {/* Mobile Compact Player */}
    {isMobile && (
      <div 
        onClick={() => setIsMobileExpanded(true)}
        className="flex items-center gap-3 px-4 py-3 bg-[#1c1c1e]/96 backdrop-blur-xl border border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.6)] rounded-2xl w-[calc(100vw-2rem)] max-w-sm mx-auto cursor-pointer active:scale-[0.98] transition-transform"
      >
        {currentTrack ? (
          <>
            <img src={currentTrack.coverUrl} className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-md" alt={currentTrack.title} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-[13px] font-bold truncate leading-tight">{currentTrack.title}</p>
              <p className="text-slate-400 text-[11px] truncate">{currentTrack.artist}</p>
              <div className="mt-1.5 h-[2px] bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-100" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-white flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <button onClick={handlePrev} className="text-slate-300 hover:text-white transition-colors active:scale-90" title="Previous">
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button 
                onClick={handlePlayPause}
                className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                title={playbackState === 'playing' ? 'Pause' : 'Play'}
              >
                {playbackState === 'playing' ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <button onClick={handleNext} className="text-slate-300 hover:text-white transition-colors active:scale-90" title="Next">
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-slate-500 text-xs font-mono w-full text-center py-1">No Song Selected</div>
        )}
      </div>
    )}

    {/* Mobile Expanded Player */}
    <AnimatePresence>
      {isMobile && isMobileExpanded && currentTrack && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[120] bg-[#121212] text-white flex flex-col p-6 overflow-hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: 'env(safe-area-inset-top)' }}
        >
           {/* Background with blur */}
           <div 
             className="absolute inset-0 opacity-40 mix-blend-screen bg-cover bg-center blur-[80px]"
             style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
           />
           <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black pointer-events-none" />

           {/* Top Bar */}
           <div className="relative z-10 flex justify-between items-center mb-6 pt-4">
             <button onClick={() => setIsMobileExpanded(false)} className="p-2 -ml-2 text-slate-300 hover:text-white transition-colors active:scale-90">
               <ChevronDown className="w-7 h-7" />
             </button>
             <div className="flex flex-col items-center">
               <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Now Playing</span>
               <span className="text-xs font-medium text-white max-w-[200px] truncate">{currentTrack.album || 'Single'}</span>
             </div>
             <button className="p-2 -mr-2 text-slate-300 hover:text-white transition-colors active:scale-90 relative" onClick={() => setShowQualityMenu(!showQualityMenu)}>
               <MoreVertical className="w-6 h-6" />
               {showQualityMenu && (
                 <div className="absolute top-full right-0 mt-2 bg-[#2c2c2c] border border-white/10 rounded-xl p-2 w-48 shadow-2xl z-50">
                  <div className="text-[10px] uppercase text-silver/50 font-bold tracking-wider px-3 pb-2 pt-1 border-b border-white/10 mb-2 text-left">Audio Quality</div>
                  {(['128k', '320k', 'flac', 'atmos'] as AudioQuality[]).map((q) => (
                    <button
                      key={q}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (q === 'flac' || q === 'atmos') {
                          if (userTier === 'Free') {
                            if (onUpgradePrompt) onUpgradePrompt(`unlock ${q.toUpperCase()} quality`, 'Premium+');
                            return;
                          }
                        }
                        setQuality(q);
                        setShowQualityMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${quality === q ? 'bg-teal/20 text-teal font-bold' : 'text-silver hover:bg-white/10'}`}
                    >
                      <span className="flex items-center gap-2">
                        {q === 'atmos' && <Crown className="w-3 h-3" />}
                        {q.toUpperCase()}
                      </span>
                      {quality === q && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
               )}
             </button>
           </div>

           {/* Artwork */}
           <div className="relative z-10 w-full aspect-square max-w-[340px] mx-auto mb-8 mt-2">
             <img src={currentTrack.coverUrl} className="w-full h-full object-cover rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]" alt={currentTrack.title} />
           </div>

           {/* Info */}
           <div className="relative z-10 flex justify-between items-end mb-6 px-2">
             <div className="flex flex-col min-w-0 pr-4">
               <h2 className="text-[22px] font-bold truncate text-white mb-1 leading-tight">{currentTrack.title}</h2>
               <p className="text-base text-slate-300 truncate">{currentTrack.artist}</p>
             </div>
             <button 
                onClick={() => {
                  if (currentUser) {
                    toggleLike(currentUser.id, currentTrack.id);
                  }
                }}
                className="p-2 -mr-2 active:scale-90 transition-transform"
              >
               <Heart className={`w-7 h-7 ${currentUser?.likedTracks?.includes(currentTrack.id) ? 'fill-current text-teal' : 'text-slate-300 hover:text-white'}`} />
             </button>
           </div>

           {/* Progress */}
           <div className="relative z-10 flex flex-col mb-8 px-2">
             <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer relative" onClick={handleProgressClick}>
               <div className="h-full bg-white rounded-full transition-all duration-100" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
               {/* Progress handle thumb */}
               <div 
                 className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-100" 
                 style={{ left: `max(0%, calc(${(currentTime / (duration || 1)) * 100}% - 6px))` }} 
               />
             </div>
             <div className="flex justify-between mt-3 text-[11px] text-slate-400 font-mono tracking-wide">
               <span>{formatTime(currentTime)}</span>
               <span>{formatTime(duration)}</span>
             </div>
           </div>

           {/* Main Controls */}
           <div className="relative z-10 flex justify-between items-center px-2 mb-8">
             <button onClick={() => setIsShuffle(!isShuffle)} className={`p-2 transition-colors active:scale-90 ${isShuffle ? 'text-teal' : 'text-slate-300 hover:text-white'}`}>
               <Shuffle className="w-6 h-6" />
             </button>
             
             <button onClick={handlePrev} className="p-2 text-white active:scale-90 transition-transform">
               <SkipBack className="w-10 h-10 fill-current" />
             </button>
             
             <button 
               onClick={handlePlayPause}
               className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
             >
               {playbackState === 'playing' ? (
                 <Pause className="w-8 h-8 fill-current" />
               ) : (
                 <Play className="w-8 h-8 fill-current ml-1" />
               )}
             </button>
             
             <button onClick={handleNext} className="p-2 text-white active:scale-90 transition-transform">
               <SkipForward className="w-10 h-10 fill-current" />
             </button>

             <button onClick={() => setIsRepeat(!isRepeat)} className={`p-2 transition-colors active:scale-90 ${isRepeat ? 'text-teal' : 'text-slate-300 hover:text-white'}`}>
               <Repeat className="w-6 h-6" />
             </button>
           </div>

           {/* Bottom secondary controls */}
           <div className="relative z-10 flex justify-between items-center px-2 mt-auto pb-6 text-slate-300">
             <button onClick={() => setShowQueue(!showQueue)} className="p-2 hover:text-white transition-colors active:scale-90">
               <ListMusic className={`w-6 h-6 ${showQueue ? 'text-teal' : ''}`} />
             </button>
             <button onClick={handleDownload} className="p-2 hover:text-white transition-colors active:scale-90 relative">
               <Download className="w-6 h-6" />
               {isDownloaded && (
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal rounded-full flex items-center justify-center border-2 border-[#1c1c1e]">
                   <Check className="w-2 h-2 text-black" />
                 </div>
               )}
             </button>
             {onLyricsToggle && (
               <button onClick={onLyricsToggle} className="p-2 hover:text-white transition-colors active:scale-90">
                 <AlignLeft className="w-6 h-6" />
               </button>
             )}
             {currentTrack?.youtubeId && (
               <button onClick={() => setIsFullScreen(true)} className="p-2 hover:text-white transition-colors active:scale-90" title="Full Screen Video">
                 <Maximize2 className="w-6 h-6" />
               </button>
             )}
           </div>

           {/* Queue View Overlay */}
           <AnimatePresence>
             {showQueue && (
               <motion.div 
                 initial={{ y: '100%' }}
                 animate={{ y: 0 }}
                 exit={{ y: '100%' }}
                 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                 className="absolute inset-0 z-20 bg-black/95 backdrop-blur-3xl p-6 flex flex-col"
                 style={{ paddingTop: 'env(safe-area-inset-top)' }}
               >
                 <div className="flex justify-between items-center mb-8 pt-4">
                   <button onClick={() => setShowQueue(false)} className="p-2 -ml-2 text-slate-300 hover:text-white transition-colors active:scale-90">
                     <ChevronDown className="w-7 h-7" />
                   </button>
                   <h3 className="font-bold text-lg text-white">Queue</h3>
                   <div className="w-11" /> {/* spacer */}
                 </div>
                 
                 <div className="flex-1 overflow-y-auto custom-scroll flex flex-col gap-2">
                   <div className="text-xs uppercase text-slate-400 font-bold mb-2">Now Playing</div>
                   <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl mb-4">
                     <img src={currentTrack.coverUrl} className="w-12 h-12 rounded-lg object-cover" />
                     <div className="flex-1 min-w-0">
                       <div className="text-teal font-bold truncate text-sm">{currentTrack.title}</div>
                       <div className="text-slate-300 text-xs truncate">{currentTrack.artist}</div>
                     </div>
                   </div>
                   
                   {queue.length > 0 && (
                     <>
                       <div className="text-xs uppercase text-slate-400 font-bold mb-2 mt-4">Next in Queue</div>
                       {queue.map((track, i) => (
                         <div key={`${track.id}-${i}`} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors">
                           <img src={track.coverUrl} className="w-12 h-12 rounded-lg object-cover" />
                           <div className="flex-1 min-w-0">
                             <div className="text-white font-medium truncate text-sm">{track.title}</div>
                             <div className="text-slate-400 text-xs truncate">{track.artist}</div>
                           </div>
                         </div>
                       ))}
                     </>
                   )}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>

    {/* Desktop Full Player */}
    {!isMobile && (
    <div className="flex items-center gap-4 px-6 py-2.5 bg-[#2c2c2c]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-full relative z-40 mx-auto w-max max-w-[95vw] transition-all">
      
      {/* Left section: Playback Controls */}
      <div className="flex items-center gap-4 text-slate-300">
        <button 
          onClick={() => setIsShuffle(!isShuffle)} 
          className={`transition-colors cursor-pointer ${isShuffle ? 'text-teal' : 'hover:text-white'}`}
          title="Shuffle"
        >
          <Shuffle className="w-4 h-4" />
        </button>
        
        <button onClick={handlePrev} className="hover:text-white transition-colors cursor-pointer" title="Previous">
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        <button 
          onClick={handlePlayPause} 
          className="text-white hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          title={playbackState === 'playing' ? 'Pause' : 'Play'}
        >
          {playbackState === 'playing' ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        <button onClick={handleNext} className="hover:text-white transition-colors cursor-pointer" title="Next">
          <SkipForward className="w-4 h-4 fill-current" />
        </button>

        <button 
          onClick={() => setIsRepeat(!isRepeat)} 
          className={`transition-colors cursor-pointer ${isRepeat ? 'text-teal' : 'hover:text-white'}`}
          title="Repeat"
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Center section: Song Details & Scrubber */}
      <div className="flex items-center gap-3 relative min-w-[250px] max-w-[350px] mx-4">
        {currentTrack ? (
          <>
            <img src={currentTrack.coverUrl} className="w-9 h-9 rounded object-cover shadow-md" alt="" />
            <div className="flex flex-col justify-center min-w-0 w-full relative pb-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[12px] font-bold text-white truncate">{currentTrack.title}</h4>
                {currentTrack.isPremium && (
                  <span className="text-[8px] bg-white/20 text-white px-1 py-0.5 rounded-sm font-bold uppercase leading-none">E</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate">{currentTrack.artist} — {currentTrack.album}</p>
              
              {/* Integrated ultra-thin progress bar below text */}
              <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white/10 rounded-full overflow-hidden pointer-events-none">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100 ease-linear" 
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} 
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleScrub}
                className="absolute -bottom-2 left-0 right-0 w-full h-4 opacity-0 cursor-pointer z-10"
                title={`${formatTime(currentTime)} / ${formatTime(duration)}`}
              />
            </div>
          </>
        ) : (
          <div className="text-slate-500 text-xs font-mono w-full text-center py-2">No Song Selected</div>
        )}
      </div>

      {/* Right section: Actions & Volume */}
      <div className="flex items-center gap-4 text-slate-300">
        
        {/* Quality/Preview Badge */}
        <div className="relative">
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded-full text-[9px] font-bold tracking-wider text-slate-300 transition-colors uppercase cursor-pointer"
            title="Stream Quality"
          >
            {quality === '128k' ? 'PREVIEW' : quality}
          </button>
          
          <AnimatePresence>
            {showQualityMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowQualityMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-4 z-50 bg-[#2c2c2c] border border-white/10 rounded-xl p-1.5 shadow-2xl w-40 flex flex-col gap-0.5 origin-bottom-right"
                >
                  <div className="text-[8.5px] uppercase font-mono text-slate-400 font-bold px-2 py-1 select-none">
                    Select Audio Quality
                  </div>
                  <button onClick={() => handleQualitySelect('128k')} className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] text-white hover:bg-white/10 rounded-lg text-left cursor-pointer">
                    <span>Preview (128kbps)</span>
                    {quality === '128k' && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <button onClick={() => handleQualitySelect('320k')} className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] text-white hover:bg-white/10 rounded-lg text-left cursor-pointer">
                    <span className="flex items-center gap-1">High (320kbps) {userTier === 'Free' && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500/20" />}</span>
                    {quality === '320k' && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <button onClick={() => handleQualitySelect('flac')} className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] text-white hover:bg-white/10 rounded-lg text-left cursor-pointer">
                    <span className="flex items-center gap-1">Lossless FLAC {userTier !== 'Premium+' && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500/20" />}</span>
                    {quality === 'flac' && <Check className="w-3 h-3 text-white" />}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Mini Context Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { if (currentUser && currentTrack) toggleLike(currentTrack.id); }} 
            className="hover:text-white transition-colors cursor-pointer"
            title="Like"
          >
            <Heart className={`w-4 h-4 ${currentUser?.likedTracks?.includes(currentTrack?.id || '') ? 'fill-white text-white' : ''}`} />
          </button>

          {onLyricsToggle && currentTrack?.lyrics && (
            <button onClick={onLyricsToggle} className="hover:text-white transition-colors cursor-pointer" title="Lyrics">
              <AlignLeft className="w-4 h-4" />
            </button>
          )}

          <button onClick={handleDownload} className={`hover:text-white transition-colors cursor-pointer ${isDownloaded ? 'text-white' : ''}`} title="Download">
            {isDownloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          </button>
        </div>

        {/* Queue Menu */}
        <div className="relative">
          <button onClick={() => setShowQueue(!showQueue)} className={`hover:text-white transition-colors cursor-pointer ${showQueue ? 'text-white' : ''}`} title="Queue">
            <ListMusic className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showQueue && queue.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full right-0 mb-6 w-72 max-h-80 bg-[#2c2c2c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-50 origin-bottom-right"
              >
                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ListMusic className="w-3.5 h-3.5" /> Up Next
                  </h3>
                  <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">{queue.length} track{queue.length !== 1 && 's'}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scroll p-1.5 flex flex-col gap-1">
                  {queue.map((track, idx) => (
                    <div 
                      key={`${track.id}-${idx}`} 
                      onClick={() => handlePlayFromQueue(idx)}
                      className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl group transition-all cursor-pointer border border-transparent hover:border-white/10 relative"
                    >
                      <div className="relative shrink-0">
                        <img src={track.coverUrl} className="w-8 h-8 rounded-md object-cover shadow-md group-hover:opacity-50 transition-opacity" alt={track.title} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex flex-col overflow-hidden flex-1">
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-white transition-colors truncate">{track.title}</span>
                        <span className="text-[9px] text-slate-400 group-hover:text-slate-300 transition-colors truncate">{track.artist}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 group relative">
          <button onClick={() => setMuted(!isMuted)} className="hover:text-white transition-colors cursor-pointer" title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          {/* Hover volume slider */}
          <div className="absolute bottom-full right-0 mb-4 p-3 bg-[#2c2c2c] border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all origin-bottom flex items-center justify-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setMuted(false);
              }}
              className="w-24 accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Fullscreen Video Expand — desktop only */}
        {currentTrack?.youtubeId && !isMobile && (
          <button 
            onClick={() => setIsFullScreen(true)}
            className="hover:text-white transition-colors cursor-pointer ml-1"
            title="Full Screen Video"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

      </div>

    </div>
    )}
      
      {/* YouTube Player — hidden for audio; fullscreen on desktop */}
      {currentTrack?.youtubeId && (
        <div
          className={isFullScreen ? "fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center" : ""}
          style={isFullScreen ? {} : { position: 'fixed', bottom: '-9999px', width: '1px', height: '1px', overflow: 'hidden', pointerEvents: 'none' }}
        >
          {isFullScreen && (
            <button 
              onClick={() => setIsFullScreen(false)}
              className="absolute top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer backdrop-blur-md transition-all"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
          )}
          
          <YouTube
            videoId={currentTrack.youtubeId}
            className={isFullScreen ? "w-full h-full pointer-events-none" : ""}
            iframeClassName={isFullScreen ? "w-full h-full" : ""}
            opts={{
              height: isFullScreen ? '100%' : '1',
              width: isFullScreen ? '100%' : '1',
              playerVars: {
                autoplay: playbackState === 'playing' ? 1 : 0,
                controls: 0,
                disablekb: 1,
                modestbranding: 1,
                rel: 0
              },
            }}
            onReady={(e) => {
              ytPlayerRef.current = e.target;
              e.target.setVolume(isMuted ? 0 : volume * 100);
              if (playbackState === 'playing') e.target.playVideo();
            }}
            onStateChange={(e) => {
              if (e.data === 0) handleNext();
              else if (e.data === 1 && playbackState !== 'playing') setPlaybackState('playing');
              else if (e.data === 2 && playbackState !== 'paused') setPlaybackState('paused');
            }}
            onError={() => console.warn('YouTube playback failed')}
          />
        </div>
      )}
    </>
  );
};


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
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
  ListMusic
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
    setQueue
  } = useMusicStore();
  
  const [showQueue, setShowQueue] = useState(false);

  // Trigger play stat update when currentTrack changes during active play
  useEffect(() => {
    if (currentTrack && playbackState === 'playing') {
      incrementStats('play');
    }
  }, [currentTrack, playbackState]);

  // Trigger minutes listened increment
  useEffect(() => {
    if (playbackState !== 'playing') return;

    const interval = setInterval(() => {
      incrementStats('minute');
    }, 60000); // every 60 seconds

    return () => clearInterval(interval);
  }, [playbackState]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Quality settings
  const [quality, setQuality] = useState<AudioQuality>('128k');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

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

  // Handle track source and quality change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Determine correct URL based on quality selection
    let audioUrl = currentTrack.audioUrl128k;
    if (quality === '320k') audioUrl = currentTrack.audioUrl320k;
    else if (quality === 'flac') audioUrl = currentTrack.audioUrlFlac;
    else if (quality === 'atmos') audioUrl = currentTrack.audioUrlAtmos;

    const isSameSource = audio.src === audioUrl;
    if (!isSameSource) {
      const savedTime = audio.currentTime;
      audio.src = audioUrl;
      audio.load();
      // Restore playback scrubber timeline position if we are just switching bitrates
      if (savedTime > 0 && savedTime < duration) {
        audio.currentTime = savedTime;
      }
    }

    if (playbackState === 'playing') {
      audio.play().catch((err) => {
        console.warn('Playback failed, user interaction required:', err);
        setPlaybackState('paused');
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, playbackState, userTier, quality]);

  // Sync volume and mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
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

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCurrentTime(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
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
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 bg-graphite/70 backdrop-blur-lg border-t border-slate-default/40 shadow-2xl relative z-40">
      
      {/* Left section: Song Details */}
      <div className="flex items-center gap-3 w-full md:w-1/4 min-w-[200px]">
        {currentTrack ? (
          <>
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-silver/15 shadow-md flex-shrink-0 relative">
              <AnimatePresence mode="popLayout">
                <motion.img 
                  key={currentTrack.id}
                  src={currentTrack.coverUrl} 
                  className="w-full h-full object-cover absolute inset-0" 
                  alt="" 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-ink-primary truncate hover:underline cursor-pointer">
                  {currentTrack.title}
                </h4>
                {currentTrack.isPremiumPlus && (
                  <span className="text-[7.5px] uppercase font-mono tracking-widest text-teal font-bold bg-teal/10 px-1 py-0.5 rounded border border-teal/20">Plus</span>
                )}
                {!currentTrack.isPremiumPlus && currentTrack.isPremium && (
                  <span className="text-[7.5px] uppercase font-mono tracking-widest text-silver font-bold bg-silver/10 px-1 py-0.5 rounded border border-silver/20">Prem</span>
                )}
              </div>
              <p className="text-xs text-ink-secondary truncate">{currentTrack.artist}</p>
            </div>
            <div className="flex items-center gap-1">
              {/* Like trigger */}
              <button 
                onClick={() => setIsLiked(!isLiked)} 
                className="p-1 hover:text-white transition-colors"
              >
                <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              </button>
              
              {/* Lyrics trigger */}
              {onLyricsToggle && currentTrack.lyrics && (
                <button 
                  onClick={onLyricsToggle} 
                  className="p-1 text-slate-400 hover:text-white transition-colors" 
                  title="View Lyrics"
                >
                  <AlignLeft className="w-4.5 h-4.5" />
                </button>
              )}

              {/* Download trigger */}
              <button
                onClick={handleDownload}
                className={`p-1 transition-colors cursor-pointer ${
                  isDownloaded ? 'text-emerald-450' : 'text-slate-400 hover:text-white'
                }`}
                title={isDownloaded ? 'Offline Downloaded' : 'Download Offline'}
              >
                {isDownloaded ? <Check className="w-4.5 h-4.5" /> : <Download className="w-4.5 h-4.5" />}
              </button>
            </div>
          </>
        ) : (
          <div className="text-slate-500 text-xs font-mono">No Song Selected</div>
        )}
      </div>

      {/* Center section: Media Controls */}
      <div className="flex flex-col items-center gap-2 w-full md:w-2/4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setIsShuffle(!isShuffle)} 
            className={`p-1.5 transition-colors cursor-pointer ${isShuffle ? 'text-teal' : 'text-ink-secondary hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handlePrev} 
            className="p-1.5 text-ink-secondary hover:text-white transition-colors cursor-pointer"
            title="Previous"
          >
            <SkipBack className="w-4.5 h-4.5 fill-current" />
          </button>

          <button 
            onClick={handlePlayPause} 
            className="p-3 bg-ink-primary text-shadow rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md flex items-center justify-center animate-pulse"
            title={playbackState === 'playing' ? 'Pause' : 'Play'}
            style={{ animationDuration: '3s' }}
          >
            {playbackState === 'playing' ? (
              <Pause className="w-5 h-5 fill-current text-shadow" />
            ) : (
              <Play className="w-5 h-5 fill-current text-shadow ml-0.5" />
            )}
          </button>

          <button 
            onClick={handleNext} 
            className="p-1.5 text-ink-secondary hover:text-white transition-colors cursor-pointer"
            title="Next"
          >
            <SkipForward className="w-4.5 h-4.5 fill-current" />
          </button>

          <button 
            onClick={() => setIsRepeat(!isRepeat)} 
            className={`p-1.5 transition-colors cursor-pointer ${isRepeat ? 'text-teal' : 'text-ink-secondary hover:text-white'}`}
            title="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Scrubber Progress Slider */}
        <div className="w-full flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-ink-tertiary min-w-[30px] text-right">
            {formatTime(currentTime)}
          </span>
          
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleScrub}
            className="w-full accent-teal h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:accent-ocean transition-all"
          />

          <span className="text-[10px] font-mono text-ink-tertiary min-w-[30px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right section: Quality Selector, Vol, Skips remaining */}
      <div className="flex items-center gap-4 w-full md:w-1/4 justify-end min-w-[200px]">
        {/* Free Skips Indicator */}
        {userTier === 'Free' && (
          <span className="text-[9px] font-mono text-ink-tertiary" title="Skips remaining before upgrade required">
            Skips: {remainingSkips}/6
          </span>
        )}

        {/* Bitrate Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border uppercase tracking-wider transition-all cursor-pointer ${getQualityBadgeColor()}`}
            title="Stream Quality"
          >
            <Settings className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
            <span>{quality}</span>
          </button>

          <AnimatePresence>
            {showQualityMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowQualityMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 z-50 bg-[#0e1026] border border-white/10 rounded-xl p-1.5 shadow-2xl w-40 flex flex-col gap-0.5"
                >
                  <div className="text-[8.5px] uppercase font-mono text-slate-500 font-bold px-2 py-1 select-none">
                    Select Audio Quality
                  </div>

                  <button
                    onClick={() => handleQualitySelect('128k')}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] text-ink-primary hover:bg-white/5 rounded-lg text-left cursor-pointer font-mono"
                  >
                    <span>128kbps Standard</span>
                    {quality === '128k' && <Check className="w-3 h-3 text-teal" />}
                  </button>

                  <button
                    onClick={() => handleQualitySelect('320k')}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] text-ink-primary hover:bg-white/5 rounded-lg text-left cursor-pointer font-mono"
                  >
                    <span className="flex items-center gap-1">
                      320kbps High {userTier === 'Free' && <Crown className="w-3 h-3 text-teal fill-teal/20" />}
                    </span>
                    {quality === '320k' && <Check className="w-3 h-3 text-teal" />}
                  </button>

                  <button
                    onClick={() => handleQualitySelect('flac')}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] text-ink-primary hover:bg-white/5 rounded-lg text-left cursor-pointer font-mono"
                  >
                    <span className="flex items-center gap-1">
                      Lossless FLAC {userTier !== 'Premium+' && <Crown className="w-3 h-3 text-teal fill-teal/20" />}
                    </span>
                    {quality === 'flac' && <Check className="w-3 h-3 text-teal" />}
                  </button>

                  <button
                    onClick={() => handleQualitySelect('atmos')}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] text-ink-primary hover:bg-white/5 rounded-lg text-left cursor-pointer font-mono"
                  >
                    <span className="flex items-center gap-1">
                      Dolby Atmos {userTier !== 'Premium+' && <Crown className="w-3 h-3 text-teal fill-teal/20" />}
                    </span>
                    {quality === 'atmos' && <Check className="w-3 h-3 text-teal" />}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Queue UI */}
          <button 
            onClick={() => setShowQueue(!showQueue)}
            className={`p-1.5 transition-all cursor-pointer rounded-full ${showQueue || queue.length > 0 ? 'text-teal hover:bg-teal/10' : 'text-ink-secondary hover:text-white hover:bg-white/5'}`}
            title="Up Next"
          >
            <div className="relative">
              <ListMusic className="w-4 h-4" />
              {queue.length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-teal rounded-full animate-pulse" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {showQueue && queue.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full right-0 mb-6 w-72 max-h-80 bg-[#0a0e27]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-50 origin-bottom-right"
              >
                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ListMusic className="w-3.5 h-3.5 text-teal" /> Up Next
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono bg-black/40 px-2 py-0.5 rounded-full">{queue.length} track{queue.length !== 1 && 's'}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scroll p-1.5 flex flex-col gap-1">
                  {queue.map((track, idx) => (
                    <div key={`${track.id}-${idx}`} className="flex items-center gap-3 p-1.5 hover:bg-white/5 rounded-xl group transition-colors">
                      <img src={track.coverUrl} className="w-8 h-8 rounded-md object-cover shadow-md" alt={track.title} />
                      <div className="flex flex-col overflow-hidden flex-1">
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate">{track.title}</span>
                        <span className="text-[9px] text-slate-400 truncate">{track.artist}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMuted(!isMuted)} 
            className="p-1 text-ink-secondary hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
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
            className="w-16 accent-teal h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            title="Volume"
          />
        </div>
        </div>
      </div>

    </div>
  );
};


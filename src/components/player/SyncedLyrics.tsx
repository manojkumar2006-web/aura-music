import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLyrics } from '../../lib/lrclib';
import { parseLrc, LrcLine } from '../../lib/lrcParser';
import { X, Mic2, AlertCircle, Loader2 } from 'lucide-react';

interface SyncedLyricsProps {
  trackTitle: string;
  trackArtist: string;
  currentTime: number;
  onClose: () => void;
  albumCover?: string;
  fallbackPlainLyrics?: string;
}

export const SyncedLyrics: React.FC<SyncedLyricsProps> = ({
  trackTitle,
  trackArtist,
  currentTime,
  onClose,
  albumCover,
  fallbackPlainLyrics
}) => {
  const [lrcLines, setLrcLines] = useState<LrcLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(fallbackPlainLyrics || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Fetch Lyrics
  useEffect(() => {
    let isMounted = true;
    
    const loadLyrics = async () => {
      setIsLoading(true);
      setError(null);
      setLrcLines([]);
      
      const artistQuery = trackArtist.split(',')[0]; // Use primary artist for better match
      
      try {
        const res = await fetchLyrics(trackTitle, artistQuery);
        if (!isMounted) return;
        
        if (res) {
          if (res.syncedLyrics) {
            setLrcLines(parseLrc(res.syncedLyrics));
          } else if (res.plainLyrics) {
            setPlainLyrics(res.plainLyrics);
          } else {
            setError("Lyrics not available for this track.");
          }
        } else if (!fallbackPlainLyrics) {
          setError("Lyrics not available for this track.");
        }
      } catch (err) {
        if (!isMounted) return;
        if (!fallbackPlainLyrics) {
          setError("Failed to fetch lyrics.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    loadLyrics();
    
    return () => {
      isMounted = false;
    };
  }, [trackTitle, trackArtist, fallbackPlainLyrics]);

  // Auto-scroll logic
  useEffect(() => {
    if (activeLineRef.current && scrollRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime, lrcLines]);

  // Determine active line
  let activeIndex = -1;
  for (let i = 0; i < lrcLines.length; i++) {
    if (currentTime >= lrcLines[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[150] flex flex-col bg-[#0a0a0a] text-white overflow-hidden"
    >
      {/* Background Blur */}
      {albumCover && (
        <div 
          className="absolute inset-0 opacity-20 blur-[100px] scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${albumCover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-teal uppercase tracking-widest flex items-center gap-2 mb-1">
            <Mic2 className="w-3 h-3" /> Synced Lyrics
          </span>
          <h2 className="text-2xl font-bold font-display tracking-tight">{trackTitle}</h2>
          <p className="text-sm text-slate-400">{trackArtist}</p>
        </div>
        
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Lyrics Container */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex-grow overflow-y-auto custom-scroll pb-64 pt-32 px-6 sm:px-12 md:px-24 scroll-smooth"
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-teal" />
            <p className="font-mono text-xs uppercase tracking-widest">Loading Lyrics...</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500/50" />
            <p className="font-mono text-xs uppercase tracking-widest">{error}</p>
            {fallbackPlainLyrics && (
              <div className="mt-8 text-left whitespace-pre-wrap text-xl md:text-2xl font-bold leading-relaxed opacity-50 max-w-2xl mx-auto">
                {fallbackPlainLyrics}
              </div>
            )}
          </div>
        ) : lrcLines.length > 0 ? (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-40">
            {lrcLines.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;
              
              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  className={`transition-all duration-500 transform ${
                    isActive 
                      ? 'text-3xl md:text-5xl font-bold text-white scale-100 opacity-100' 
                      : isPast
                        ? 'text-2xl md:text-4xl font-bold text-white/30 scale-95 opacity-30'
                        : 'text-2xl md:text-4xl font-bold text-white/30 scale-95 opacity-30 hover:opacity-50'
                  }`}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        ) : plainLyrics ? (
          <div className="max-w-2xl mx-auto whitespace-pre-wrap text-xl md:text-3xl font-bold leading-relaxed text-white/70 text-center pb-20">
            {plainLyrics}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

import React, { useEffect, useState, useRef, memo } from 'react';
import { Play, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { Track } from '../types';
import { useMusicStore } from '../store/musicStore';

interface SectionProps {
  title: string;
  query: string;
}

// Module-level in-memory cache to eliminate redundant network requests on scroll
const sectionCache = new Map<string, Track[]>();

export const Section: React.FC<SectionProps> = memo(({ title, query }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const setCurrentTrack = useMusicStore((state) => state.setCurrentTrack);
  const setQueue = useMusicStore((state) => state.setQueue);
  const currentTrack = useMusicStore((state) => state.currentTrack);
  const setPlaybackState = useMusicStore((state) => state.setPlaybackState);
  const addTracksToLibrary = useMusicStore((state) => state.addTracksToLibrary);

  useEffect(() => {
    let isMounted = true;

    // 0ms Cache Hit Check
    if (sectionCache.has(query)) {
      const cachedTracks = sectionCache.get(query)!;
      setTracks(cachedTracks);
      addTracksToLibrary(cachedTracks);
      setLoading(false);
      return;
    }

    const fetchTracks = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          const sectionTracks = shuffled.slice(0, 15);
          sectionCache.set(query, sectionTracks);
          setTracks(sectionTracks);
          addTracksToLibrary(sectionTracks);
        }
      } catch (e) {
        console.error('Failed to load section:', title, e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTracks();
    
    return () => { isMounted = false; };
  }, [query, title, addTracksToLibrary]);

  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
    setPlaybackState('playing');
    setQueue(tracks);
  };

  if (loading) {
    return (
      <div className="mb-10 animate-pulse">
        <div className="h-8 w-48 bg-slate-800/60 rounded mb-4 ml-6"></div>
        <div className="flex gap-4 px-6 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-none w-36 h-48 bg-slate-800/40 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="mb-10 perspective-wrapper"
    >
      <h2 className="text-2xl font-bold text-white mb-4 px-6 font-display tracking-tight">{title}</h2>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 px-6 overflow-x-auto pb-6 custom-scroll snap-x"
      >
        {tracks.map((track) => (
          <div 
            key={track.id} 
            className="flex-none w-36 group relative snap-start"
          >
            <div 
              className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg cursor-pointer border border-white/10 group-hover:border-white/30 transition-colors"
              onClick={() => handlePlay(track)}
            >
              <img 
                src={track.coverUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80"} 
                alt={track.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Play Button Overlay */}
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${currentTrack?.id === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-xl hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 
                  className={`font-medium truncate text-sm cursor-pointer ${currentTrack?.id === track.id ? 'text-white font-bold' : 'text-slate-200 hover:text-white'}`}
                  onClick={() => handlePlay(track)}
                  title={track.title}
                >
                  {track.title}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5" title={track.artist}>
                  {track.artist}
                </p>
              </div>
              <button 
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

Section.displayName = 'Section';

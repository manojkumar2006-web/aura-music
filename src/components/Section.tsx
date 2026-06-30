import React, { useEffect, useState, useRef } from 'react';
import { Play, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { Play as IgnoreMe } from 'lucide-react';
import { Track } from '../types';
import { useMusicStore } from '../store/musicStore';

interface SectionProps {
  title: string;
  query: string;
}

export function Section({ title, query }: SectionProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const setCurrentTrack = useMusicStore((state) => state.setCurrentTrack);
  const setQueue = useMusicStore((state) => state.setQueue);
  const currentTrack = useMusicStore((state) => state.currentTrack);
  const isPlaying = useMusicStore((state) => state.playbackState === 'playing');

  useEffect(() => {
    let isMounted = true;
    const fetchTracks = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          // Shuffle slightly so it's not identical every time
          const shuffled = data.sort(() => 0.5 - Math.random());
          setTracks(shuffled.slice(0, 15)); // 15 tracks per section
        }
      } catch (e) {
        console.error('Failed to load section:', title, e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTracks();
    
    return () => { isMounted = false; };
  }, [query, title]);

  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
    setQueue(tracks);
  };

  if (loading) {
    return (
      <div className="mb-10 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded mb-4 ml-6"></div>
        <div className="flex gap-4 px-6 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-none w-36 h-48 bg-slate-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <motion.div 
    initial={{ opacity: 0, y: 50, rotateX: -10 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
    className="mb-10 perspective-wrapper"
  >
      <h2 className="text-2xl font-bold text-white mb-4 px-6 font-space">{title}</h2>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 px-6 overflow-x-auto pb-6 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tracks.map((track) => (
          <div 
            key={track.id} 
            className="flex-none w-36 group relative snap-start"
          >
            <div 
              className="relative aspect-square rounded-lg overflow-hidden mb-3 shadow-lg hover-glow-teal hover-3d-tilt cursor-pointer"
              onClick={() => handlePlay(track)}
            >
              <img 
                src={track.coverUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80"} 
                alt={track.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Play Button Overlay */}
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${currentTrack?.id === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-slate-900 shadow-xl hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 ml-1 fill-current" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 
                  className={`font-medium truncate text-sm cursor-pointer text-hover-fade ${currentTrack?.id === track.id ? 'text-teal' : 'text-slate-200 hover:text-white'}`}
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
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  // Context menu handling would go here, maybe we emit an event or use a global store
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
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * KaraokeLyricsDrawer — Live synchronized LRC lyrics overlay with line-by-line glowing highlights & click-to-seek.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic2, Music, Sparkles } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { fetchLyrics } from '../lib/lrclib';
import { parseLrc, LrcLine } from '../lib/lrcParser';

export const KaraokeLyricsDrawer: React.FC = () => {
  const { currentTrack, showLyricsDrawer, setShowLyricsDrawer } = useMusicStore();
  const [lyricsLines, setLyricsLines] = useState<LrcLine[]>([]);
  const [plainText, setPlainText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync audio current time from window.audioRef or Audio element
  useEffect(() => {
    if (!showLyricsDrawer) return;

    const interval = setInterval(() => {
      const audioEl = document.querySelector('audio') as HTMLAudioElement;
      if (audioEl) {
        setCurrentTime(audioEl.currentTime);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [showLyricsDrawer]);

  // Fetch lyrics when currentTrack changes or drawer opens
  useEffect(() => {
    if (!currentTrack || !showLyricsDrawer) return;

    let isMounted = true;
    setLoading(true);
    setLyricsLines([]);
    setPlainText(null);

    fetchLyrics(currentTrack.title, currentTrack.artist).then(res => {
      if (!isMounted) return;
      setLoading(false);
      if (res?.syncedLyrics) {
        setLyricsLines(parseLrc(res.syncedLyrics));
      } else if (res?.plainLyrics) {
        setPlainText(res.plainLyrics);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [currentTrack?.id, showLyricsDrawer]);

  // Update active line index based on currentTime
  useEffect(() => {
    if (lyricsLines.length === 0) return;

    let idx = -1;
    for (let i = 0; i < lyricsLines.length; i++) {
      if (currentTime >= lyricsLines[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    setActiveIndex(idx);
  }, [currentTime, lyricsLines]);

  // Auto-scroll active line to center
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const handleLineClick = (timeInSeconds: number) => {
    const audioEl = document.querySelector('audio') as HTMLAudioElement;
    if (audioEl) {
      audioEl.currentTime = timeInSeconds;
      setCurrentTime(timeInSeconds);
    }
  };

  if (!showLyricsDrawer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-2xl"
      >
        <div className="relative w-full max-w-3xl h-[85vh] glass-panel-dark rounded-3xl p-6 md:p-10 flex flex-col gap-6 shadow-[0_25px_80px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden">
          
          {/* Ambient Background Aura */}
          {currentTrack?.coverUrl && (
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
              <img src={currentTrack.coverUrl} className="w-full h-full object-cover filter blur-[120px] scale-150" alt="" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/80 to-[#09090b]" />
            </div>
          )}

          {/* Top Bar */}
          <div className="flex items-center justify-between z-10 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 text-white">
                <Mic2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  Live Karaoke Lyrics
                  <Sparkles className="w-4 h-4 text-slate-300" />
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {currentTrack?.title} • {currentTrack?.artist}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowLyricsDrawer(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all border border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lyrics Content Container */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto custom-scroll z-10 py-6 px-2 md:px-6 flex flex-col gap-6 text-center"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-sm font-mono tracking-widest uppercase">Searching Synchronized Lyrics...</span>
              </div>
            ) : lyricsLines.length > 0 ? (
              lyricsLines.map((line, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={`${line.time}-${idx}`}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => handleLineClick(line.time)}
                    className={`cursor-pointer transition-all duration-300 px-4 py-2 rounded-2xl ${
                      isActive
                        ? 'text-white font-extrabold text-2xl md:text-3xl scale-105 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] bg-white/10 border border-white/15'
                        : 'text-slate-500 hover:text-slate-300 text-lg md:text-xl font-medium'
                    }`}
                  >
                    {line.text}
                  </div>
                );
              })
            ) : plainText ? (
              <div className="whitespace-pre-line text-slate-300 text-base md:text-lg leading-relaxed font-sans font-medium max-w-xl mx-auto text-left">
                {plainText}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <Music className="w-12 h-12 text-slate-600 mb-2" />
                <span className="text-base font-bold text-slate-300">No Synchronized Lyrics Available</span>
                <span className="text-xs text-slate-500 max-w-sm">Enjoy the track rhythm and beat!</span>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="z-10 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Click any line to jump to timing</span>
            <span>AURA Synchronized Lyrics Engine</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

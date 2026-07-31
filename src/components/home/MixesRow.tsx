/**
 * MixesRow.tsx — Memoized "Your Mixes" carousel row extracted from Home.tsx.
 * Subscribes only to {tracks, currentUser} so unrelated store changes
 * (queue, playback state, etc.) do NOT cause this component to re-render.
 */
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play } from 'lucide-react';
import { useMusicStore } from '../../store/musicStore';
import { Track } from '../../types';
import { DURATION_BASE, EASE_STANDARD } from '../../lib/motion';

interface Mix {
  title: string;
  desc: string;
  coverUrl?: string;
  tracks: Track[];
}

interface MixesRowProps {
  onSelectMix: (mix: Mix) => void;
}

export const MixesRow: React.FC<MixesRowProps> = React.memo(({ onSelectMix }) => {
  const tracks = useMusicStore(s => s.tracks);
  const currentUser = useMusicStore(s => s.currentUser);

  const mixesList = useMemo<Mix[]>(() => {
    const likedTracksList = tracks.filter(t => currentUser?.likedTracks?.includes(t.id));
    const explicitArtists = currentUser?.likedArtists || [];

    const mixes: Mix[] = [];

    if (likedTracksList.length > 0) {
      mixes.push({ title: 'On Repeat', desc: 'Songs you love', tracks: [...likedTracksList] });
    }

    if (explicitArtists.length > 0) {
      const artistTracks = tracks.filter(t =>
        explicitArtists.some(a => (t.artist || '').split(', ').includes(a) || t.hero === a || t.musicDirector === a)
      );
      if (artistTracks.length > 0) {
        mixes.push({ title: 'Favorite Artists Mix', desc: 'Based on your likes', tracks: artistTracks });
      }
      explicitArtists.slice(0, 5).forEach(artist => {
        const at = tracks.filter(t => (t.artist || '').split(', ').includes(artist) || t.hero === artist || t.musicDirector === artist);
        if (at.length >= 3) mixes.push({ title: `${artist} Mix`, desc: 'Made for you', tracks: at });
      });
    }

    if (likedTracksList.length > 0 || explicitArtists.length > 0) {
      const discoveryTracks = tracks.filter(t => {
        if (currentUser?.likedTracks?.includes(t.id)) return false;
        const fromExplicit = explicitArtists.some(a => (t.artist || '').split(', ').includes(a) || t.hero === a || t.musicDirector === a);
        const fromLiked = likedTracksList.some(lt => {
          const ltArtists = (lt.artist || '').split(', ');
          const tArtists = (t.artist || '').split(', ');
          return ltArtists.some(lta => tArtists.includes(lta)) || (lt.musicDirector && lt.musicDirector === t.musicDirector);
        });
        return fromExplicit || fromLiked;
      });
      if (discoveryTracks.length > 0) {
        mixes.push({ title: 'Discover Weekly', desc: 'New recommendations', tracks: discoveryTracks.slice(0, 20) });
      }
    }

    const getCoverByArtist = (name: string) =>
      tracks.find(t => (t.artist || '').split(', ').includes(name) || t.musicDirector === name)?.coverUrl || '/covers/hero-images.jpg';
    const getCoverByRegion = (region: string) =>
      tracks.find(t => t.region === region)?.coverUrl || '/covers/hero-images.jpg';

    const generics: Mix[] = [
      { title: 'Morning Mix', desc: 'Start your day fresh', coverUrl: getCoverByArtist('A.R. Rahman'), tracks: tracks.filter(t => t.musicDirector === 'A.R. Rahman' || t.title.toLowerCase().includes('sun')).slice(0, 15) },
      { title: 'Late Night Mix', desc: 'Chill night vibes', coverUrl: getCoverByArtist('Harris Jayaraj'), tracks: tracks.filter(t => t.musicDirector === 'Harris Jayaraj' || t.title.toLowerCase().includes('night')).slice(0, 15) },
      { title: 'Workout Mix', desc: 'High energy beats', coverUrl: getCoverByArtist('Anirudh'), tracks: tracks.filter(t => t.musicDirector === 'Anirudh Ravichander' || (t.artist || '').split(', ').includes('Anirudh')).slice(0, 15) },
      { title: 'Top Hits', desc: 'Global chart toppers', coverUrl: tracks[0]?.coverUrl || '/covers/hero-images.jpg', tracks: tracks.slice(0, 15) },
      { title: 'Daily Mix 1', desc: 'Made for you', coverUrl: tracks[5]?.coverUrl || '/covers/hero-images.jpg', tracks: tracks.slice(15, 30) },
      { title: 'Tollywood Top 10', desc: 'Regional hits', coverUrl: getCoverByRegion('Tollywood'), tracks: tracks.filter(t => t.region === 'Tollywood').slice(0, 10) },
      { title: 'Kollywood Top 10', desc: 'Regional hits', coverUrl: getCoverByRegion('Kollywood'), tracks: tracks.filter(t => t.region === 'Kollywood').slice(0, 10) },
      { title: 'Bollywood Chartbusters', desc: 'Regional hits', coverUrl: getCoverByRegion('Bollywood'), tracks: tracks.filter(t => t.region === 'Bollywood').slice(0, 10) },
    ].filter(m => m.tracks.length > 0);

    for (const g of generics) {
      if (mixes.length >= 10 && mixes.length > generics.length) break;
      if (!mixes.some(m => m.title === g.title)) mixes.push(g);
    }

    return mixes;
  }, [tracks, currentUser?.likedTracks, currentUser?.likedArtists]);

  if (mixesList.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-teal" /> Your Mixes
      </h2>
      <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x">
        {mixesList.map((mix, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION_BASE, ease: EASE_STANDARD, delay: i * 0.04 }}
            onClick={() => { if (mix.tracks.length > 0) onSelectMix(mix); }}
            className="min-w-[160px] w-[160px] glass-panel rounded-2xl p-4 flex flex-col gap-4 cursor-pointer snap-start group border border-white/5 hover:border-white/20 transition-all premium-card-hover"
          >
            <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-teal/20 relative overflow-hidden flex items-center justify-center">
              {mix.coverUrl ? (
                <img loading="lazy" src={mix.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={mix.title} />
              ) : (
                <div className="grid grid-cols-2 w-full h-full">
                  {mix.tracks.slice(0, 4).map((t, j) => (
                    <img key={j} loading="lazy" src={t.coverUrl} className="w-full h-full object-cover" alt="" />
                  ))}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl">
                  <Play className="w-5 h-5 ml-0.5 fill-current text-black" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-white truncate font-display">{mix.title}</span>
              <span className="text-[10px] text-slate-400 truncate">{mix.desc}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

MixesRow.displayName = 'MixesRow';

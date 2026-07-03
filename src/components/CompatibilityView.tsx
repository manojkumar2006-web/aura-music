import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, AlertCircle, Share2, Music2, Users, ArrowLeft, Disc } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';

export const CompatibilityView = ({ matchId, onBack }: { matchId: string, onBack: () => void }) => {
  const currentUser = useMusicStore((state) => state.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchCompatibility = async () => {
      try {
        const res = await fetch(`/api/compatibility?user1=${currentUser.id}&user2=${matchId}`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || 'Failed to calculate compatibility.');
        } else {
          setData(json);
        }
      } catch (err) {
        setError('A network error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompatibility();
  }, [currentUser, matchId]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Check Your Compatibility</h2>
        <p className="text-ink-secondary max-w-md mb-8">
          You need to be logged in to see your music compatibility score with this user.
        </p>
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full pt-8 pb-32 px-4 md:px-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-pink-400 transition-colors cursor-pointer mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-pink-400/80 animate-pulse text-sm font-medium tracking-widest uppercase">Calculating Aura...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-3xl text-center border-red-500/30 bg-red-500/5">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Could not calculate score</h3>
          <p className="text-red-300/80 max-w-md mx-auto">{error}</p>
        </div>
      ) : data ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Main Score Card */}
          <div className="glass-panel rounded-[2rem] overflow-hidden relative border-pink-500/20 mb-8 p-8 md:p-12 text-center bg-gradient-to-b from-pink-500/10 to-transparent">
            
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <img src={data.user1.avatarUrl || 'https://picsum.photos/seed/user1/400/400'} alt="You" className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-pink-500/30 object-cover" />
                <p className="mt-3 font-semibold text-white">{data.user1.displayName}</p>
              </div>
              <div className="relative">
                <Heart className="w-8 h-8 text-pink-500 animate-pulse" fill="currentColor" />
                <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-4 -right-4 animate-bounce" />
              </div>
              <div className="text-center">
                <img src={data.user2.avatarUrl || 'https://picsum.photos/seed/user2/400/400'} alt="Partner" className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-pink-500/30 object-cover" />
                <p className="mt-3 font-semibold text-white">{data.user2.displayName}</p>
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-purple-600 drop-shadow-lg mb-2">
              {data.score}%
            </h1>
            <p className="text-lg md:text-xl text-pink-200/80 font-medium tracking-wide">
              {data.score >= 90 ? 'Soulmates 💘' : data.score >= 70 ? 'Perfect Match 💖' : data.score >= 50 ? 'Good Vibes ✨' : 'Different Tastes 🎧'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col items-center justify-center text-center hover:border-pink-500/30 transition-colors">
              <Music2 className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="text-2xl font-bold text-white mb-1">{data.sharedTracksCount}</h3>
              <p className="text-ink-secondary text-sm">Shared Favorite Songs</p>
            </div>
            <div className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col items-center justify-center text-center hover:border-pink-500/30 transition-colors">
              <Users className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="text-2xl font-bold text-white mb-1">{data.sharedArtistsCount}</h3>
              <p className="text-ink-secondary text-sm">Shared Artists</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};

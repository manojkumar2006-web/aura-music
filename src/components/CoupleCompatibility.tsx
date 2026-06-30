import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Copy, Check, X, Music, Users, Star, Headphones, ShieldCheck, AlertTriangle, Clock, Lock } from 'lucide-react';

interface CoupleProfile {
  id: string;
  displayName: string;
  avatarUrl: string;
  likedTracks: string[];
  likedArtists: string[];
  emailVerified: boolean;
  createdAt: string; // ISO date string or "Month YYYY"
  stats: {
    favArtist: string;
    topGenre: string;
    tracksPlayed: number;
    minutesListened: number;
  };
}

interface CompatibilityResult {
  score: number;
  sharedSongs: string[];
  sharedArtists: string[];
  compatibilityTier: string;
  emoji: string;
  message: string;
  categories: { label: string; score: number; color: string }[];
}

/** Returns true if the account is at least 1 month old */
function isAccountOldEnough(createdAt: string): boolean {
  try {
    const created = new Date(createdAt);
    if (isNaN(created.getTime())) return false;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return created <= oneMonthAgo;
  } catch {
    return false;
  }
}

/** Days remaining until 1-month mark */
function daysUntilEligible(createdAt: string): number {
  try {
    const created = new Date(createdAt);
    const eligible = new Date(created);
    eligible.setMonth(eligible.getMonth() + 1);
    const diff = eligible.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return 30;
  }
}

function calculateCompatibility(a: CoupleProfile, b: CoupleProfile): CompatibilityResult {
  const sharedSongs = a.likedTracks.filter(id => b.likedTracks.includes(id));
  const sharedArtists = a.likedArtists.filter(art => b.likedArtists.includes(art));

  const songScore = a.likedTracks.length + b.likedTracks.length > 0
    ? (sharedSongs.length * 2) / (a.likedTracks.length + b.likedTracks.length) * 100 : 0;
  const artistScore = a.likedArtists.length + b.likedArtists.length > 0
    ? (sharedArtists.length * 2) / (a.likedArtists.length + b.likedArtists.length) * 100 : 0;
  const genreScore = a.stats.topGenre === b.stats.topGenre ? 100 : (a.stats.topGenre && b.stats.topGenre ? 30 : 0);

  const categories = [
    { label: 'Song Taste', score: Math.min(100, Math.round(songScore)), color: 'bg-pink-500' },
    { label: 'Fav Artists', score: Math.min(100, Math.round(artistScore)), color: 'bg-rose-400' },
    { label: 'Genre Match', score: Math.round(genreScore), color: 'bg-purple-500' },
    { label: 'Listen Time', score: Math.min(100, Math.round((Math.min(a.stats.minutesListened, b.stats.minutesListened) / Math.max(a.stats.minutesListened || 1, b.stats.minutesListened || 1)) * 100)), color: 'bg-indigo-400' },
  ];

  const overall = Math.round(categories.reduce((acc, c) => acc + c.score, 0) / categories.length);

  let tier = '', emoji = '', message = '';
  if (overall >= 85) { tier = 'Soulmates'; emoji = '💞'; message = 'Your music souls are perfectly in tune. Made for each other!'; }
  else if (overall >= 70) { tier = 'Perfect Harmony'; emoji = '🎵'; message = 'Your playlists align beautifully. A match made in music heaven!'; }
  else if (overall >= 55) { tier = 'Vibes Aligned'; emoji = '✨'; message = 'Great musical chemistry! You\'ll love exploring music together.'; }
  else if (overall >= 40) { tier = 'Different Beats'; emoji = '🎶'; message = 'Different tastes but that\'s the beauty—you\'ll discover new music!'; }
  else { tier = 'Musical Explorers'; emoji = '🎸'; message = 'Totally different worlds! Perfect excuse to introduce each other to new favorites!'; }

  return { score: overall, sharedSongs, sharedArtists, compatibilityTier: tier, emoji, message, categories };
}

interface CoupleCompatibilityProps {
  currentUser: CoupleProfile;
  allTracks: { id: string; title: string; artist: string }[];
  onClose: () => void;
}

export const CoupleCompatibility: React.FC<CoupleCompatibilityProps> = ({ currentUser, allTracks, onClose }) => {
  const [step, setStep] = useState<'eligibility_check' | 'share' | 'result'>('eligibility_check');
  const [linkCopied, setLinkCopied] = useState(false);
  const [partnerData, setPartnerData] = useState<CoupleProfile | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [partnerEligibilityError, setPartnerEligibilityError] = useState<string | null>(null);

  // --- ELIGIBILITY CHECKS ---
  const isVerified = currentUser.emailVerified;
  const isOldEnough = isAccountOldEnough(currentUser.createdAt);
  const daysLeft = daysUntilEligible(currentUser.createdAt);
  const isEligible = isVerified && isOldEnough;

  // Move to share step only if eligible
  useEffect(() => {
    if (step === 'eligibility_check' && isEligible) {
      setStep('share');
    }
  }, [isEligible, step]);

  // Encode user profile into compact URL-safe payload (including eligibility fields)
  const payload = btoa(JSON.stringify({
    id: currentUser.id,
    displayName: currentUser.displayName,
    avatarUrl: currentUser.avatarUrl,
    likedTracks: currentUser.likedTracks.slice(0, 50),
    likedArtists: currentUser.likedArtists.slice(0, 20),
    emailVerified: currentUser.emailVerified,
    createdAt: currentUser.createdAt,
    stats: currentUser.stats,
  }));

  const shareLink = `${window.location.origin}${window.location.pathname}?couple=${encodeURIComponent(payload)}`;

  // Check URL on mount for incoming partner data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const coupleParam = params.get('couple');
    if (coupleParam) {
      try {
        const decoded: CoupleProfile = JSON.parse(atob(decodeURIComponent(coupleParam)));
        if (decoded.id !== currentUser.id) {
          // Validate partner eligibility too
          const partnerVerified = decoded.emailVerified;
          const partnerOldEnough = isAccountOldEnough(decoded.createdAt);
          const partnerDaysLeft = daysUntilEligible(decoded.createdAt);

          if (!partnerVerified) {
            setPartnerEligibilityError(`${decoded.displayName} hasn't verified their email yet. Ask them to verify before using this feature!`);
            setStep('result');
            return;
          }
          if (!partnerOldEnough) {
            setPartnerEligibilityError(`${decoded.displayName}'s account needs ${partnerDaysLeft} more days to be eligible. Both users must have been active for at least 1 month!`);
            setStep('result');
            return;
          }

          setPartnerData(decoded);
          const comp = calculateCompatibility(currentUser, decoded);
          setResult(comp);
          setStep('result');
        }
      } catch {
        // ignore malformed param
      }
    }
  }, [currentUser]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const sharedSongNames = result?.sharedSongs
    .map(id => allTracks.find(t => t.id === id))
    .filter(Boolean)
    .slice(0, 5) as { id: string; title: string; artist: string }[] | undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
    >
      {/* Floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div key={i} className="absolute text-pink-400/20"
            initial={{ y: '110%', x: `${6 + i * 9}%`, rotate: 0 }}
            animate={{ y: '-10%', rotate: i % 2 === 0 ? 20 : -20 }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
            style={{ fontSize: `${14 + (i % 4) * 8}px` }}>♥</motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(20,0,30,0.98) 0%, rgba(40,0,40,0.98) 100%)',
          border: '1px solid rgba(244,114,182,0.25)',
          boxShadow: '0 0 60px rgba(244,114,182,0.2), 0 0 120px rgba(168,85,247,0.1)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div className="relative h-2 w-full" style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7, #ec4899)' }} />

        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">

            {/* =================== ELIGIBILITY GATE =================== */}
            {step === 'eligibility_check' && (
              <motion.div key="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 text-center">

                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2))', border: '2px solid rgba(236,72,153,0.3)' }}>
                  <Lock className="w-9 h-9 text-pink-400" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white font-display">Compatibility Check</h2>
                  <p className="text-sm text-pink-300/70 mt-1">Two requirements must be met to unlock this feature</p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  {/* Email Verification Check */}
                  <div className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
                    style={{ background: isVerified ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${isVerified ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                    {isVerified
                      ? <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />
                      : <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />}
                    <div className="text-left">
                      <p className={`text-sm font-bold ${isVerified ? 'text-green-300' : 'text-red-300'}`}>
                        {isVerified ? 'Email Verified ✓' : 'Email Not Verified ✗'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isVerified ? 'Your account is verified.' : 'Please verify your email address first. Check your inbox.'}
                      </p>
                    </div>
                  </div>

                  {/* Account Age Check */}
                  <div className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
                    style={{ background: isOldEnough ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${isOldEnough ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                    {isOldEnough
                      ? <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />
                      : <Clock className="w-6 h-6 text-red-400 flex-shrink-0" />}
                    <div className="text-left">
                      <p className={`text-sm font-bold ${isOldEnough ? 'text-green-300' : 'text-red-300'}`}>
                        {isOldEnough ? '1-Month Member ✓' : `Account too new ✗`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isOldEnough
                          ? 'Your account has been active for at least 1 month.'
                          : `You need ${daysLeft} more day${daysLeft !== 1 ? 's' : ''} to unlock this feature. Keep listening! 🎵`}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed px-2">
                  Both you <span className="text-pink-400">and your partner</span> must be verified AURA members for at least <span className="text-pink-400 font-semibold">1 month</span> before the compatibility score can be calculated. This ensures genuine music taste data.
                </p>

                <button onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Got it, come back later
                </button>
              </motion.div>
            )}

            {/* =================== SHARE LINK =================== */}
            {step === 'share' && (
              <motion.div key="share" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center gap-6 text-center">

                <div className="relative">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3))', border: '2px solid rgba(236,72,153,0.4)' }}>
                    <Heart className="w-9 h-9 text-pink-400 fill-pink-400/50" />
                  </motion.div>
                  <Headphones className="absolute -bottom-1 -right-1 w-7 h-7 text-purple-400 bg-black rounded-full p-1" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white font-display">Music Compatibility</h2>
                  <p className="text-sm text-pink-300/80 mt-1">Discover your musical soulmate score 💕</p>
                </div>

                {/* Eligibility badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-green-300"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Member · 1+ Month Active
                </div>

                {/* Profile preview */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={currentUser.avatarUrl || 'https://picsum.photos/seed/default/100'}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/50" alt={currentUser.displayName} />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{currentUser.displayName}</p>
                    <p className="text-xs text-slate-500">❤️ {currentUser.likedTracks.length} loved songs · 🎤 {currentUser.likedArtists.length} artists</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-dashed border-pink-500/40 flex items-center justify-center">
                      <Users className="w-4 h-4 text-pink-400/60" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400">Your partner must also be a <span className="text-pink-400 font-semibold">verified member for 1+ month</span>. Send this link — when they open it, you'll both see your score!</p>

                {/* Share link */}
                <div className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2 text-xs font-mono"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(244,114,182,0.2)' }}>
                  <span className="text-slate-500 truncate flex-1">{shareLink.slice(0, 48)}...</span>
                  <button onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-all"
                    style={{ background: linkCopied ? 'rgba(34,197,94,0.2)' : 'rgba(236,72,153,0.2)', color: linkCopied ? '#4ade80' : '#f472b6', border: `1px solid ${linkCopied ? 'rgba(34,197,94,0.3)' : 'rgba(236,72,153,0.3)'}` }}>
                    {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* =================== PARTNER ELIGIBILITY ERROR =================== */}
            {step === 'result' && partnerEligibilityError && (
              <motion.div key="partner-gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}>
                  <AlertTriangle className="w-9 h-9 text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-display">Partner Not Eligible</h2>
                  <p className="text-sm text-red-300/80 mt-1">One more thing before the magic happens 💕</p>
                </div>
                <div className="px-5 py-4 rounded-2xl text-sm text-red-200 leading-relaxed"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {partnerEligibilityError}
                </div>
                <p className="text-xs text-slate-500">Both users must be verified AURA members for at least 1 month to unlock Music Compatibility.</p>
                <button onClick={onClose} className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Close
                </button>
              </motion.div>
            )}

            {/* =================== RESULT =================== */}
            {step === 'result' && result && partnerData && !partnerEligibilityError && (
              <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center gap-5">

                {/* Two avatars */}
                <div className="flex items-center gap-3">
                  <img src={currentUser.avatarUrl || 'https://picsum.photos/seed/default/100'}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-500/50" alt={currentUser.displayName} />
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-2xl">💕</motion.div>
                  <img src={partnerData.avatarUrl || 'https://picsum.photos/seed/partner/100'}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-500/50" alt={partnerData.displayName} />
                </div>

                {/* Eligibility badges for both */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-green-300"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <ShieldCheck className="w-3 h-3" /> {currentUser.displayName.split(' ')[0]}
                  </span>
                  <span className="text-slate-600">×</span>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-green-300"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <ShieldCheck className="w-3 h-3" /> {partnerData.displayName.split(' ')[0]}
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">{currentUser.displayName} & {partnerData.displayName}</p>
                  <h2 className="text-xl font-bold text-white">{result.emoji} {result.compatibilityTier}</h2>
                </div>

                {/* Score ring */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="absolute w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <motion.circle cx="60" cy="60" r="52" fill="none" stroke="url(#coupleGrad)" strokeWidth="10"
                      strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - result.score / 100) }}
                      transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }} />
                    <defs>
                      <linearGradient id="coupleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="text-center">
                    <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                      className="text-4xl font-black text-white">{result.score}</motion.p>
                    <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">score</p>
                  </div>
                </div>

                <p className="text-center text-xs text-pink-200/70 italic px-4">"{result.message}"</p>

                {/* Category bars */}
                <div className="w-full flex flex-col gap-2">
                  {result.categories.map((cat, i) => (
                    <div key={cat.label} className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 w-20 flex-shrink-0">{cat.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${cat.score}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${cat.color}`} />
                      </div>
                      <span className="text-[10px] font-bold text-white w-8 text-right">{cat.score}%</span>
                    </div>
                  ))}
                </div>

                {/* Shared songs */}
                {sharedSongNames && sharedSongNames.length > 0 && (
                  <div className="w-full">
                    <p className="text-[10px] uppercase font-bold text-pink-400 tracking-widest mb-2 flex items-center gap-1.5">
                      <Music className="w-3 h-3" /> Songs You Both Love ({result.sharedSongs.length})
                    </p>
                    <div className="flex flex-col gap-1">
                      {sharedSongNames.map(t => (
                        <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                          style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)' }}>
                          <Heart className="w-3 h-3 text-pink-400 fill-pink-400/40 flex-shrink-0" />
                          <span className="text-white truncate font-medium">{t.title}</span>
                          <span className="text-slate-500 truncate ml-auto">{t.artist}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shared artists */}
                {result.sharedArtists.length > 0 && (
                  <div className="w-full">
                    <p className="text-[10px] uppercase font-bold text-purple-400 tracking-widest mb-2 flex items-center gap-1.5">
                      <Star className="w-3 h-3" /> Shared Artists
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.sharedArtists.slice(0, 8).map(a => (
                        <span key={a} className="px-2.5 py-1 rounded-full text-[10px] font-medium text-purple-300"
                          style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => { setStep('share'); setResult(null); setPartnerData(null); }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all mt-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Share with Someone Else
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

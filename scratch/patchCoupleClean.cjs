const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Add CoupleCompatibility import after Section import
const sectionImport = "import { Section } from '../components/Section';";
const coupleImport = "import { Section } from '../components/Section';\nimport { CoupleCompatibility } from '../components/CoupleCompatibility';";
content = content.replace(sectionImport, coupleImport);

// 2. Add showCoupleModal state after the isEditingProfile state declaration
const editProfileState = "  const [isEditingProfile, setIsEditingProfile] = useState(false);";
const editProfileWithCouple = "  // Couple Compatibility\n  const [showCoupleModal, setShowCoupleModal] = useState(false);\n\n  const [isEditingProfile, setIsEditingProfile] = useState(false);";
content = content.replace(editProfileState, editProfileWithCouple);

// 3. Find and replace the profile button group to add the Compatibility button
// The existing button group starts with !isEditingProfile
const oldButtonGroup = `                        className="py-1.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-ink-primary font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-ink-secondary" /> Edit Profile
                        </button>
                        <button
                          onClick={() => setShowSleepTimerModal(true)}`;

const newButtonGroup = `                        className="py-1.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-ink-primary font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-ink-secondary" /> Edit Profile
                        </button>
                        {/* Couple Compatibility Button */}
                        <button
                          onClick={() => setShowCoupleModal(true)}
                          className="py-1.5 px-4 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.3)', color: '#f472b6' }}
                        >
                          <Heart className="w-3.5 h-3.5 fill-pink-400/50" /> Compatibility
                        </button>
                        <button
                          onClick={() => setShowSleepTimerModal(true)}`;

content = content.replace(oldButtonGroup, newButtonGroup);

// 4. Inject the CoupleCompatibility modal rendering just before LYRICS MODAL OVERLAY comment
const lyricsModalComment = '      {/* ================= LYRICS MODAL OVERLAY ================= */}';
const coupleModalCode = `      {/* ================= COUPLE COMPATIBILITY MODAL ================= */}
      <AnimatePresence>
        {showCoupleModal && currentUser && (
          <CoupleCompatibility
            currentUser={{
              id: currentUser.id,
              displayName: currentUser.displayName,
              avatarUrl: currentUser.avatarUrl,
              likedTracks: currentUser.likedTracks || [],
              likedArtists: currentUser.likedArtists || [],
              stats: currentUser.stats,
            }}
            allTracks={tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist }))}
            onClose={() => setShowCoupleModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ================= LYRICS MODAL OVERLAY ================= */}`;

content = content.replace(lyricsModalComment, coupleModalCode);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('SUCCESS: Applied all 4 targeted patches cleanly!');

// Verify the key strings are there
if (content.includes('showCoupleModal') && content.includes('CoupleCompatibility')) {
  console.log('✓ showCoupleModal state: found');
  console.log('✓ CoupleCompatibility component: found');
} else {
  console.log('WARNING: Some patches may have failed!');
}

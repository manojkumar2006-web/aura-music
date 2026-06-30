const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Add imports for Section and useEffect/useState
if (!content.includes('import { Section }')) {
  content = content.replace(
    "import { useMusicStore } from '../store/musicStore';",
    "import { useMusicStore } from '../store/musicStore';\nimport { Section } from '../components/Section';"
  );
}

// 2. Add CATEGORIES and state inside Home
const categoriesDef = `
const CATEGORIES = [
  { title: "Trending Kollywood", query: "latest tamil hits" },
  { title: "Global Top 50", query: "global top hits" },
  { title: "Anirudh Essentials", query: "anirudh ravichander top songs" },
  { title: "A.R. Rahman Classics", query: "ar rahman hits" },
  { title: "Workout Mix", query: "gym workout music" },
  { title: "Late Night Lo-Fi", query: "lofi hip hop beats" },
  { title: "Trending Bollywood", query: "latest hindi songs" },
  { title: "Top Telugu", query: "latest telugu hits" },
  { title: "Party Anthems", query: "dance party mix" },
  { title: "Soulful Melodies", query: "relaxing acoustic songs" },
  { title: "Epic Soundtracks", query: "epic movie scores" },
  { title: "Yuvan Magic", query: "yuvan shankar raja hits" },
  { title: "Ilayaraja Classics", query: "ilayaraja tamil hits" },
  { title: "Harris Jayaraj Hits", query: "harris jayaraj melodies" }
];
`;
if (!content.includes('const CATEGORIES =')) {
  content = content.replace('export default function Home() {', categoriesDef + '\nexport default function Home() {\n  const [visibleCount, setVisibleCount] = useState(3);\n  const observerTarget = useRef(null);\n  useEffect(() => {\n    const observer = new IntersectionObserver((entries) => {\n      if (entries[0].isIntersecting && visibleCount < CATEGORIES.length) {\n        setVisibleCount(prev => Math.min(prev + 2, CATEGORIES.length));\n      }\n    }, { threshold: 0.1 });\n    if (observerTarget.current) observer.observe(observerTarget.current);\n    return () => observer.disconnect();\n  }, [visibleCount]);');
}

// 3. Replace the entire content block for when there is no search query vs when there is.
// Right now, the app renders "Your Mixes" then "filteredTracks".
// I will replace the "filteredTracks.length === 0" logic entirely.
const oldSearchBlock = `                  {filteredTracks.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-12 text-center text-ink-tertiary text-xs font-mono border border-silver/8 flex flex-col gap-2 items-center justify-center">
                      <Search className="w-8 h-8 text-ink-tertiary animate-pulse" />
                      <span>No songs matched your query. Add one via Admin Panel!</span>
                    </div>
                  ) : (`;

const newSearchBlock = `                  {useMusicStore.getState().isSearching ? (
                    <div className="glass-panel rounded-2xl p-12 text-center text-ink-tertiary text-xs font-mono border border-silver/8 flex flex-col gap-2 items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal mx-auto mb-2"></div>
                      <span>Searching Global Database...</span>
                    </div>
                  ) : filteredTracks.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-12 text-center text-ink-tertiary text-xs font-mono border border-silver/8 flex flex-col gap-2 items-center justify-center">
                      <Search className="w-8 h-8 text-ink-tertiary animate-pulse" />
                      <span>No songs matched your query.</span>
                    </div>
                  ) : (`;
content = content.replace(oldSearchBlock, newSearchBlock);

// Replace the older oldSearchBlock as well just in case (the one from line 1000s)
const fallbackOldBlock = `filteredTracks.length === 0 ? (
          <div className="text-center py-24">
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-500 font-mono">No songs matched your query. Add one via Admin Panel!</p>
          </div>
        )`;
content = content.replace(fallbackOldBlock, `useMusicStore.getState().isSearching ? (
          <div className="text-center py-24">
             <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal mx-auto mb-4"></div>
             <p className="text-slate-500 font-mono">Searching Global Database...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-24">
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-500 font-mono">No songs matched your query.</p>
          </div>
        )`);

// 4. If searchQuery is empty, we should render the Sections instead of "Your Mixes".
// Let's replace the whole "Hero / Mixes" section if searchQuery is empty!
// To do this reliably, I'll find "Your Mixes" and inject the Section logic above it.
const sectionLogic = `
                  {/* Dynamic Infinite Sections */
                   !searchQuery.trim() && (
                     <div className="flex flex-col mt-8 w-full">
                       {CATEGORIES.slice(0, visibleCount).map(cat => (
                         <Section key={cat.title} title={cat.title} query={cat.query} />
                       ))}
                       <div ref={observerTarget} className="h-10 w-full" />
                     </div>
                   )
                  }
`;
content = content.replace('{/* Hero / Mixes */}', sectionLogic + '\n                  {/* Hero / Mixes */}');

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Successfully patched Home.tsx for infinite scroll');

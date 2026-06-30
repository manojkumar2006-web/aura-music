const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

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

const infiniteLogic = `export const Home: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(3);
  const observerTarget = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < CATEGORIES.length) {
        setVisibleCount(prev => Math.min(prev + 2, CATEGORIES.length));
      }
    }, { threshold: 0.1 });
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [visibleCount]);
`;

if (!content.includes('const CATEGORIES = [')) {
  content = content.replace('export const Home: React.FC = () => {', categoriesDef + '\\n' + infiniteLogic);
  fs.writeFileSync('src/pages/Home.tsx', content);
  console.log('Injected CATEGORIES and infinite scroll logic');
} else {
  console.log('CATEGORIES already exists in file.');
}

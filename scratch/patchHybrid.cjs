const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace the filteredTracks logic
const searchLogicOld = `
  const filteredTracks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return tracks;

    const terms = query.split(/\\s+/);

    return tracks
      .map(track => {
        let score = 0;
        const title = track.title.toLowerCase();
        const artist = track.artist.toLowerCase();
        const album = track.album?.toLowerCase() || '';
        const director = track.musicDirector?.toLowerCase() || '';
        const hero = track.hero?.toLowerCase() || '';
        const allText = \`\${title} \${artist} \${album} \${director} \${hero}\`;

        // Exact match boosts
        if (title === query) score += 100;
        if (artist === query) score += 80;
        if (album === query) score += 70;

        // Prefix match boosts
        if (title.startsWith(query)) score += 50;
        if (artist.startsWith(query)) score += 40;

        // Substring match boosts
        if (title.includes(query)) score += 30;
        if (artist.includes(query)) score += 20;
        if (album.includes(query)) score += 15;
        if (director.includes(query)) score += 10;
        if (hero.includes(query)) score += 10;

        // Term-by-term matching (for partial queries like "anirudh leo")
        let matchedTerms = 0;
        terms.forEach(term => {
          if (title.includes(term)) { score += 5; matchedTerms++; }
          else if (artist.includes(term)) { score += 4; matchedTerms++; }
          else if (album.includes(term)) { score += 3; matchedTerms++; }
          else if (allText.includes(term)) { score += 1; matchedTerms++; }
        });

        // Require at least some terms to match if no direct substring match
        if (matchedTerms === 0 && score === 0) return { track, score: 0 };

        // Boost if all terms matched somewhere
        if (matchedTerms === terms.length) score += 25;

        return { track, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.track);
  }, [tracks, searchQuery]);
`;

const searchLogicNew = `
  // The 'tracks' array is already dynamically updated by the store based on the search query
  const filteredTracks = tracks;
  
  // Call searchTracks whenever searchQuery changes, debounced
  useEffect(() => {
    const handler = setTimeout(() => {
       useMusicStore.getState().searchTracks(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Initial load
  useEffect(() => {
    if (tracks.length === 0) {
       useMusicStore.getState().fetchTopTracks();
    }
  }, []);
`;

// wait! searchLogicOld has newlines which might not match exactly.
// I'll just use a regex to replace it
content = content.replace(/const filteredTracks = useMemo\(\(\) => \{[\s\S]*?\.map\(item => item\.track\);\n\s*\}, \[tracks, searchQuery\]\);/m, searchLogicNew);

// In AudioPlayer.tsx, we need to intercept handlePlay to resolve the youtubeID if missing
let audioPlayerContent = fs.readFileSync('src/components/player/AudioPlayer.tsx', 'utf8');

const playNextLogic = `
  const handlePlayPause = async () => {
    if (!currentTrack) return;
    
    // Check if we need to resolve the youtube ID first
    if (!currentTrack.youtubeId) {
      setPlaybackState('paused'); // or loading state if we had one
      const resolvedId = await useMusicStore.getState().resolveYoutubeId(currentTrack.id);
      if(!resolvedId) {
         console.error("Could not resolve Youtube ID");
         return;
      }
    }
    
    if (playbackState === 'playing') {
      setPlaybackState('paused');
    } else {
      setPlaybackState('playing');
    }
  };
`;
// Replace handlePlayPause
audioPlayerContent = audioPlayerContent.replace(
/  const handlePlayPause = \(\) => \{\s+if \(\!currentTrack\) return;\s+if \(playbackState === 'playing'\) \{\s+setPlaybackState\('paused'\);\s+\} else \{\s+setPlaybackState\('playing'\);\s+\}\s+\};/m,
  playNextLogic
);

// We must also hook into when `currentTrack` changes to auto-resolve if missing, so it plays immediately when clicking a track from Home.
const currentTrackEffect = `
  useEffect(() => {
    if (currentTrack) {
      if (!currentTrack.youtubeId) {
        useMusicStore.getState().resolveYoutubeId(currentTrack.id).then(id => {
           if(id && playbackState === 'playing') {
              // The state will auto-update in the player once store updates
           }
        });
      } else {
         if (audioRef.current) {
           audioRef.current.src = currentTrack.audioUrl || '';
         }
      }
    }
  }, [currentTrack]);
`;
// We will insert this useEffect just below the first useEffect in AudioPlayer
audioPlayerContent = audioPlayerContent.replace(
/  useEffect\(\(\) => \{\s+if \(currentTrack\) \{\s+if \(audioRef\.current\) \{\s+audioRef\.current\.src = currentTrack\.audioUrl \|\| '';\s+\}\s+\}\s+\}, \[currentTrack\]\);/m,
  currentTrackEffect
);

fs.writeFileSync('src/pages/Home.tsx', content);
fs.writeFileSync('src/components/player/AudioPlayer.tsx', audioPlayerContent);
console.log('Done patching frontend logic for iTunes/YT Hybrid');

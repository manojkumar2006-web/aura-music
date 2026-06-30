const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Fix filteredTracks
content = content.replace(/const filteredTracks = useMemo\(\(\) => \{[\s\S]*?\.map\(item => item\.track\);\n\s*\}, \[tracks, searchQuery\]\);/, `  const filteredTracks = tracks;
  
  useEffect(() => {
    const handler = setTimeout(() => {
       useMusicStore.getState().searchTracks(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (tracks.length === 0) {
       useMusicStore.getState().fetchTopTracks();
    }
  }, []);`);

// 2. Fix empty state loading UI
const emptyStateOld = `filteredTracks.length === 0 ? (
          <div className="text-center py-24">
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-500 font-mono">No songs matched your query. Add one via Admin Panel!</p>
          </div>
        )`;
const emptyStateNew = `useMusicStore.getState().isSearching ? (
          <div className="text-center py-24">
             <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal mx-auto mb-4"></div>
             <p className="text-slate-500 font-mono">Searching Global Database...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-24">
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-500 font-mono">No songs matched your query.</p>
          </div>
        )`;
content = content.replace(emptyStateOld, emptyStateNew);

fs.writeFileSync('src/pages/Home.tsx', content);

// 3. Fix AudioPlayer
let audioContent = fs.readFileSync('src/components/player/AudioPlayer.tsx', 'utf8');

const oldHandlePlayPause = `  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (playbackState === 'playing') {
      setPlaybackState('paused');
    } else {
      setPlaybackState('playing');
    }
  };`;
const newHandlePlayPause = `  const handlePlayPause = async () => {
    if (!currentTrack) return;
    
    if (!currentTrack.youtubeId) {
      setPlaybackState('paused'); 
      const resolvedId = await useMusicStore.getState().resolveYoutubeId(currentTrack.id);
      if(!resolvedId) return;
    }
    
    if (playbackState === 'playing') {
      setPlaybackState('paused');
    } else {
      setPlaybackState('playing');
    }
  };`;
audioContent = audioContent.replace(oldHandlePlayPause, newHandlePlayPause);

const oldUseEffect = `  useEffect(() => {
    if (currentTrack) {
      if (audioRef.current) {
        audioRef.current.src = currentTrack.audioUrl || '';
      }
    }
  }, [currentTrack]);`;
const newUseEffect = `  useEffect(() => {
    if (currentTrack) {
      if (!currentTrack.youtubeId) {
        useMusicStore.getState().resolveYoutubeId(currentTrack.id).then(id => {
           // handled via state update
        });
      } else {
         if (audioRef.current) {
           audioRef.current.src = currentTrack.audioUrl || '';
         }
      }
    }
  }, [currentTrack]);`;
audioContent = audioContent.replace(oldUseEffect, newUseEffect);

fs.writeFileSync('src/components/player/AudioPlayer.tsx', audioContent);
console.log('Fixed Home and AudioPlayer missing patches');

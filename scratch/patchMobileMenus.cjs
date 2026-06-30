const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Add handlePlayNext
const handlePlayNextStr = `
  const handlePlayNext = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const filteredQueue = queue.filter(t => t.id !== track.id);
    setQueue([track, ...filteredQueue]);
    showToastMessage(\`"\${track.title}" will play next\`, "success");
    setActiveTrackMenu(null);
  };
`;
if (!content.includes('const handlePlayNext')) {
  content = content.replace(
    '  const handleAddToQueue = (e: React.MouseEvent, track: Track) => {',
    handlePlayNextStr.trim() + '\n\n  const handleAddToQueue = (e: React.MouseEvent, track: Track) => {'
  );
}

// Add Play Next button to track menus
const playNextButton = `
                                        <button
                                          onClick={(e) => handlePlayNext(e, track)}
                                          className="w-full px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors text-left"
                                        >
                                          <Play className="w-3.5 h-3.5 text-teal" />
                                          Play Next
                                        </button>`;
                                        
content = content.replace(/<button[^>]*onClick={\(e\) => handleAddToQueue\(e, track\)}[\s\S]*?Add to Queue\s*<\/button>/g, (match) => match + playNextButton);

// Fix opacity on mobile for all track menus
// Look for activeTrackMenu ternary classes
content = content.replace(/opacity-0 group-hover:opacity-100/g, 'opacity-100 md:opacity-0 md:group-hover:opacity-100');

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Done patching Home.tsx!');

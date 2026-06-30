const fs = require('fs');

let content = fs.readFileSync('src/components/player/AudioPlayer.tsx', 'utf8');

// 1. Vinyl Record
const oldImage = '<img src={currentTrack.coverUrl} className="w-9 h-9 rounded object-cover shadow-md" alt="" />';
const newVinyl = `
            {/* Spinning Vinyl Record */}
            <div className={\`relative w-11 h-11 rounded-full border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.8)] overflow-hidden flex-shrink-0 \${playbackState === 'playing' ? 'animate-[spin_4s_linear_infinite]' : ''}\`}>
              <img src={currentTrack.coverUrl} className="w-full h-full object-cover opacity-90" alt="" />
              <div className="absolute inset-0 bg-black/20 rounded-full" style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9)' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full border border-slate-700/50 flex items-center justify-center">
                <div className="w-1 h-1 bg-white/20 rounded-full" />
              </div>
            </div>
`;
content = content.replace(oldImage, newVinyl);

// 2. CSS Audio Visualizer
// We'll put it right after the song info div in the center section
const oldInfoEnd = `<p className="text-[10px] text-slate-400 truncate">{currentTrack.artist} — {currentTrack.album}</p>`;
const newInfoEnd = `<p className="text-[10px] text-slate-400 truncate flex items-center gap-2">
                 <span>{currentTrack.artist} — {currentTrack.album}</span>
                 {/* Mini CSS Visualizer */}
                 {playbackState === 'playing' && (
                   <div className="flex items-end gap-[1.5px] h-3 ml-2">
                     {[1, 2, 3, 4].map((i) => (
                       <motion.div 
                         key={i}
                         className="w-[2px] bg-teal rounded-full"
                         animate={{ height: ['3px', '12px', '5px', '10px', '4px'] }}
                         transition={{ duration: 0.5 + (i * 0.1), repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                       />
                     ))}
                   </div>
                 )}
               </p>`;
content = content.replace(oldInfoEnd, newInfoEnd);

fs.writeFileSync('src/components/player/AudioPlayer.tsx', content);
console.log('Patched AudioPlayer with Vinyl and Visualizer');

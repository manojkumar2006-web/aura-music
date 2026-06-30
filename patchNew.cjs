const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'src', 'pages', 'Home.tsx');
let content = fs.readFileSync(homePath, 'utf8');

const lines = content.split('\\n');

// Find the line that starts with `{newTracks.length === 0 && (` inside the sidebarNav === 'new' block.
let targetIndex = -1;
let inNewBlock = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("sidebarNav === 'new'")) {
    inNewBlock = true;
  }
  if (inNewBlock && lines[i].includes('{newTracks.length === 0 && (')) {
    targetIndex = i;
    break;
  }
}

if (targetIndex !== -1) {
  const injectStr = `                      {/* Trending Now */}
                      {tracks.length > 0 && (
                        <div className="flex flex-col gap-6 mt-4">
                          <h3 className="font-display font-bold text-lg text-white tracking-wider flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-400" /> Trending Now
                          </h3>
                          <div className="flex gap-5 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                            {tracks.slice(15, 25).map((track) => (
                              <div 
                                key={\`trending-\${track.id}\`} 
                                onClick={() => {
                                  setCurrentTrack(track);
                                  setPlaybackState('playing');
                                  setQueue(tracks.slice(15, 25));
                                }}
                                className="min-w-[160px] max-w-[160px] flex flex-col gap-3 snap-start group cursor-pointer premium-card-hover"
                              >
                                <div className="w-full aspect-square rounded-[20px] overflow-hidden relative shadow-lg bg-black/40 premium-image-hover">
                                  <img src={track.coverUrl} className="w-full h-full object-cover" alt={track.title} />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                  <div className="absolute bottom-2 right-2 bg-orange-500 text-white p-2.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 shadow-[0_4px_15px_rgba(249,115,22,0.5)] translate-y-2 group-hover:translate-y-0">
                                    <Play className="w-3 h-3 fill-white" />
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-white truncate w-full group-hover:text-orange-400 transition-colors">{track.title}</span>
                                  <span className="text-[10px] text-slate-400 font-mono uppercase mt-1">{track.artist}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Top New Albums */}
                      {tracks.length > 0 && (
                        <div className="flex flex-col gap-6 mt-4 mb-4">
                          <h3 className="font-display font-bold text-lg text-white tracking-wider flex items-center gap-2">
                            <Disc className="w-5 h-5 text-blue-400" /> Top New Albums
                          </h3>
                          <div className="flex gap-5 overflow-x-auto custom-scroll pb-6 pt-2 px-2 -mx-2 snap-x">
                            {Array.from(new Set(tracks.map(t=>t.album))).slice(2, 12).map(albumName => {
                              const albumTrack = tracks.find(t => t.album === albumName);
                              return (
                                <div 
                                  key={\`new-album-\${albumName}\`} 
                                  onClick={() => setSelectedAlbum(albumName)}
                                  className="min-w-[160px] w-[160px] flex flex-col gap-3 cursor-pointer group snap-start premium-card-hover"
                                >
                                  <div className="w-full aspect-square rounded-[20px] overflow-hidden relative shadow-lg bg-black/40 premium-image-hover">
                                    <img src={albumName.toLowerCase().includes('leo') ? '/covers/Leo.jpg' : albumTrack?.coverUrl} className="w-full h-full object-cover" alt={albumName} />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <div className="absolute bottom-3 right-3 bg-blue-500 text-white p-3 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 shadow-[0_4px_15px_rgba(59,130,246,0.5)] translate-y-2 group-hover:translate-y-0">
                                      <Play className="w-4 h-4 fill-white" />
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-center text-center">
                                    <span className="text-sm font-bold text-white truncate w-full group-hover:text-blue-400 transition-colors">{albumName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono uppercase mt-1">New Release</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}`;

  lines.splice(targetIndex, 0, injectStr);
  fs.writeFileSync(homePath, lines.join('\\n'), 'utf8');
  console.log('Successfully patched New page by index.');
} else {
  console.log('Target line not found in Home.tsx.');
}

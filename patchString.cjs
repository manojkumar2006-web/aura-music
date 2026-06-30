const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'src', 'pages', 'Home.tsx');
let content = fs.readFileSync(homePath, 'utf8');

const newInjection = `                      {/* Trending Now */}
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
                      )}
`;

const radioInjection = `
                      {/* Global Live Stations */}
                      <div className="flex flex-col gap-4 mt-6 mb-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold text-white hover:underline cursor-pointer flex items-center gap-1">
                            Global Live Stations <ChevronRight className="w-5 h-5 text-slate-400" />
                          </h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x hide-scrollbar">
                          {[
                            { title: 'K-Pop Beats', subtitle: 'Seoul', bg: 'bg-pink-500' },
                            { title: 'Tokyo Lofi', subtitle: 'Tokyo', bg: 'bg-indigo-500' },
                            { title: 'NY Hip-Hop', subtitle: 'New York', bg: 'bg-slate-800' },
                            { title: 'London Electronic', subtitle: 'London', bg: 'bg-purple-600' },
                            { title: 'Paris Jazz', subtitle: 'Paris', bg: 'bg-amber-600' },
                            { title: 'Rio Carnival', subtitle: 'Rio de Janeiro', bg: 'bg-green-500' },
                          ].map((station, i) => (
                            <div 
                              key={i} 
                              onClick={() => handleSelectTrack(tracks[Math.floor(Math.random() * tracks.length)], [...tracks].sort(() => 0.5 - Math.random()))}
                              className={\`min-w-[220px] w-[220px] h-[140px] rounded-[24px] \${station.bg} p-5 flex flex-col justify-end relative cursor-pointer snap-start overflow-hidden premium-card-hover group shadow-lg\`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                              <div className="relative z-10 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <h3 className="text-xl font-bold text-white leading-tight">{station.title}</h3>
                                  <span className="text-xs text-white/70 font-semibold">{station.subtitle}</span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 border border-white/20">
                                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Featured Podcasts */}
                      <div className="flex flex-col gap-4 mt-2 mb-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold text-white hover:underline cursor-pointer flex items-center gap-1">
                            Featured Podcasts <ChevronRight className="w-5 h-5 text-slate-400" />
                          </h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto custom-scroll pb-4 snap-x hide-scrollbar">
                          {[
                            { title: 'The Daily', author: 'The New York Times', img: 'https://images.unsplash.com/photo-1593697972679-c4041d132a46?w=200&h=200&fit=crop' },
                            { title: 'Huberman Lab', author: 'Scicomm Media', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&h=200&fit=crop' },
                            { title: 'Anything Goes', author: 'Emma Chamberlain', img: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=200&h=200&fit=crop' },
                            { title: 'SmartLess', author: 'Jason Bateman', img: 'https://images.unsplash.com/photo-1628751591786-b48509e530b1?w=200&h=200&fit=crop' },
                            { title: 'Crime Junkie', author: 'audiochuck', img: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=200&h=200&fit=crop' }
                          ].map((podcast, i) => (
                            <div 
                              key={\`pod-\${i}\`}
                              onClick={() => handleSelectTrack(tracks[Math.floor(Math.random() * tracks.length)], [...tracks].sort(() => 0.5 - Math.random()))}
                              className="min-w-[140px] max-w-[140px] flex flex-col items-start gap-3 snap-start group cursor-pointer text-left premium-card-hover"
                            >
                              <div className="w-full aspect-square rounded-[24px] overflow-hidden relative shadow-lg bg-black/40 premium-image-hover">
                                <img src={podcast.img} className="w-full h-full object-cover" alt={podcast.title} />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-md">Podcast</div>
                                <div className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-md text-white p-2.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 shadow-lg translate-y-2 group-hover:translate-y-0 border border-white/20">
                                  <Play className="w-3 h-3 fill-white ml-0.5" />
                                </div>
                              </div>
                              <div className="flex flex-col w-full">
                                <span className="text-sm font-bold text-white truncate w-full group-hover:text-purple-400 transition-colors">{podcast.title}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 truncate">{podcast.author}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
`;

// Simple string replacement using split
const targetNew = '{newTracks.length === 0 && (';
if (content.includes(targetNew)) {
  const parts = content.split(targetNew);
  // We need to inject right before the newTracks section
  // It occurs twice in the file, but we want the one in the 'new' section which is the first one around line 3650
  
  let i = 0;
  for (let idx = 0; idx < parts.length - 1; idx++) {
      if (parts[idx].includes("sidebarNav === 'new'")) {
          // Found it! Let's recombine with injection
          content = parts.slice(0, idx+1).join(targetNew) + newInjection + '\\n                      ' + targetNew + parts.slice(idx+1).join(targetNew);
          console.log("Patched New section");
          break;
      }
  }
}

const targetRadio = '{/* Subscribe to Play Episodes */}';
if (content.includes(targetRadio)) {
  const parts = content.split(targetRadio);
  content = parts[0] + radioInjection + '\\n                      ' + targetRadio + parts[1];
  console.log("Patched Radio section");
}

fs.writeFileSync(homePath, content, 'utf8');

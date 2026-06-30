const fs = require('fs');

let content = fs.readFileSync('src/store/musicStore.ts', 'utf8');

const startIndex = content.indexOf('const PRESET_TRACKS: Track[] = [');
if (startIndex !== -1) {
  const endIndex = content.indexOf('export const useMusicStore = create<MusicStore>((set, get) => ({');
  if (endIndex !== -1) {
    const replacement = `const PRESET_TRACKS: Track[] = [];\n\n`;
    content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
    fs.writeFileSync('src/store/musicStore.ts', content);
    console.log('Successfully pruned PRESET_TRACKS');
  }
}

// Ensure the UI works perfectly
// In Home.tsx, if isSearching is true, we should show a loader instead of "No songs matched"
let homeContent = fs.readFileSync('src/pages/Home.tsx', 'utf8');
const searchRenderOld = `filteredTracks.length === 0 ? (
          <div className="text-center py-24">
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-500 font-mono">No songs matched your query. Add one via Admin Panel!</p>
          </div>
        )`;
        
const searchRenderNew = `useMusicStore.getState().isSearching ? (
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
homeContent = homeContent.replace(searchRenderOld, searchRenderNew);
fs.writeFileSync('src/pages/Home.tsx', homeContent);
console.log('Successfully updated Home.tsx loading state');


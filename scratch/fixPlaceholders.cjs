const fs = require('fs');
const path = require('path');

const musicStorePath = path.join(__dirname, '..', 'src', 'store', 'musicStore.ts');
let storeContent = fs.readFileSync(musicStorePath, 'utf8');

const tracksMatch = storeContent.match(/const PRESET_TRACKS: Track\[\] = (\[[\s\S]*?\]);\n/);
if (!tracksMatch) {
  console.log("No PRESET_TRACKS found.");
  process.exit(1);
}

let tracksStr = tracksMatch[1];
let tracks = eval('(' + tracksStr + ')');

let updatedCount = 0;

for (let i = 0; i < tracks.length; i++) {
  const track = tracks[i];
  if (track.coverUrl === 'https://via.placeholder.com/300?text=Cover+Art' || !track.coverUrl) {
    if (track.youtubeId) {
      track.coverUrl = `https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`;
      console.log(`Updated ${track.title} with YouTube thumbnail`);
      updatedCount++;
    }
  }
}

console.log(`Updated ${updatedCount} tracks.`);

if (updatedCount > 0) {
  const newTracksStr = JSON.stringify(tracks, null, 4);
  const newContent = storeContent.replace(tracksStr, newTracksStr);
  fs.writeFileSync(musicStorePath, newContent, 'utf8');
  console.log("Updated musicStore.ts successfully.");
}

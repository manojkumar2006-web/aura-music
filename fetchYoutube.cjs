const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

const musicStorePath = path.resolve('./src/store/musicStore.ts');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  let content = fs.readFileSync(musicStorePath, 'utf8');

  const startIndex = content.indexOf('const PRESET_TRACKS: Track[] = [');
  if (startIndex === -1) throw new Error('Could not find PRESET_TRACKS array start');
  const arrayStart = startIndex + 'const PRESET_TRACKS: Track[] = '.length;

  const endIndex = content.indexOf('];', arrayStart);
  if (endIndex === -1) throw new Error('Could not find PRESET_TRACKS array end');

  const arrayString = content.substring(arrayStart, endIndex + 2).replace(';', '').trim();
  let tracks;
  try {
    tracks = eval('(' + arrayString + ')');
  } catch (e) {
    throw new Error('Failed to parse PRESET_TRACKS: ' + e.message);
  }

  console.log(`Found ${tracks.length} tracks. Fetching YouTube IDs...`);

  let successCount = 0;
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];

    if (!track.youtubeId) {
      const searchTerm = `${track.title} ${track.album && track.album !== 'Unknown Album' ? track.album : ''} official audio`.trim();
      let success = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const r = await yts(searchTerm);
          const videos = r.videos;
          if (videos.length > 0) {
            track.youtubeId = videos[0].videoId;
            successCount++;
            console.log(`[${i + 1}/${tracks.length}] SUCCESS: ${track.title} -> ${videos[0].videoId} (${videos[0].title})`);
            success = true;
            break;
          } else {
            console.log(`[${i + 1}/${tracks.length}] FAILED: ${track.title} (No results)`);
            success = true; // no results is a final state, don't retry
            break;
          }
        } catch (e) {
          console.log(`[${i + 1}/${tracks.length}] ERROR on attempt ${attempt}: ${track.title} (${e?.message || e})`);
          await sleep(2000);
        }
      }
      
      // Delay to avoid rate limiting
      await sleep(1500); 
    } else {
      console.log(`[${i + 1}/${tracks.length}] SKIPPED: ${track.title} (Already has youtubeId)`);
    }
  }

  console.log(`\nFinished fetching! Successfully updated ${successCount} tracks.`);

  const newArrayString = JSON.stringify(tracks, null, 2);
  const newContent = content.substring(0, arrayStart) + newArrayString + content.substring(endIndex + 1);

  fs.writeFileSync(musicStorePath, newContent);
  console.log('Saved musicStore.ts successfully.');
}

main().catch(console.error);

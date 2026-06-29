const fs = require('fs');
const https = require('https');
const path = require('path');

const musicStorePath = path.join(__dirname, '..', 'src', 'store', 'musicStore.ts');
let storeContent = fs.readFileSync(musicStorePath, 'utf8');

// Extract the INITIAL_TRACKS array using a regex
const tracksRegex = /const PRESET_TRACKS: Track\[\] = (\[[\s\S]*?\]);\n/;
const match = storeContent.match(tracksRegex);

if (!match) {
  console.error("Could not find PRESET_TRACKS");
  process.exit(1);
}

// Dangerously parse the array (since it's TS, we can use Function constructor if we carefully remove TS types, or regex replace).
// Actually, it's easier to just use regex to match each object, but parsing is more robust.
// Let's use a simpler approach: regex replace for each track's coverUrl.

// Let's just do a regex replace by parsing the JSON-like structure.
// But it's TS, so it might have unquoted keys, etc. 
// However, looking at previous artifacts, the tracks are formatted nicely:
/*
  {
    "id": "t1",
    "title": "Bloody Sweet",
    "artist": "Anirudh Ravichander & Siddharth Basrur",
    "album": "Leo",
    "coverUrl": "...",
    "youtubeId": "..."
  }
*/

async function fetchItunesCover(title, artist, album) {
  return new Promise((resolve) => {
    let query = `${title} ${album || artist}`.trim();
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.results && parsed.results.length > 0) {
            let artwork = parsed.results[0].artworkUrl100;
            // Replace 100x100bb with 600x600bb for better quality
            artwork = artwork.replace('100x100bb', '600x600bb');
            resolve(artwork);
          } else {
            // Try just title and artist
            if (album) {
              const url2 = `https://itunes.apple.com/search?term=${encodeURIComponent(title + ' ' + artist)}&media=music&limit=1`;
              https.get(url2, (res2) => {
                let data2 = '';
                res2.on('data', chunk => data2 += chunk);
                res2.on('end', () => {
                  try {
                    const parsed2 = JSON.parse(data2);
                    if (parsed2.results && parsed2.results.length > 0) {
                      let artwork = parsed2.results[0].artworkUrl100;
                      artwork = artwork.replace('100x100bb', '600x600bb');
                      resolve(artwork);
                    } else {
                      resolve(null);
                    }
                  } catch (e) { resolve(null); }
                });
              }).on('error', () => resolve(null));
            } else {
              resolve(null);
            }
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const tracksMatch = storeContent.match(/const PRESET_TRACKS: Track\[\] = (\[[\s\S]*?\]);\n/);
  if (!tracksMatch) {
    console.log("No PRESET_TRACKS found.");
    return;
  }
  
  let tracksStr = tracksMatch[1];
  
  // We can evaluate it since it's mostly JSON-compatible, but it might have TS syntax.
  // Actually, wait, our musicStore.ts has valid JSON format for tracks inside the array.
  let tracks;
  try {
    tracks = eval('(' + tracksStr + ')');
  } catch (e) {
    console.error("Failed to parse tracks:", e);
    return;
  }
  
  let updatedCount = 0;
  
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    // Always fetch cover for broken ones or just update all if they are ytimg
    if (!track.coverUrl || track.coverUrl.includes('ytimg') || track.coverUrl.includes('placeholder') || track.coverUrl.includes('Kadharalz') || track.coverUrl === 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg' /* jailer generic? */) {
      console.log(`Fetching cover for: ${track.title}`);
      const cover = await fetchItunesCover(track.title, track.artist, track.album);
      if (cover) {
        console.log(`  -> Found: ${cover}`);
        track.coverUrl = cover;
        updatedCount++;
      } else {
        console.log(`  -> Not found for ${track.title}`);
      }
    }
    // I will actually just force fetch for all to ensure they are correct, but that takes long. Let's just fetch for all.
    // The user said "many songs dont have cover url fetch cover url of the song from itunes only cover"
    // Let's just fetch for ALL tracks to be safe and have uniform 600x600 iTunes covers.
    console.log(`Fetching cover for: ${track.title} - ${track.album}`);
    const cover = await fetchItunesCover(track.title, track.artist, track.album);
    if (cover && cover !== track.coverUrl) {
      console.log(`  -> Updated: ${cover}`);
      track.coverUrl = cover;
      updatedCount++;
    }
    await new Promise(r => setTimeout(r, 100)); // Delay to prevent rate limit
  }
  
  console.log(`Updated ${updatedCount} tracks.`);
  
  const newTracksStr = JSON.stringify(tracks, null, 4);
  const newContent = storeContent.replace(tracksStr, newTracksStr);
  
  fs.writeFileSync(musicStorePath, newContent, 'utf8');
  console.log("Updated musicStore.ts successfully.");
}

run();

require('dotenv').config();
const { MongoClient } = require('mongodb');
const yts = require('yt-search');

const SEARCH_QUERIES = [
  'Latest Tamil Hit Songs 2026',
  'Anirudh Ravichander New Songs 2026',
  'A.R. Rahman Latest Tamil 2026',
  'Santhosh Narayanan Retro Album Songs',
  'Jana Nayagan Tamil Songs',
  'TN 2026 Darbuka Siva Album',
  'Uyiriniyae Tamil Album Songs',
  'Good Bad Ugly Anirudh Tamil',
  'Vettaiyan Anirudh Tamil Songs',
  'Kanguva DSP Tamil Songs',
  'G.V. Prakash Kumar Latest Tamil 2026',
  'Sean Roldan New Indie Tamil',
  'Krish Melody Labs Tamil 2026',
  'Top Tamil Independent Songs 2026'
];

function cleanTitle(title) {
  let cleaned = title
    .replace(/\[.*?\]|\(.*?\)/g, '') // Remove brackets and parentheses
    .replace(/\|.*/g, '') // Remove everything after a pipe
    .replace(/-.*/g, '') // Remove everything after a dash (sometimes artist is there)
    .replace(/Official Video Song|Lyrical Video|Full Video|Music Video|Audio Song|Jukebox|Official Teaser/ig, '')
    .trim();
  return cleaned;
}

function extractArtist(title, channelName) {
  // If the title contains a dash, usually it's "Song Name - Artist" or vice versa
  if (title.includes('-')) {
    const parts = title.split('-');
    // Just blindly using the channel name is safer if it's an official label, 
    // but sometimes the artist is in the title. Let's return the channel name mostly,
    // unless the channel is a massive label, then we look for known directors.
  }
  
  const knownDirectors = ['Anirudh', 'Rahman', 'Santhosh Narayanan', 'Yuvan', 'Darbuka Siva', 'G.V. Prakash', 'Sean Roldan', 'DSP', 'Devi Sri Prasad', 'Harris Jayaraj'];
  for (const dir of knownDirectors) {
    if (title.toLowerCase().includes(dir.toLowerCase())) return dir;
  }
  
  return channelName.replace(/VEVO|Official|Music/ig, '').trim();
}

async function syncYoutube() {
  console.log('Starting YouTube automated song synchronization...');
  
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment variables.');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('aura-music');
    const tracksCol = db.collection('tracks');
    
    let totalSynced = 0;

    for (const query of SEARCH_QUERIES) {
      console.log(`\nSearching YouTube for: ${query}`);
      try {
        const results = await yts(query);
        const videos = results.videos.slice(0, 20); // Top 20 per query
        
        for (const video of videos) {
          // Skip videos that are way too long (mixes/jukeboxes)
          if (video.duration.seconds > 600) continue;

          const cleanTitleStr = cleanTitle(video.title);
          if (cleanTitleStr.length < 2) continue;

          const artist = extractArtist(video.title, video.author.name);
          const album = 'Tamil New Releases 2026';

          const trackData = {
            id: `yt-${video.videoId}`,
            title: cleanTitleStr,
            artist: artist,
            album: album,
            coverUrl: video.thumbnail, // High-res yt thumbnail
            previewUrl: '', // AudioPlayer handles youtubeId automatically!
            youtubeId: video.videoId, // This triggers the react-youtube iframe
            duration: video.duration.seconds || 180,
            releaseDate: new Date().toISOString().substring(0, 10), // Mark as today so it sorts as newest
            updatedAt: new Date()
          };

          await tracksCol.updateOne(
            { id: trackData.id },
            { $set: trackData },
            { upsert: true }
          );
          
          totalSynced++;
        }
        
        console.log(`Processed ${videos.length} videos from query: ${query}`);
        // Avoid getting rate limited by yt-search scraping
        await new Promise(r => setTimeout(r, 2000));
        
      } catch (err) {
        console.error(`Error searching YouTube for ${query}:`, err.message);
      }
    }
    
    console.log(`\n✅ YouTube Sync Complete! Inserted/Updated ${totalSynced} tracks.`);

  } finally {
    await client.close();
  }
}

syncYoutube().catch(console.error);

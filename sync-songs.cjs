require('dotenv').config();
const { MongoClient } = require('mongodb');

// A subset of top artists to sync regularly. You can expand this.
const ARTISTS_TO_SYNC = [
  'Anirudh Ravichander', 'A. R. Rahman', 'Arijit Singh', 'Shreya Ghoshal',
  'Taylor Swift', 'The Weeknd', 'Drake', 'Bad Bunny', 'BTS'
];

async function syncSongs() {
  console.log('Starting automated song synchronization...');
  
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
    let newInserted = 0;

    for (const artist of ARTISTS_TO_SYNC) {
      console.log(`\nFetching latest releases for: ${artist}`);
      try {
        // Fetch top 50 latest/popular tracks for the artist
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=song&limit=50`;
        const response = await fetch(url);
        const data = await response.json();
        
        const tracks = data.results || [];
        
        for (const track of tracks) {
          const trackData = {
            id: track.trackId.toString(),
            title: track.trackName,
            artist: track.artistName,
            album: track.collectionName || 'Single',
            coverUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : '',
            previewUrl: track.previewUrl, // The actual audio link!
            duration: track.trackTimeMillis ? Math.floor(track.trackTimeMillis / 1000) : 180,
            releaseDate: track.releaseDate ? track.releaseDate.substring(0, 10) : new Date().toISOString().substring(0, 10),
            updatedAt: new Date()
          };

          // Upsert: If the track ID exists, update it. If not, insert it as a new track.
          const result = await tracksCol.updateOne(
            { id: trackData.id },
            { $set: trackData },
            { upsert: true }
          );

          totalSynced++;
          if (result.upsertedCount > 0) {
            newInserted++;
            console.log(`  [NEW] Added: ${trackData.title} - ${trackData.artist}`);
          }
        }
        
        // Slight delay to prevent rate-limiting from iTunes API
        await new Promise(r => setTimeout(r, 500));
        
      } catch (err) {
        console.error(`Error fetching data for ${artist}:`, err.message);
      }
    }
    
    console.log(`\n======================================`);
    console.log(`Sync Complete!`);
    console.log(`Total Tracks Processed: ${totalSynced}`);
    console.log(`Brand New Songs Added to DB: ${newInserted}`);
    console.log(`======================================\n`);
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

syncSongs();

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Helper: fetch with retry & exponential backoff
async function fetchWithRetry(url, retries = 4, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429 || res.status === 403) {
        const wait = delayMs * attempt;
        console.log(`    Rate limited. Waiting ${wait}ms before retry ${attempt}/${retries}...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = delayMs * attempt;
      console.log(`    Fetch error. Retrying in ${wait}ms... (${attempt}/${retries})`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw new Error(`Failed after ${retries} retries`);
}

// A subset of top artists to sync regularly. You can expand this.
const ARTISTS_TO_SYNC = [
      // Top Kollywood / Tollywood Music Directors
      'Anirudh Ravichander', 'A. R. Rahman', 'Yuvan Shankar Raja', 'Harris Jayaraj', 
      'Devi Sri Prasad', 'Thaman S', 'Santhosh Narayanan', 'G.V. Prakash Kumar', 
      'Ilayaraja', 'Vidyasagar', 'Hiphop Tamizha', 'Vijay Antony', 'Sam C.S.', 
      'Ravi Basrur', 'D. Imman', 'Mani Sharma', 'M. M. Keeravani', 'Mickey J. Meyer',
      'Sai Abhyankar',
      
      // Top Indian Singers
      'Arijit Singh', 'Shreya Ghoshal', 'Sid Sriram', 'S. P. Balasubrahmanyam', 
      'K. S. Chithra', 'Karthik', 'Hariharan', 'Udit Narayan', 'Sonu Nigam', 
      'KK', 'Mohit Chauhan', 'Atif Aslam', 'Rahat Fateh Ali Khan', 'Neha Kakkar', 
      'Jubin Nautiyal', 'Jonita Gandhi', 'Shweta Mohan', 'Armaan Malik', 'Darshan Raval',

      // Bollywood Music Directors
      'Pritam', 'Amit Trivedi', 'Vishal-Shekhar', 'Sachin-Jigar', 'Shankar-Ehsaan-Loy', 
      'Anu Malik', 'Nadeem-Shravan', 'Jatin-Lalit', 'Himesh Reshammiya', 'Mithoon',
      'Meet Bros', 'Tanishk Bagchi', 'Amaal Mallik',

      // Global Pop & R&B
      'The Weeknd', 'Taylor Swift', 'Dua Lipa', 'Ed Sheeran', 'Ariana Grande', 
      'Billie Eilish', 'Bruno Mars', 'SZA', 'Frank Ocean', 'Rihanna', 'Katy Perry', 
      'Justin Bieber', 'Selena Gomez', 'Lady Gaga', 'Adele', 'Harry Styles', 
      'Shawn Mendes', 'Charlie Puth', 'Miley Cyrus', 'Lana Del Rey',

      // Hip Hop & Rap
      'Drake', 'Kendrick Lamar', 'Travis Scott', 'Eminem', 'Post Malone', 'J. Cole', 
      'Badshah', 'Yo Yo Honey Singh', 'Kanye West', 'Jay-Z', 'Lil Wayne', 'Nicki Minaj', 
      'Cardi B', 'Megan Thee Stallion', 'Doja Cat', 'Future', '21 Savage',

      // Latin & Reggaeton
      'Bad Bunny', 'J Balvin', 'Shakira', 'Karol G', 'Maluma', 'Ozuna', 'Daddy Yankee',

      // K-Pop
      'BTS', 'BLACKPINK', 'Stray Kids', 'NewJeans', 'TWICE', 'SEVENTEEN', 'EXO', 'Red Velvet',

      // Rock, Indie & Alternative
      'Coldplay', 'Arctic Monkeys', 'The Neighbourhood', 'Imagine Dragons', 'Linkin Park', 
      'Avril Lavigne', 'Green Day', 'Nirvana', 'Red Hot Chili Peppers', 'Foo Fighters',

      // EDM & Electronic
      'David Guetta', 'Calvin Harris', 'Martin Garrix', 'Avicii', 'The Chainsmokers', 
      'DJ Snake', 'Marshmello', 'Alan Walker', 'Tiesto', 'Skrillex', 'Zedd', 'Kygo',

      // Classics & Legends
      'Michael Jackson', 'Queen', 'The Beatles', 'Kishore Kumar', 'Lata Mangeshkar', 
      'Asha Bhosle', 'Mohammed Rafi', 'Mukesh', 'Elton John', 'Elvis Presley',

      // Trending & Actors
      'Sadie Sink'
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
        // Fetch up to 200 latest/popular tracks for the artist using retry logic
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=song&limit=200`;
        const data = await fetchWithRetry(url);
        
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
        
        // Increased delay to 1500ms between artists to avoid rate limiting
        await new Promise(r => setTimeout(r, 1500));
        
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

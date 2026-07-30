require('dotenv').config();
const { MongoClient } = require('mongodb');

async function test() {
  if (!process.env.MONGODB_URI) return;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('aura-music');
  
  // Find all Tamil artists in the DB
  const tracks = await db.collection('tracks').find({ region: 'Tamil' }).toArray();
  const artists = new Set();
  tracks.forEach(t => {
    if (t.artist) {
      t.artist.split(',').forEach(a => artists.add(a.trim()));
    }
  });
  
  console.log(`Total Tamil tracks: ${tracks.length}`);
  console.log('Music Directors / Artists found:');
  console.log(Array.from(artists).join('\n'));
  
  await client.close();
}
test();

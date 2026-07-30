require('dotenv').config();
const { MongoClient } = require('mongodb');

async function wipeNonTamil() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI in .env');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('aura-music');
  const tracksCol = db.collection('tracks');

  // Keep only tracks where region is 'Tamil' OR language is 'Tamil' OR source is 'jiosaavn'
  const result = await tracksCol.deleteMany({
    $and: [
      { region: { $ne: 'Tamil' } },
      { language: { $ne: 'Tamil' } },
      { source: { $ne: 'jiosaavn' } }
    ]
  });

  console.log(`Deleted ${result.deletedCount} non-Tamil tracks.`);

  const remaining = await tracksCol.countDocuments();
  console.log(`Remaining tracks in DB (Tamil): ${remaining}`);

  await client.close();
}

wipeNonTamil();

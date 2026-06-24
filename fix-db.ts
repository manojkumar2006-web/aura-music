import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please define MONGODB_URI in .env');
  process.exit(1);
}

const client = new MongoClient(uri);

async function fixDb() {
  try {
    await client.connect();
    const db = client.db('aura-music');
    const tracksCol = db.collection('tracks');

    const result = await tracksCol.updateMany(
      { album: 'Leo' },
      { $set: { coverUrl: '/covers/Leo.jpg' } }
    );

    console.log(`Updated ${result.modifiedCount} tracks to use local Leo cover image.`);
  } catch (error) {
    console.error('Error fixing DB:', error);
  } finally {
    await client.close();
  }
}

fixDb();

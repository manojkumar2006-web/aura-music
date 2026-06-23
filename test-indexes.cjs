require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('aura-music');
    const indexes = await db.collection('users').indexes();
    console.log("Indexes:", JSON.stringify(indexes, null, 2));
    
    // Also log the latest user to see what might have failed
    const users = await db.collection('users').find().sort({ createdAt: -1 }).limit(3).toArray();
    console.log("Latest users:", JSON.stringify(users, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();

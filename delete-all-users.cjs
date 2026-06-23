require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('aura-music');
    const usersCol = db.collection('users');

    const result = await usersCol.deleteMany({});
    console.log(`Deleted ${result.deletedCount} account(s) from the database.`);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();

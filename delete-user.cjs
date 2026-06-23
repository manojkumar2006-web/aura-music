require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('aura-music');
    const usersCol = db.collection('users');

    const result = await usersCol.deleteOne({ email: 'manojkumarsas2006@gmail.com' });
    console.log(`Deleted ${result.deletedCount} account(s).`);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();

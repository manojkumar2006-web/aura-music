require('dotenv').config();
const fs = require('fs');
const { MongoClient } = require('mongodb');

const weathers = ['Clear', 'Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy'];

async function run() {
  try {
    // 1. Update MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('aura-music');
    const tracksCol = db.collection('tracks');

    const tracks = await tracksCol.find({}).toArray();
    for (const track of tracks) {
      if (!track.weather) {
        const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
        await tracksCol.updateOne({ _id: track._id }, { $set: { weather: randomWeather } });
      }
    }
    console.log(`Updated ${tracks.length} tracks in MongoDB with weather tags.`);
    await client.close();

    // 2. Update musicStore.ts PRESET_TRACKS
    const storePath = './src/store/musicStore.ts';
    let storeContent = fs.readFileSync(storePath, 'utf8');
    
    // Find all track objects in PRESET_TRACKS and add weather if missing
    // We'll use a simple regex approach: replace `isPremiumPlus: false` or similar with `isPremiumPlus: false,\n  "weather": "Sunny"` etc.
    let count = 0;
    storeContent = storeContent.replace(/"isPremiumPlus": (true|false)(?!,[\s\n]*"weather")/g, (match, p1) => {
      count++;
      const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
      return `"isPremiumPlus": ${p1},\n  "weather": "${randomWeather}"`;
    });

    fs.writeFileSync(storePath, storeContent);
    console.log(`Updated ${count} tracks in musicStore.ts with weather tags.`);

  } catch (e) {
    console.error(e);
  }
}
run();

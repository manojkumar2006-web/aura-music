/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Seed script: Run with `npx tsx scripts/seed.ts` to populate MongoDB with track data.
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const PRESET_TRACKS = [
  {
    id: "karuppu-1",
    title: "Aathi Raasathi",
    artist: "Sai Abhyankkar, Dhass Benjamin",
    album: "Karuppu",
    duration: "3:58",
    coverUrl: "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
    audioUrl128k: "/audio/Karuppu/Aathi Raasathi.mp3",
    releaseDate: "2026",
    hero: "Suriya",
    musicDirector: "Sai Abhyankkar",
    region: "Tamil",
    isPremium: false,
    isPremiumPlus: false
  },
  {
    id: "karuppu-2",
    title: "Athu Thalore",
    artist: "Sai Abhyankkar, Ananya Chakraborty",
    album: "Karuppu",
    duration: "3:51",
    coverUrl: "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
    audioUrl128k: "/audio/Karuppu/Athu Thalore.mp3",
    releaseDate: "2026",
    hero: "Suriya",
    musicDirector: "Sai Abhyankkar",
    region: "Tamil",
    isPremium: false,
    isPremiumPlus: false
  },
  {
    id: "karuppu-3",
    title: "God Mode Begins",
    artist: "Sai Abhyankkar, Gana Muthu, Vishnu Edavan",
    album: "Karuppu",
    duration: "0:56",
    coverUrl: "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
    audioUrl128k: "/audio/Karuppu/God Mode Begins.mp3",
    releaseDate: "2026",
    hero: "Suriya",
    musicDirector: "Sai Abhyankkar",
    region: "Tamil",
    isPremium: false,
    isPremiumPlus: false
  },
  {
    id: "karuppu-4",
    title: "God Mode",
    artist: "Sai Abhyankkar, Gana Muthu",
    album: "Karuppu",
    duration: "4:00",
    coverUrl: "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
    audioUrl128k: "/audio/Karuppu/God Mode.mp3",
    releaseDate: "2026",
    hero: "Suriya",
    musicDirector: "Sai Abhyankkar",
    region: "Tamil",
    isPremium: false,
    isPremiumPlus: false
  },
  {
    id: "karuppu-5",
    title: "Karuppa Kooda Va",
    artist: "Sai Abhyankkar, V.M. Mahalingam",
    album: "Karuppu",
    duration: "4:10",
    coverUrl: "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
    audioUrl128k: "/audio/Karuppu/Karuppa Kooda Va.mp3",
    releaseDate: "2026",
    hero: "Suriya",
    musicDirector: "Sai Abhyankkar",
    region: "Tamil",
    isPremium: false,
    isPremiumPlus: false
  },
  {
    id: "karuppu-6",
    title: "Naanga Naalu Peru",
    artist: "Sai Abhyankkar, Silambarasan Tr",
    album: "Karuppu",
    duration: "3:17",
    coverUrl: "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
    audioUrl128k: "/audio/Karuppu/Naanga Naalu Peru.mp3",
    releaseDate: "2026",
    hero: "Suriya",
    musicDirector: "Sai Abhyankkar",
    region: "Tamil",
    isPremium: false,
    isPremiumPlus: false
  },
  {
    id: "karuppu-7",
    title: "Raathu Raasan",
    artist: "Sai Abhyankkar, V.M. Mahalingam, Paal Dabba",
    album: "Karuppu",
    duration: "3:15",
    coverUrl: "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
    audioUrl128k: "/audio/Karuppu/Raathu Raasan.mp3",
    releaseDate: "2026",
    hero: "Suriya",
    musicDirector: "Sai Abhyankkar",
    region: "Tamil",
    isPremium: false,
    isPremiumPlus: false
  },
  {
    id: "karuppu-8",
    title: "Verappa - Extended",
    artist: "Sai Abhyankkar, Arivu",
    album: "Karuppu",
    duration: "4:21",
    coverUrl: "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
    audioUrl128k: "/audio/Karuppu/Verappa - Extended.mp3",
    releaseDate: "2026",
    hero: "Suriya",
    musicDirector: "Sai Abhyankkar",
    region: "Tamil",
    isPremium: false,
    isPremiumPlus: false
  },
  {
    id: "karuppu-9",
    title: "Verappa",
    artist: "Sai Abhyankkar, Arivu",
    album: "Karuppu",
    duration: "1:40",
    coverUrl: "/audio/Karuppu/Karuppu-Original-Motion-Picture-Soundtrack-Tamil-2026-20260525175054-500x500.jpg",
    audioUrl128k: "/audio/Karuppu/Verappa.mp3",
    releaseDate: "2026",
    hero: "Suriya",
    musicDirector: "Sai Abhyankkar",
    region: "Tamil",
    isPremium: false,
    isPremiumPlus: false
  },
  {
    id: 'track-1',
    title: 'Helix Symphony I',
    artist: 'Helix Band',
    album: 'Helix World',
    duration: '06:12',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80',
    audioUrl128k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioUrl320k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioUrlFlac: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioUrlAtmos: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    isPremium: false,
    releaseDate: '2026-06-20'
  },
  {
    id: 'track-2',
    title: 'Nebula Mist Theme',
    artist: 'Helios Sphere',
    album: 'Cosmic Drift',
    duration: '07:05',
    coverUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=400&q=80',
    audioUrl128k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioUrl320k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioUrlFlac: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioUrlAtmos: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    isPremium: false,
    releaseDate: '2026-06-21'
  },
  {
    id: 'track-3',
    title: 'Event Horizon (Premium)',
    artist: 'Singularity',
    album: 'Dark Horizons',
    duration: '05:44',
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80',
    audioUrl128k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioUrl320k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioUrlFlac: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioUrlAtmos: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    isPremium: true,
    releaseDate: '2026-06-18'
  },
  {
    id: 'track-4',
    title: 'Andromeda Pulse (Premium+)',
    artist: 'Binary Pulsar',
    album: 'Stellar Pulses',
    duration: '05:02',
    coverUrl: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=400&q=80',
    audioUrl128k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioUrl320k: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioUrlFlac: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioUrlAtmos: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    isPremium: true,
    isPremiumPlus: true,
    releaseDate: '2026-06-19'
  }
];

async function seed() {
  console.log('🌱 Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('aura-music');
    
    // Seed tracks
    const tracksCol = db.collection('tracks');
    const existingCount = await tracksCol.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️  Tracks collection already has ${existingCount} documents. Dropping and re-seeding...`);
      await tracksCol.drop();
    }
    
    const result = await tracksCol.insertMany(PRESET_TRACKS);
    console.log(`✅ Inserted ${result.insertedCount} tracks into 'tracks' collection.`);
    
    // Create indexes
    await tracksCol.createIndex({ album: 1 });
    await tracksCol.createIndex({ artist: 1 });
    await tracksCol.createIndex({ musicDirector: 1 });
    await tracksCol.createIndex({ region: 1 });
    console.log('✅ Created indexes on tracks collection.');
    
    // Ensure users collection exists with indexes
    const usersCol = db.collection('users');
    await usersCol.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created users collection with email index.');
    
    // Ensure playlists collection exists
    const playlistsCol = db.collection('playlists');
    await playlistsCol.createIndex({ userId: 1 });
    console.log('✅ Created playlists collection with userId index.');
    
    console.log('\n🎉 Database seeded successfully!');
    console.log(`   Database: aura-music`);
    console.log(`   Collections: tracks (${result.insertedCount}), users, playlists`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();

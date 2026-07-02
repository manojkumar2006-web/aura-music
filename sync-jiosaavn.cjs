/**
 * sync-jiosaavn.cjs
 * 
 * Fetches Tamil songs from JioSaavn (via saavn.dev) and syncs them into MongoDB.
 * 
 * Usage:  node sync-jiosaavn.cjs
 * 
 * NOTE: saavn.dev is only accessible from Vercel's edge network. This script
 * therefore calls your OWN deployed /api/search endpoint (which proxies to saavn.dev)
 * to get the song data, then writes it directly to MongoDB.
 * 
 * Set VERCEL_APP_URL in your .env to your deployed URL, e.g.:
 *   VERCEL_APP_URL=https://aura-music-xxx.vercel.app
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const VERCEL_URL = (process.env.VERCEL_APP_URL || 'https://aura-music-git-main-manojkumar2006-webs-projects.vercel.app').replace(/\/$/, '');
const SAAVN_DIRECT = 'https://saavn.dev/api'; // Works in cloud, may fail locally

// Helper: fetch with retry
async function fetchWithRetry(url, retries = 4, delayMs = 1200) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429 || res.status === 503) {
        const wait = delayMs * attempt;
        console.log(`    Rate limited. Waiting ${wait}ms... (attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      const data = await res.json();
      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = delayMs * attempt;
      console.log(`    Error: ${err.message}. Retrying in ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

// Try saavn.dev directly first; if blocked, fall back to your Vercel proxy
async function searchSaavn(query, limit = 50) {
  try {
    const url = `${SAAVN_DIRECT}/search/songs?query=${encodeURIComponent(query)}&page=1&limit=${limit}`;
    const data = await fetchWithRetry(url, 2, 800);
    const results = data?.data?.results || [];
    if (results.length > 0) return results;
  } catch (_) {}

  // Fallback: call your own Vercel /api/search endpoint
  try {
    const url = `${VERCEL_URL}/api/search?q=${encodeURIComponent(query)}`;
    console.log(`    [Fallback] Using Vercel proxy: ${url}`);
    const data = await fetchWithRetry(url, 3, 1000);
    if (Array.isArray(data)) return data; // Already mapped
    return data?.data?.results || [];
  } catch (err) {
    console.error(`    Both saavn.dev and Vercel proxy failed: ${err.message}`);
    return [];
  }
}

// Convert a JioSaavn song object to our Track schema
function mapSaavnSong(song) {
  if (!song || !song.id) return null;

  // If already mapped (from Vercel proxy), return as-is
  if (song.audioUrl128k !== undefined) return song;

  const imageArr = Array.isArray(song.image) ? song.image : [];
  const coverUrl = imageArr.find(i => i.quality === '500x500')?.url
    || imageArr.find(i => i.quality === '150x150')?.url
    || '';

  const downloadArr = Array.isArray(song.downloadUrl) ? song.downloadUrl : [];
  const audioUrl320k = downloadArr.find(d => d.quality === '320kbps')?.url || '';
  const audioUrl128k =
    downloadArr.find(d => d.quality === '160kbps')?.url ||
    downloadArr.find(d => d.quality === '96kbps')?.url ||
    downloadArr[0]?.url || '';

  const artistNames = Array.isArray(song.artists?.primary)
    ? song.artists.primary.map(a => a.name).join(', ')
    : song.primaryArtists || 'Unknown Artist';

  const albumName = song.album?.name || song.album || 'Single';
  const releaseYear = song.year
    ? String(song.year)
    : (song.releaseDate ? song.releaseDate.substring(0, 4) : new Date().getFullYear().toString());

  return {
    id: `saavn_${song.id}`,
    title: song.name || song.title || 'Unknown',
    artist: artistNames,
    album: albumName,
    coverUrl,
    audioUrl128k,
    audioUrl320k,
    youtubeId: '',
    isPremium: false,
    isPremiumPlus: false,
    duration: song.duration ? parseInt(song.duration) : 180,
    releaseDate: song.releaseDate || `${releaseYear}-01-01`,
    region: 'Tamil',
    language: 'Tamil',
    source: 'jiosaavn',
    updatedAt: new Date(),
  };
}

// All Tamil queries to sweep
const TAMIL_QUERIES = [
  // 2026 specific queries up to July
  'new tamil songs 2026',
  'trending tamil songs 2026',
  'latest tamil hits 2026',
  'tamil songs january 2026',
  'tamil songs february 2026',
  'tamil songs march 2026',
  'tamil songs april 2026',
  'tamil songs may 2026',
  'tamil songs june 2026',
  'tamil songs july 2026',
  'top tamil songs 2026',
  'anirudh ravichander 2026',
  'ar rahman 2026',
  'yuvan shankar raja 2026',
  'santhosh narayanan 2026',
  'gv prakash 2026',
  'dsp tamil 2026',
  
  // 2025 Blockbusters (still relevant in 2026)
  'new tamil songs 2025',
  'trending tamil songs 2025',
  'anirudh ravichander 2025',
  'ar rahman tamil',
  'yuvan shankar raja tamil',
  'harris jayaraj hits',
  'devi sri prasad tamil',
  'santhosh narayanan hits',
  'gv prakash songs',
  'sid sriram tamil hits',
  
  // Actor specific
  'vijay songs 2026',
  'ajith songs 2026',
  'rajinikanth songs',
  'suriya tamil songs',
  'dhanush tamil songs',
  'vijay sethupathi songs',
  'karthi tamil songs',
  'jayam ravi songs',
  'sivakarthikeyan songs 2026',
  
  // Genres
  'tamil love songs 2026',
  'tamil kuthu songs 2026',
  'tamil album songs 2026',
  'kollywood blockbuster 2026',
  'tamil indie songs 2026',
  'tamil pop songs 2026',
  'tamil rap songs 2026',
  'tamil folk songs',
  'ilaiyaraaja classics',
  'ar rahman classics',
  'harris jayaraj classics',
  'yuvanshankar raja melody',
  'tamil mass bgm songs',
];

const TAMIL_ALBUMS = [
  // 2026 & Late 2025 Major Releases
  'Koolie', 'Thalapathy 69', 'Kanguva 2', 'Suriya 44', 'SDT 2', 
  'Vidaamuyarchi', 'Good Bad Ugly', 'Amaran', 'Vettaiyan', 'Kanguva', 'Indian 2',
  'Raayan', 'Thangalaan', 'Leo', 'Jailer',
  
  // Previous hits
  'Viduthalai Part 2', 'Lover', 'Manjummel Boys', 'Vikrant Rona',
  'Beast', 'Varisu', 'Thunivu', 'Ponniyin Selvan 2', 'Ponniyin Selvan 1',
  'Vikram', 'Kaathuvaakula Rendu Kaadhal', 'Vendhu Thanindhathu Kaadu',
  'Anbarivu', 'Mersal', 'Sarkar', 'Bigil', 'Master',
  'Viswasam', 'Valimai', 'NGK', 'Soorarai Pottru', 'Doctor',
  'Don', 'Maaveeran', 'Ayalaan', '2.0', 'Enthiran',
];

async function syncFromJioSaavn() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI in .env');
    process.exit(1);
  }

  console.log(`\n🎵 AURA JioSaavn Tamil Sync`);
  console.log(`   Vercel URL : ${VERCEL_URL}`);
  console.log(`   MongoDB    : Connected\n`);

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('aura-music');
  const tracksCol = db.collection('tracks');

  let totalNew = 0;
  let totalProcessed = 0;
  let totalSkipped = 0;

  const upsertSong = async (raw) => {
    const track = mapSaavnSong(raw);
    if (!track) return;
    if (!track.audioUrl128k) { totalSkipped++; return; } // skip if no audio
    totalProcessed++;
    const result = await tracksCol.updateOne(
      { id: track.id },
      { $set: { ...track, updatedAt: new Date() } },
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      totalNew++;
      console.log(`  ✅ [NEW] ${track.title} — ${track.artist}`);
    }
  };

  // ── Phase 1: Tamil Search Queries ──────────────────────
  console.log('📻 Phase 1: Tamil Song Queries...');
  for (const query of TAMIL_QUERIES) {
    try {
      console.log(`\n  🔍 "${query}"`);
      const songs = await searchSaavn(query, 50);
      console.log(`     Found ${songs.length} songs`);
      for (const song of songs) await upsertSong(song);
      await new Promise(r => setTimeout(r, 700));
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
    }
  }

  // ── Phase 2: Album Searches ─────────────────────────────
  console.log('\n💿 Phase 2: Tamil Albums...');
  for (const album of TAMIL_ALBUMS) {
    try {
      console.log(`\n  🎬 "${album} tamil"`);
      const songs = await searchSaavn(album + ' tamil songs', 30);
      console.log(`     Found ${songs.length} songs`);
      for (const song of songs) await upsertSong(song);
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error(`  ❌ Failed album "${album}": ${err.message}`);
    }
  }

  // ── Summary ──────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   JioSaavn Tamil Sync Complete! 🎉   ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  Total Processed : ${String(totalProcessed).padEnd(16)}║`);
  console.log(`║  New Songs Added : ${String(totalNew).padEnd(16)}║`);
  console.log(`║  Skipped (no URL): ${String(totalSkipped).padEnd(16)}║`);
  console.log('╚══════════════════════════════════════╝\n');

  await client.close();
  process.exit(0);
}

syncFromJioSaavn().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

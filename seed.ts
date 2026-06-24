import { MongoClient, GridFSBucket } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please define MONGODB_URI in .env');
  process.exit(1);
}

const client = new MongoClient(uri);

async function uploadFileToGridFS(bucket: GridFSBucket, filePath: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename);
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve(uploadStream.id.toString()));
  });
}

async function seed() {
  try {
    await client.connect();
    const db = client.db('aura-music');
    const bucket = new GridFSBucket(db);
    const tracksCol = db.collection('tracks');

    // Read album metadata
    const albumDir = path.join(process.cwd(), 'src', 'Leo (2023) - Tamil');
    const metadataPath = path.join(albumDir, 'album details.txt');
    const metadataRaw = fs.readFileSync(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataRaw)[0];

    console.log(`Seeding album: ${metadata.movie}`);

    // Upload Cover Image
    const coverPath = path.join(albumDir, 'leo.jpg');
    let coverUrl = '';
    if (fs.existsSync(coverPath)) {
      const coverId = await uploadFileToGridFS(bucket, coverPath, 'leo.jpg');
      coverUrl = `/api/image/${coverId}`;
      console.log(`Uploaded cover art: ${coverUrl}`);
    }

    // Process all MP3s
    const hqDir = path.join(albumDir, 'Leo (2023) - HQ');
    const mp3Files = fs.readdirSync(hqDir).filter(f => f.endsWith('.mp3'));

    for (const file of mp3Files) {
      console.log(`Uploading ${file}...`);
      const filePath = path.join(hqDir, file);
      const audioId = await uploadFileToGridFS(bucket, filePath, file);
      const audioUrl = `/api/audio/${audioId}`;

      const title = file.replace('.mp3', '');

      const trackDocument = {
        id: `track-${uuidv4()}`,
        title: title,
        artist: metadata.musicDirector,
        album: metadata.movie,
        duration: "3:00", // You would parse ID3 tags or run an audio tool to get real duration if needed.
        coverUrl: coverUrl,
        audioUrl128k: audioUrl,
        isPremium: false,
        musicDirector: metadata.musicDirector,
        hero: metadata.hero,
        director: metadata.Director,
        region: "Kollywood"
      };

      await tracksCol.insertOne(trackDocument);
      console.log(`Inserted track: ${title}`);
    }

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await client.close();
  }
}

seed();

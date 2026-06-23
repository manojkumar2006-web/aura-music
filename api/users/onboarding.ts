import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

let cachedClient: MongoClient | null = null;

async function getDb() {
  if (cachedClient) {
    return cachedClient.db('aura-music');
  }
  if (!uri) throw new Error('MONGODB_URI is not defined');
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client.db('aura-music');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, languages, favoriteDirectors } = req.body;

    if (!email || !languages || !favoriteDirectors) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const db = await getDb();
    const usersCol = db.collection('users');

    const user = await usersCol.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const favArtist = favoriteDirectors.length > 0 ? favoriteDirectors.join(', ') : 'Various';

    await usersCol.updateOne(
      { email: email.toLowerCase() },
      { 
        $set: { 
          onboardingComplete: true,
          languages,
          favoriteDirectors,
          'stats.favArtist': favArtist
        } 
      }
    );

    const updatedUser = await usersCol.findOne({ email: email.toLowerCase() });
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to retrieve updated user' });
    }
    
    const { password: _, verificationToken: __, usernameLower: ___, ...safeUser } = updatedUser;

    return res.status(200).json(safeUser);
  } catch (error: any) {
    console.error('Onboarding update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

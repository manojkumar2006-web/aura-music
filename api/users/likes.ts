import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI || '');
    await cachedClient.connect();
  }
  return cachedClient.db('aura-music');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, trackId } = req.body;
    if (!userId || !trackId) return res.status(400).json({ error: 'userId and trackId are required' });

    const db = await getDb();
    const usersCol = db.collection('users');

    const user = await usersCol.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const likedTracks = user.likedTracks || [];
    const isLiked = likedTracks.includes(trackId);

    if (isLiked) {
      await usersCol.updateOne({ id: userId }, { $pull: { likedTracks: trackId } as any });
    } else {
      await usersCol.updateOne({ id: userId }, { $addToSet: { likedTracks: trackId } as any });
    }

    res.status(200).json({ success: true, isLiked: !isLiked });
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
}

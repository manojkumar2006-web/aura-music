/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  try {
    const db = await getDb();
    const tracks = await db.collection('tracks').find({}).toArray();
    res.status(200).json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
}

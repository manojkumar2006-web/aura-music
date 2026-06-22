/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

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
    const { email, password, displayName, avatarUrl } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required' });
    }

    const db = await getDb();
    const usersCol = db.collection('users');

    const existing = await usersCol.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      displayName,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      bio: 'Just joined AURA! 🌌',
      tier: 'Free',
      stats: { tracksPlayed: 0, minutesListened: 0, topGenre: 'Various', favArtist: 'Various' },
      privacy: { isPublicProfile: true, showListeningActivity: true, playlistsPrivateByDefault: false },
      createdAt: new Date().toISOString()
    };

    await usersCol.insertOne(newUser);
    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
}

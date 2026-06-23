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
    const { email, password, username, avatarUrl } = req.body;
    
    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!username || !usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Validate password strength
    const passwordErrors: string[] = [];
    if (!password || password.length < 10) passwordErrors.push('At least 10 characters long');
    if (!/[A-Z]/.test(password || '')) passwordErrors.push('At least one uppercase letter');
    if (!/[0-9]/.test(password || '')) passwordErrors.push('At least one number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password || '')) passwordErrors.push('At least one special character');

    if (passwordErrors.length > 0) {
      return res.status(400).json({ error: 'Password too weak.', passwordErrors });
    }

    const db = await getDb();
    const usersCol = db.collection('users');

    const existingEmail = await usersCol.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const existingUsername = await usersCol.findOne({ username: username.trim().toLowerCase() });
    if (existingUsername) {
      return res.status(409).json({ error: 'This username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Date.now().toString(36) + Math.random().toString(36).substring(2);

    const newUser = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      usernameLower: username.trim().toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      displayName: username.trim(),
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      bio: 'Just joined AURA! 🌌',
      tier: 'Free',
      stats: { tracksPlayed: 0, minutesListened: 0, topGenre: 'Various', favArtist: 'Various' },
      privacy: { isPublicProfile: true, showListeningActivity: true, playlistsPrivateByDefault: false },
      createdAt: new Date().toISOString()
    };

    await usersCol.insertOne(newUser);
    
    // In Vercel serverless we don't have access to the local nodemailer easily unless we import it,
    // let's try importing sendVerificationEmail
    let emailSent = false;
    try {
      const { sendVerificationEmail } = await import('../../lib/email');
      emailSent = await sendVerificationEmail(email.toLowerCase(), verificationToken, username.trim());
    } catch (e) {
      console.error('Failed to import or send email:', e);
    }

    const { password: _, verificationToken: __, usernameLower: ___, ...safeUser } = newUser;
    res.status(201).json({ ...safeUser, emailSent });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
}

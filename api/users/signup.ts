/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Use a simple random token generator instead of uuid to minimize dependencies in Vercel
const generateToken = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

async function sendVerificationEmail(toEmail: string, token: string, displayName: string, appUrl: string): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const verifyLink = `${appUrl}/api/users/verify-email?token=${token}`;

  const mailOptions = {
    from: `"AURA Music" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '🎵 Verify your AURA Music account',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: linear-gradient(135deg, #0a0e27 0%, #121638 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
        <div style="padding: 40px 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 4px; letter-spacing: 6px; text-transform: uppercase;">AURA</h1>
        </div>
        <div style="padding: 0 32px 32px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Welcome, ${displayName}! 👋</h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
            You're almost there. Click the button below to verify your email address.
          </p>
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${verifyLink}" style="display: inline-block; background: linear-gradient(135deg, #2dd4bf 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 100px; font-weight: 600; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Verify Email</a>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
}

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
    
    let emailSent = false;
    try {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const appUrl = `${protocol}://${host}`;
      emailSent = await sendVerificationEmail(email.toLowerCase(), verificationToken, username.trim(), appUrl);
    } catch (e) {
      console.error('Failed to send email:', e);
    }

    const { password: _, verificationToken: __, usernameLower: ___, ...safeUser } = newUser;
    res.status(201).json({ ...safeUser, emailSent });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Failed to create account' });
  }
}

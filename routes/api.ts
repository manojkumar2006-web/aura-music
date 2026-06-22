/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import bcrypt from 'bcryptjs';

const apiRouter = Router();

// ==================== TRACKS ====================

// GET /api/tracks — Fetch all tracks
apiRouter.get('/tracks', async (_req, res) => {
  try {
    const { db } = await connectToDatabase();
    const tracks = await db.collection('tracks').find({}).toArray();
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// GET /api/tracks/:id — Fetch single track
apiRouter.get('/tracks/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const track = await db.collection('tracks').findOne({ id: req.params.id });
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.json(track);
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

// ==================== USERS ====================

// POST /api/users/signup — Register new user
apiRouter.post('/users/signup', async (req, res) => {
  try {
    const { email, password, displayName, avatarUrl } = req.body;
    
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { db } = await connectToDatabase();
    const usersCol = db.collection('users');
    
    // Check if user already exists
    const existing = await usersCol.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      displayName,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      bio: 'Just joined AURA! 🌌',
      tier: 'Free',
      stats: {
        tracksPlayed: 0,
        minutesListened: 0,
        topGenre: 'Various',
        favArtist: 'Various'
      },
      privacy: {
        isPublicProfile: true,
        showListeningActivity: true,
        playlistsPrivateByDefault: false
      },
      createdAt: new Date().toISOString()
    };
    
    await usersCol.insertOne(newUser);
    
    // Return user without password
    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/users/login — Authenticate user
apiRouter.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Return user without password
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// GET /api/users/profile?userId=xxx — Get user profile
apiRouter.get('/users/profile', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile — Update user profile
apiRouter.put('/users/profile', async (req, res) => {
  try {
    const { userId, displayName, bio, avatarUrl, tier, stats, privacy } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    
    const { db } = await connectToDatabase();
    const updateFields: any = {};
    if (displayName !== undefined) updateFields.displayName = displayName;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;
    if (tier !== undefined) updateFields.tier = tier;
    if (stats !== undefined) updateFields.stats = stats;
    if (privacy !== undefined) updateFields.privacy = privacy;
    
    const result = await db.collection('users').findOneAndUpdate(
      { id: userId },
      { $set: updateFields },
      { returnDocument: 'after' }
    );
    
    if (!result) return res.status(404).json({ error: 'User not found' });
    
    const { password: _, ...safeUser } = result;
    res.json(safeUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==================== PLAYLISTS ====================

// GET /api/playlists?userId=xxx — List user playlists
apiRouter.get('/playlists', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    
    const { db } = await connectToDatabase();
    const playlists = await db.collection('playlists').find({ userId }).toArray();
    res.json(playlists);
  } catch (error) {
    console.error('Playlists error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// POST /api/playlists — Create playlist
apiRouter.post('/playlists', async (req, res) => {
  try {
    const { userId, name, coverUrl, trackIds } = req.body;
    if (!userId || !name) return res.status(400).json({ error: 'userId and name are required' });
    
    const { db } = await connectToDatabase();
    const playlist = {
      id: `playlist-${Date.now()}`,
      userId,
      name,
      coverUrl: coverUrl || '',
      trackIds: trackIds || [],
      createdAt: new Date().toISOString()
    };
    
    await db.collection('playlists').insertOne(playlist);
    res.status(201).json(playlist);
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// PUT /api/playlists/:id — Update playlist
apiRouter.put('/playlists/:id', async (req, res) => {
  try {
    const { name, coverUrl, trackIds } = req.body;
    const { db } = await connectToDatabase();
    
    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (coverUrl !== undefined) updateFields.coverUrl = coverUrl;
    if (trackIds !== undefined) updateFields.trackIds = trackIds;
    
    const result = await db.collection('playlists').findOneAndUpdate(
      { id: req.params.id },
      { $set: updateFields },
      { returnDocument: 'after' }
    );
    
    if (!result) return res.status(404).json({ error: 'Playlist not found' });
    res.json(result);
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// DELETE /api/playlists/:id — Delete playlist
apiRouter.delete('/playlists/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('playlists').deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Playlist not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

export default apiRouter;

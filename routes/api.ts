/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { connectToDatabase } from '../lib/mongodb';
import { GridFSBucket, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '../lib/email';

const apiRouter = Router();

// ==================== VALIDATION HELPERS ====================

function validateUsername(username: string): string | null {
  if (!username || username.trim().length < 3) return 'Username must be at least 3 characters.';
  if (username.trim().length > 20) return 'Username must be at most 20 characters.';
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return 'Username can only contain letters, numbers, and underscores.';
  return null;
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 10) errors.push('Must be at least 10 characters.');
  if (!/[A-Z]/.test(password)) errors.push('Must contain at least one uppercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Must contain at least one number.');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) errors.push('Must contain at least one special character.');
  return errors;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==================== TRACKS ====================

// GET /api/tracks — Fetch all tracks (newest first)
apiRouter.get('/tracks', async (_req, res) => {
  try {
    const { db } = await connectToDatabase();
    const tracks = await db.collection('tracks')
      .find({})
      .sort({ releaseDate: -1, updatedAt: -1 })
      .toArray();
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// ==================== JIOSAAVN SEARCH ====================

const cryptoJs = require('crypto-js');

function decryptUrl(encrypted: string) {
  if (!encrypted) return '';
  try {
    const key = cryptoJs.enc.Utf8.parse('38346591');
    const decrypted = cryptoJs.DES.decrypt(
      { ciphertext: cryptoJs.enc.Base64.parse(encrypted) },
      key,
      { mode: cryptoJs.mode.ECB, padding: cryptoJs.pad.Pkcs7 }
    );
    return decrypted.toString(cryptoJs.enc.Utf8).replace('_96.mp4', '_320.mp4');
  } catch (e) {
    return '';
  }
}

function mapSaavnSong(song: any) {
  if (!song?.id) return null;
  if (song.language && song.language.toLowerCase() !== 'tamil') return null;

  const coverUrl = (song.image || song.image_url || '').replace('150x150', '500x500');
  const audioUrl = decryptUrl(song.more_info?.encrypted_media_url || song.encrypted_media_url);
  if (!audioUrl) return null;

  const artistNames = song.more_info?.singers || song.subtitle || song.primary_artists || 'Unknown Artist';
  const albumName = song.more_info?.album || song.album || 'Single';
  const releaseYear = song.year || new Date().getFullYear().toString();

  return {
    id: `saavn_${song.id}`,
    title: song.title ? song.title.replace(/&quot;/g, '"') : 'Unknown',
    artist: artistNames,
    album: albumName,
    coverUrl,
    audioUrl128k: audioUrl.replace('_320.mp4', '_160.mp4'),
    audioUrl320k: audioUrl,
    youtubeId: '',
    isPremium: false,
    isPremiumPlus: false,
    duration: parseInt(song.more_info?.duration || song.duration || 180),
    releaseDate: `${releaseYear}-01-01`,
    region: 'Tamil',
    source: 'jiosaavn',
  };
}

// GET /api/search?q=... — Search via JioSaavn
apiRouter.get('/search', async (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });

    let songs: any[] = [];

    if (query === 'new_releases') {
      const [r1, r2] = await Promise.all([
        fetch(`https://www.jiosaavn.com/api.php?_format=json&_marker=0&api_version=4&ctx=web6dot0&__call=search.getResults&q=${encodeURIComponent('new tamil songs 2026')}`).then(r => r.json()),
        fetch(`https://www.jiosaavn.com/api.php?_format=json&_marker=0&api_version=4&ctx=web6dot0&__call=search.getResults&q=${encodeURIComponent('trending tamil 2026')}`).then(r => r.json()),
      ]);
      songs = [...(r1?.results || []), ...(r2?.results || [])];
    } else {
      const url = `https://www.jiosaavn.com/api.php?_format=json&_marker=0&api_version=4&ctx=web6dot0&__call=search.getResults&q=${encodeURIComponent(query)}`;
      const data = await fetch(url).then(r => r.json());
      songs = data?.results || [];
    }

    const tracks = songs.map(mapSaavnSong).filter(Boolean);
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.json(tracks);
  } catch (error) {
    console.error('JioSaavn search error:', error);
    res.status(500).json({ error: 'Failed to search tracks' });
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

// GET /api/audio/:id — Stream audio from GridFS
apiRouter.get('/audio/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const bucket = new GridFSBucket(db);
    const id = new ObjectId(req.params.id);
    
    // Check if file exists to get content type/length if needed, here we just stream
    res.set('Content-Type', 'audio/mpeg');
    const downloadStream = bucket.openDownloadStream(id);
    
    downloadStream.on('error', (err) => {
      console.error('GridFS audio download error:', err);
      res.status(404).send('Audio not found');
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching audio:', error);
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

// GET /api/image/:id — Stream image from GridFS
apiRouter.get('/image/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const bucket = new GridFSBucket(db);
    const id = new ObjectId(req.params.id);
    
    res.set('Content-Type', 'image/jpeg');
    const downloadStream = bucket.openDownloadStream(id);
    
    downloadStream.on('error', (err) => {
      console.error('GridFS image download error:', err);
      res.status(404).send('Image not found');
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// ==================== USERS ====================

// POST /api/users/signup — Register new user with email verification
apiRouter.post('/users/signup', async (req, res) => {
  try {
    const { email, password, username, avatarUrl } = req.body;
    
    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
      return res.status(400).json({ error: usernameError });
    }

    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password || '');
    if (passwordErrors.length > 0) {
      return res.status(400).json({ error: 'Password too weak.', passwordErrors });
    }

    const { db } = await connectToDatabase();
    const usersCol = db.collection('users');
    
    // Check if email already exists
    const existingEmail = await usersCol.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Check if username already exists
    const existingUsername = await usersCol.findOne({ username: username.trim().toLowerCase() });
    if (existingUsername) {
      return res.status(409).json({ error: 'This username is already taken.' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = uuidv4();

    const newUser = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      usernameLower: username.trim().toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      displayName: username.trim(),
      avatarUrl: avatarUrl || '',
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

    // Send verification email
    const emailSent = await sendVerificationEmail(email.toLowerCase(), verificationToken, username.trim());
    
    if (!emailSent) {
      // Still created user, but warn about email
      console.warn('User created but verification email failed to send.');
    }

    // Return user without sensitive fields
    const { password: _, verificationToken: __, usernameLower: ___, ...safeUser } = newUser;
    res.status(201).json({ ...safeUser, emailSent });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// GET /api/users/verify-email?token=xxx — Verify email via link
apiRouter.get('/users/verify-email', async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).send(getVerificationPage(false, 'No verification token provided.'));
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).send(getVerificationPage(false, 'Invalid or expired verification link.'));
    }

    if (user.emailVerified) {
      return res.send(getVerificationPage(true, 'Your email is already verified! You can close this tab and sign in.'));
    }

    // Mark email as verified
    await db.collection('users').updateOne(
      { verificationToken: token },
      { $set: { emailVerified: true }, $unset: { verificationToken: '' } }
    );

    return res.send(getVerificationPage(true, 'Email verified successfully! You can now sign in to AURA.'));
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).send(getVerificationPage(false, 'Something went wrong. Please try again.'));
  }
});

// POST /api/users/login — Authenticate user
apiRouter.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check email verification
    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email address before signing in. Check your inbox for the verification link.' });
    }
    
    // Return user without sensitive fields
    const { password: _, verificationToken: __, usernameLower: ___, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in. Please try again.' });
  }
});

// POST /api/users/likes - Toggle a liked track
apiRouter.post('/users/likes', async (req, res) => {
  try {
    const { userId, trackId } = req.body;
    if (!userId || !trackId) return res.status(400).json({ error: 'userId and trackId are required' });

    const { db } = await connectToDatabase();
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

    res.json({ success: true, isLiked: !isLiked });
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// POST /api/users/artist-likes - Toggle a liked artist
apiRouter.post('/users/artist-likes', async (req, res) => {
  try {
    const { userId, artistName } = req.body;
    if (!userId || !artistName) return res.status(400).json({ error: 'userId and artistName are required' });

    const { db } = await connectToDatabase();
    const usersCol = db.collection('users');

    const user = await usersCol.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const likedArtists = user.likedArtists || [];
    const isLiked = likedArtists.includes(artistName);

    if (isLiked) {
      await usersCol.updateOne({ id: userId }, { $pull: { likedArtists: artistName } as any });
    } else {
      await usersCol.updateOne({ id: userId }, { $addToSet: { likedArtists: artistName } as any });
    }

    res.json({ success: true, isLiked: !isLiked });
  } catch (error) {
    console.error('Artist like toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle artist like' });
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
    
    const { password: _, verificationToken: __, usernameLower: ___, ...safeUser } = user;
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
    
    const { password: _, verificationToken: __, usernameLower: ___, ...safeUser } = result;
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

// ==================== HELPERS ====================

function getVerificationPage(success: boolean, message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AURA - Email Verification</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0a0e27 0%, #121638 50%, #0a0e27 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 20px;
    }
    .icon.success { background: rgba(45,212,191,0.15); border: 1px solid rgba(45,212,191,0.3); }
    .icon.error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); }
    h1 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    p {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .brand {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.25);
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 20px;
    }
    a.btn {
      display: inline-block;
      padding: 12px 36px;
      background: linear-gradient(135deg, #1e3a5f, #2dd4bf);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 28px;
      transition: transform 0.2s;
    }
    a.btn:hover { transform: scale(1.03); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon ${success ? 'success' : 'error'}">${success ? '✅' : '❌'}</div>
    <h1>${success ? 'Verified!' : 'Error'}</h1>
    <p>${message}</p>
    <a href="/" class="btn">Open AURA</a>
    <div class="brand">AURA Music © ${new Date().getFullYear()}</div>
  </div>
</body>
</html>`;
}



export default apiRouter;

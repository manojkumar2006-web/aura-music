import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=25`;
    const response = await fetch(itunesUrl);
    const data = await response.json();

    // Map iTunes results to AURA Track format
    const tracks = (data.results || []).map((track: any) => ({
      id: track.trackId.toString(),
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName || 'Single',
      coverUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : '',
      youtubeId: '', // Will be fetched dynamically when played
      duration: track.trackTimeMillis ? Math.floor(track.trackTimeMillis / 1000) : 180,
      releaseDate: track.releaseDate ? track.releaseDate.substring(0, 4) : '2026',
      isPremium: false
    }));

    res.status(200).json(tracks);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
}

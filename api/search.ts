import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    let url = '';
    let isRss = false;
    
    // If the query is asking for new releases, fetch iTunes Top Songs RSS Feed for India/Tamil
    if (query === 'new_releases') {
       url = 'https://itunes.apple.com/in/rss/topsongs/limit=30/json';
       isRss = true;
    } else {
       url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=30`;
    }

    const response = await fetch(url);
    const data = await response.json();

    let tracks = [];
    if (isRss) {
       tracks = (data.feed?.entry || []).map((track: any) => ({
          id: track.id.attributes['im:id'],
          title: track['im:name'].label,
          artist: track['im:artist'].label,
          album: track['im:collection']['im:name'].label,
          coverUrl: track['im:image'] && track['im:image'].length > 0 ? track['im:image'][track['im:image'].length - 1].label.replace('170x170', '600x600') : '',
          youtubeId: '',
          duration: 180, // RSS doesn't provide duration easily
          releaseDate: track['im:releaseDate'] ? track['im:releaseDate'].label.substring(0, 4) : '2026',
          isPremium: false
       }));
    } else {
       tracks = (data.results || []).map((track: any) => ({
          id: track.trackId.toString(),
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName || 'Single',
          coverUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : '',
          youtubeId: '', 
          duration: track.trackTimeMillis ? Math.floor(track.trackTimeMillis / 1000) : 180,
          releaseDate: track.releaseDate ? track.releaseDate.substring(0, 4) : '2026',
          isPremium: false
       }));
    }

    res.status(200).json(tracks);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
}

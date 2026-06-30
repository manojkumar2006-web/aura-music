import type { VercelRequest, VercelResponse } from '@vercel/node';
import yts from 'yt-search';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    // append 'song' or 'audio' to get better music results
    const r = await yts({ query: query + ' official audio', pages: 1 });
    const videos = r.videos;
    
    if (videos.length > 0) {
      // Return the best match's youtube ID
      res.status(200).json({ youtubeId: videos[0].videoId });
    } else {
      res.status(404).json({ error: 'No video found on YouTube' });
    }
  } catch (error) {
    console.error('Error fetching youtube ID:', error);
    res.status(500).json({ error: 'Failed to fetch youtube ID' });
  }
}

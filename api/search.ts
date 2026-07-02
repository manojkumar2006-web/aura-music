/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SAAVN_BASE = 'https://saavn.dev/api';

// Map a JioSaavn song to our app's Track format
function mapSaavnSong(song: any) {
  if (!song?.id) return null;

  const imageArr: any[] = Array.isArray(song.image) ? song.image : [];
  const coverUrl =
    imageArr.find((i: any) => i.quality === '500x500')?.url ||
    imageArr.find((i: any) => i.quality === '150x150')?.url ||
    '';

  const downloadArr: any[] = Array.isArray(song.downloadUrl) ? song.downloadUrl : [];
  const audioUrl320k = downloadArr.find((d: any) => d.quality === '320kbps')?.url || '';
  const audioUrl128k =
    downloadArr.find((d: any) => d.quality === '160kbps')?.url ||
    downloadArr.find((d: any) => d.quality === '96kbps')?.url ||
    downloadArr[0]?.url ||
    '';

  const artistNames = Array.isArray(song.artists?.primary)
    ? song.artists.primary.map((a: any) => a.name).join(', ')
    : song.primaryArtists || 'Unknown Artist';

  const albumName = song.album?.name || song.album || 'Single';
  const releaseYear = song.year
    ? String(song.year)
    : (song.releaseDate ? song.releaseDate.substring(0, 4) : new Date().getFullYear().toString());

  return {
    id: `saavn_${song.id}`,
    title: song.name || song.title || 'Unknown',
    artist: artistNames,
    album: albumName,
    coverUrl,
    audioUrl128k,
    audioUrl320k,
    youtubeId: '',
    isPremium: false,
    isPremiumPlus: false,
    duration: song.duration ? parseInt(song.duration) : 180,
    releaseDate: song.releaseDate || `${releaseYear}-01-01`,
    region: 'Tamil',
    source: 'jiosaavn',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const query = (req.query.q as string) || '';
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });

    let tracks: any[] = [];

    if (query === 'new_releases') {
      // Fetch trending Tamil songs from JioSaavn
      const [trending, fresh] = await Promise.all([
        fetch(`${SAAVN_BASE}/search/songs?query=new+tamil+songs+2025&page=1&limit=50`).then(r => r.json()),
        fetch(`${SAAVN_BASE}/search/songs?query=trending+tamil+2026&page=1&limit=50`).then(r => r.json()),
      ]);
      const songs = [
        ...(trending?.data?.results || []),
        ...(fresh?.data?.results || []),
      ];
      tracks = songs.map(mapSaavnSong).filter(Boolean);
    } else {
      // Live search via JioSaavn
      const url = `${SAAVN_BASE}/search/songs?query=${encodeURIComponent(query)}&page=1&limit=50`;
      const data = await fetch(url).then(r => r.json());
      tracks = (data?.data?.results || []).map(mapSaavnSong).filter(Boolean);
    }

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json(tracks);
  } catch (error) {
    console.error('JioSaavn search error:', error);
    return res.status(500).json({ error: 'Failed to search tracks' });
  }
}

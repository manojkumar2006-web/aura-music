const https = require('http'); // local dev

async function fetchYt() {
  const yts = require('yt-search');
  const query = 'Anirudh Hukum official audio';
  const r = await yts({ query, pages: 1 });
  if (r.videos.length > 0) {
    console.log("Video ID: " + r.videos[0].videoId);
  }
}
fetchYt();

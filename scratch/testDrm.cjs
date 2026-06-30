const https = require('https');

const options = {
  hostname: 'www.jiosaavn.com',
  port: 443,
  path: '/api.php?__call=search.getResults&q=anirudh&p=1&n=15&_format=json&_marker=0&ctx=web6dot0',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if(parsed.results && parsed.results.length > 0) {
        parsed.results.forEach(song => {
          console.log(`Song: ${song.title} | DRM: ${song.is_drm} | Preview: ${song.media_preview_url}`);
        });
      }
    } catch(e) {}
  });
});
req.end();

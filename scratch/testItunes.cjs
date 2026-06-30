const https = require('https');

https.get('https://itunes.apple.com/search?term=anirudh&entity=song&limit=2', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(`Found ${parsed.resultCount} tracks.`);
      if (parsed.results && parsed.results.length > 0) {
         console.log(parsed.results[0].trackName, "|", parsed.results[0].artistName);
         console.log(parsed.results[0].artworkUrl100.replace('100x100', '600x600'));
      }
    } catch(e) {
      console.log("Error", e.message);
    }
  });
}).on('error', err => console.log('Error', err));

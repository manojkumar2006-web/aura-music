const https = require('https');

function searchLyrics(title, artist) {
  const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
  console.log(`Fetching: ${url}`);
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.syncedLyrics) {
          console.log(`FOUND SYNCED LYRICS FOR ${title}`);
          console.log(json.syncedLyrics.substring(0, 200) + '...');
        } else if (json.plainLyrics) {
          console.log(`FOUND PLAIN LYRICS FOR ${title}`);
        } else {
          console.log(`NO LYRICS FOR ${title}`);
        }
      } catch(e) {
        console.error('Error parsing JSON:', data);
      }
    });
  }).on('error', err => console.error(err));
}

searchLyrics('Bloody Sweet', 'Anirudh Ravichander');
searchLyrics('Naa Ready', 'Anirudh Ravichander');
searchLyrics('Hukum - Thalaivar Alappara', 'Anirudh Ravichander');

const https = require('https');

https.get('https://open.spotify.com/get_access_token?reason=transport&productType=web_player', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(parsed.accessToken ? "Got Token: " + parsed.accessToken.slice(0, 10) + "..." : "Failed");
      
      if (parsed.accessToken) {
         const options = {
            hostname: 'api.spotify.com',
            path: '/v1/search?q=anirudh&type=track&limit=1',
            headers: { 'Authorization': 'Bearer ' + parsed.accessToken }
         };
         https.get(options, (sRes) => {
            let sData = '';
            sRes.on('data', chunk => sData += chunk);
            sRes.on('end', () => {
               const sParsed = JSON.parse(sData);
               console.log("Search Result:", sParsed.tracks ? sParsed.tracks.items[0].name : "Failed");
            });
         });
      }
    } catch(e) {
      console.log("Error", e.message);
    }
  });
}).on('error', err => console.log('Error', err));

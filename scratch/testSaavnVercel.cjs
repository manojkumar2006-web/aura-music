const https = require('https');

https.get('https://jiosaavn-api.vercel.app/search/songs?query=anirudh', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(parsed.status === "SUCCESS" ? "Success" : "Failed");
      if (parsed.data && parsed.data.results && parsed.data.results.length > 0) {
        const first = parsed.data.results[0];
        console.log(`Song: ${first.name || first.title}`);
        console.log(`Audio URL: ${first.downloadUrl ? first.downloadUrl[first.downloadUrl.length-1].link : 'none'}`);
      }
    } catch(e) {
      console.log("Parse Error", e.message);
    }
  });
}).on('error', err => console.log('Error', err.message));

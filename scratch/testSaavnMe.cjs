const https = require('https');

https.get('https://saavn.me/search/songs?query=anirudh', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(parsed.status === "SUCCESS" ? "Success" : "Failed");
      if (parsed.data && parsed.data.results && parsed.data.results.length > 0) {
        const first = parsed.data.results[0];
        console.log(`Song: ${first.name || first.title}`);
        console.log(`Audio URLs: ${first.downloadUrl ? first.downloadUrl.length : 0}`);
      }
    } catch(e) {
      console.log("Parse Error", e.message);
    }
  });
}).on('error', err => console.log('Error', err));

const https = require('https');

const options = {
  hostname: 'www.jiosaavn.com',
  port: 443,
  path: '/api.php?__call=search.getResults&q=anirudh&p=1&n=5&_format=json&_marker=0&ctx=web6dot0',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Cookie': 'L=tamil; B=537a4e69b3f3b9059e794715f4007bdf;' // dummy cookies
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      if(data.startsWith('<?xml')) {
         console.log("Returned XML. Likely block.");
         return;
      }
      const parsed = JSON.parse(data);
      console.log(parsed.results ? "Success: found " + parsed.results.length : "Failed");
      if(parsed.results && parsed.results.length > 0) {
        console.log("First song: " + parsed.results[0].title);
      }
    } catch(e) {
      console.log("Parse Error", e.message, data.slice(0, 100));
    }
  });
});
req.on('error', e => console.error(e));
req.end();

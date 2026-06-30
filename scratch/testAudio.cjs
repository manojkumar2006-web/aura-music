const https = require('https');

const url = "https://aac.saavncdn.com/227/wuD91F30920B3U42kRvYwDS6CgVL0OIGyE_320.mp4";
https.get(url, (res) => {
  console.log("Status Code: ", res.statusCode);
  console.log("Content-Type: ", res.headers['content-type']);
});

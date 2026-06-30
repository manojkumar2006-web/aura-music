const yts = require('yt-search');

async function testSearch() {
  const r = await yts({ query: 'latest tamil song', pages: 1 });
  const videos = r.videos.slice(0, 3);
  console.log("Found videos:");
  videos.forEach(v => {
    console.log(`- ${v.title} (${v.videoId}) | ${v.author.name}`);
  });
}

testSearch();

require('dotenv').config();
const crypto = require('crypto');

function decryptUrl(encrypted) {
  if (!encrypted) return '';
  try {
    const key = Buffer.from('38346591');
    const decipher = crypto.createDecipheriv('des-ecb', key, Buffer.alloc(0));
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return '';
  }
}

async function searchRaw() {
  console.log('Searching JioSaavn directly for 2026 Tamil Music Directors...');
  const directors = ['Anirudh 2026', 'A.R. Rahman 2026', 'Santhosh Narayanan 2026'];

  for (const q of directors) {
    const url = `https://www.jiosaavn.com/api.php?_format=json&_marker=0&api_version=4&ctx=web6dot0&__call=search.getResults&q=${encodeURIComponent(q)}`;
    const res = await fetch(url).then(r => r.json());
    
    console.log(`\n🎵 Results for ${q}:`);
    if (res.results) {
      res.results.slice(0, 3).forEach(song => {
        const audioUrl = decryptUrl(song.more_info?.encrypted_media_url);
        console.log(`  - ${song.title.replace(/&quot;/g, '"')} (Album: ${song.more_info?.album})`);
      });
    } else {
      console.log('  No results found.');
    }
  }
}

searchRaw();

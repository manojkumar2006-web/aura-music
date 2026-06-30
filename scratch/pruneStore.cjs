const fs = require('fs');

let content = fs.readFileSync('src/store/musicStore.ts', 'utf8');

const startIndex = content.indexOf('const PRESET_TRACKS = [');
if (startIndex !== -1) {
  const endIndex = content.indexOf('export const useMusicStore = create<MusicStore>((set, get) => ({');
  if (endIndex !== -1) {
    const replacement = `const PRESET_TRACKS: Track[] = [];\n\n`;
    content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
    fs.writeFileSync('src/store/musicStore.ts', content);
    console.log('Successfully pruned PRESET_TRACKS');
  } else {
    console.log('Failed to find end index');
  }
} else {
  console.log('Failed to find PRESET_TRACKS');
}

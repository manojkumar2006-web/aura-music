const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// The orphaned block starts here (after handlePlayNext function)
// and before the actual return JSX from the component.
// We identify it by: after "const activeThemeStyle = ..." and the real handlePlayNext function,
// there is a block of orphaned JSX that doesn't belong in the function body before the return().

// Strategy: Find line with handleAddToQueue and cut everything between 
// "const handlePlayNext..." closing brace and that

const playNextFuncStart = content.indexOf('\nconst handlePlayNext = (e: React.MouseEvent, track: Track) => {');
if (playNextFuncStart === -1) { console.log('No handlePlayNext found'); process.exit(1); }

// Find the closing brace of handlePlayNext - look for '};\n\n' after the function
const playNextFuncEnd = content.indexOf('\n  };\n\n\r\n                  {/* Profile Edit Mode', playNextFuncStart);
const handleAddToQueuePos = content.indexOf('\n  const handleAddToQueue', playNextFuncStart);

console.log('playNextFuncStart:', playNextFuncStart);
console.log('playNextFuncEnd:', playNextFuncEnd);
console.log('handleAddToQueuePos:', handleAddToQueuePos);

if (playNextFuncEnd !== -1 && handleAddToQueuePos !== -1) {
  // Keep everything up to and including the closing of handlePlayNext
  const keepUpTo = playNextFuncEnd + '\n  };\n'.length;
  // Skip everything from there to handleAddToQueue
  content = content.slice(0, keepUpTo) + '\n\n' + content.slice(handleAddToQueuePos);
  fs.writeFileSync('src/pages/Home.tsx', content);
  console.log('Fixed! Removed orphaned JSX block');
} else {
  // Alternative: just look for the orphaned block by the exact JSX content
  const orphanStart = '\n\r\n                  {/* Profile Edit Mode vs Display Bio */}';
  const orphanIdx = content.indexOf(orphanStart, playNextFuncStart);
  const nextRealCode = content.indexOf('\n  const handleAddToQueue', playNextFuncStart);
  
  console.log('orphanIdx:', orphanIdx, 'nextRealCode:', nextRealCode);
  
  if (orphanIdx !== -1 && nextRealCode !== -1) {
    content = content.slice(0, orphanIdx) + content.slice(nextRealCode);
    fs.writeFileSync('src/pages/Home.tsx', content);
    console.log('Fixed via alternative method');
  } else {
    console.log('FAILED to fix');
  }
}

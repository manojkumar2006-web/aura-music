const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Remove the orphaned JSX block that was accidentally placed outside the return()
// This block starts at: "\n\n\r\n                  {/* Profile Edit Mode vs Display Bio */}"
// and ends just before a valid function definition

const orphanedStart = '\n\n\r\n                  {/* Profile Edit Mode vs Display Bio */}';
const idx = content.indexOf(orphanedStart);
if (idx !== -1) {
  // Find a safe end point - look for the next proper function or arrow declaration after the orphaned block
  // The duplicated JSX block should end before line with "const handleAddToQueue"
  const safeEnd = content.indexOf('const handleAddToQueue', idx);
  if (safeEnd !== -1) {
    content = content.slice(0, idx) + '\n' + content.slice(safeEnd);
    fs.writeFileSync('src/pages/Home.tsx', content);
    console.log('Removed orphaned JSX block. Safe end at index:', safeEnd);
  } else {
    console.log('Could not find handleAddToQueue after orphaned block. Trying alternate method...');
    
    // alternate: look for the duplicated profile section that's outside JSX
    const fix2 = content.indexOf('\r\n                  {/* Profile Edit Mode vs Display Bio */}');
    console.log('orphaned block at index:', fix2);
  }
} else {
  console.log('No orphaned block found with that exact string. Searching alternatives...');
  
  // Try looking for the double block pattern
  const handlePlayNext = content.indexOf('\nconst handlePlayNext');
  if (handlePlayNext !== -1) {
    // Check what follows after the closing brace of handlePlayNext
    const afterFunc = content.indexOf('\n\n\r\n', handlePlayNext);
    console.log('After handlePlayNext, found double newline at:', afterFunc);
    console.log('Content around there:', JSON.stringify(content.slice(afterFunc, afterFunc + 200)));
  }
}

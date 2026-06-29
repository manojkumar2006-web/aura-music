const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/player/AudioPlayer.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Remove react-youtube import
code = code.replace(/import YouTube from 'react-youtube';\n/, '');

// 2. Change ytPlayerRef type
code = code.replace(/const ytPlayerRef = useRef<any>\(null\);/, 'const ytPlayerRef = useRef<HTMLVideoElement>(null);');

// 3. Remove YouTube Time Sync useEffect
const timeSyncRegex = /\/\/ YouTube Time Sync\s*useEffect\(\(\) => \{[\s\S]*?\}, \[playbackState, currentTrack\]\);\n/;
code = code.replace(timeSyncRegex, '');

// 4. Update playVideo/pauseVideo
code = code.replace(/ytPlayerRef\.current\.playVideo\(\)/g, 'ytPlayerRef.current.play()');
code = code.replace(/ytPlayerRef\.current\.pauseVideo\(\)/g, 'ytPlayerRef.current.pause()');

// 5. Update setVolume
code = code.replace(/ytPlayerRef\.current\.setVolume\(isMuted \? 0 : volume \* 100\);/g, 'ytPlayerRef.current.volume = isMuted ? 0 : volume;');

// 6. Fix handleScrub
const scrubRegex = /if \(audioRef\.current\) \{\s*audioRef\.current\.currentTime = value;\s*\}/;
code = code.replace(scrubRegex, `if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
    if (ytPlayerRef.current) {
      ytPlayerRef.current.currentTime = value;
    }`);

// 7. Replace <YouTube /> with <video />
const youtubeComponentRegex = /<YouTube[\s\S]*?onError=\{\(\) => \{[\s\S]*?console\.warn\("YouTube playback failed"\);\s*\}\}\s*\/>/;

const videoComponent = `<video
            ref={ytPlayerRef}
            src={\`/api/stream/\${currentTrack.youtubeId}\`}
            className={isFullScreen ? "w-full h-full object-contain pointer-events-none" : "hidden"}
            autoPlay={playbackState === 'playing'}
            onTimeUpdate={() => {
              if (ytPlayerRef.current) {
                setCurrentTime(ytPlayerRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (ytPlayerRef.current) {
                setDuration(ytPlayerRef.current.duration);
                ytPlayerRef.current.volume = isMuted ? 0 : volume;
              }
            }}
            onEnded={() => handleNext()}
            onPlay={() => setPlaybackState('playing')}
            onPause={() => setPlaybackState('paused')}
            onError={() => {
               console.warn("Video playback failed");
            }}
          />`;

code = code.replace(youtubeComponentRegex, videoComponent);

fs.writeFileSync(filePath, code);
console.log("Refactored AudioPlayer.tsx successfully");

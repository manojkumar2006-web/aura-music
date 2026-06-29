export interface LrcLine {
  time: number;
  text: string;
}

/**
 * Parses LRC format lyrics into an array of lines with timing in seconds.
 * LRC Format: [mm:ss.xx] Line text
 */
export function parseLrc(lrcText: string): LrcLine[] {
  if (!lrcText) return [];
  
  const lines = lrcText.split('\n');
  const parsedLines: LrcLine[] = [];
  
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  
  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = parseInt(match[3], 10);
      
      // Calculate total time in seconds
      const timeInSeconds = minutes * 60 + seconds + (ms / (match[3].length === 3 ? 1000 : 100));
      const text = line.replace(timeRegex, '').trim();
      
      if (text) {
        parsedLines.push({ time: timeInSeconds, text });
      }
    }
  }
  
  return parsedLines.sort((a, b) => a.time - b.time);
}

/**
 * Utility to normalize and deduplicate artist/director/hero names
 * so that search and filtering work flawlessly.
 */

const NAME_ALIASES: Record<string, string> = {
  // Anirudh variants
  'anirudh': 'Anirudh Ravichander',
  'anirudh ravichandran': 'Anirudh Ravichander',
  'anirudh ravichander': 'Anirudh Ravichander',
  
  // Vijay variants
  'vijay': 'Vijay',
  'thalapathy vijay': 'Vijay',
  'joseph vijay': 'Vijay',
  
  // Rahman variants
  'ar rahman': 'A.R. Rahman',
  'a r rahman': 'A.R. Rahman',
  'a. r. rahman': 'A.R. Rahman',
  'a.r.rahman': 'A.R. Rahman',
  
  // Sai Abhyankar
  'sai abhyankar': 'Sai Abhyankar',
  'sai abhyankkar': 'Sai Abhyankar',
  
  // DSP
  'dsp': 'Devi Sri Prasad',
  'devi sri prasad': 'Devi Sri Prasad',
  
  // Santhosh Narayanan
  'santhosh narayanan': 'Santhosh Narayanan',
  'santosh narayanan': 'Santhosh Narayanan',
  'sana': 'Santhosh Narayanan',
  
  // Lokesh
  'lokesh': 'Lokesh Kanagaraj',
  'lokesh kanagaraj': 'Lokesh Kanagaraj'
};

/**
 * Normalizes a single name string to its canonical form
 */
export const normalizeName = (name: string): string => {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  return NAME_ALIASES[lower] || name.trim();
};

/**
 * Takes an artist string like "Anirudh, Vijay & A.R. Rahman"
 * and returns an array of normalized individual artists: 
 * ["Anirudh Ravichander", "Vijay", "A.R. Rahman"]
 */
export const splitAndNormalizeArtists = (artistString: string): string[] => {
  if (!artistString) return [];
  
  // Split by common delimiters: comma, " and ", " & ", "&"
  const parts = artistString.split(/,|\band\b|&/i);
  
  const normalizedSet = new Set<string>();
  parts.forEach(part => {
    const cleaned = part.trim();
    if (cleaned) {
      normalizedSet.add(normalizeName(cleaned));
    }
  });
  
  return Array.from(normalizedSet);
};

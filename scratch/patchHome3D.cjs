const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Upgrade Search Bar input with focus-within glow
content = content.replace(
  'className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 font-display text-lg"',
  'className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 font-display text-lg transition-all focus:shadow-[0_0_15px_rgba(20,184,166,0.3)] rounded-full px-2"'
);

// 2. Add 3D hovers to the Mixes cards
content = content.replace(
  /className="w-full aspect-square rounded-xl overflow-hidden relative shadow-lg premium-image-hover"/g,
  'className="w-full aspect-square rounded-xl overflow-hidden relative shadow-lg hover-glow-teal hover-3d-tilt"'
);

// 3. Add 3D hovers to the search result grid items
content = content.replace(
  /className={\`group relative rounded-2xl glass-panel p-3 cursor-pointer transition-all duration-300 flex gap-3.5 border \$\{/g,
  'className={`group relative rounded-2xl glass-panel p-3 cursor-pointer hover-3d-tilt hover-glow-teal flex gap-3.5 border ${'
);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Patched Home.tsx with 3D animations');

const fs = require('fs');

let content = fs.readFileSync('src/components/Section.tsx', 'utf8');

// 1. Add framer-motion import
if (!content.includes("import { motion }")) {
  content = content.replace("import { Play, MoreVertical }", "import { Play, MoreVertical } from 'lucide-react';\nimport { motion } from 'framer-motion';\nimport { Play as IgnoreMe }");
}

// 2. Wrap the Section root in motion.div
content = content.replace(
  '<div className="mb-10">',
  '<motion.div \n    initial={{ opacity: 0, y: 50, rotateX: -10 }}\n    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}\n    viewport={{ once: true, margin: "-50px" }}\n    transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}\n    className="mb-10 perspective-wrapper"\n  >'
);
content = content.replace(
  '    </div>\n  );\n}',
  '    </div>\n  </motion.div>\n}'
);

// 3. Update the track card container (the image container) to use hover-3d-tilt and hover-glow-teal
content = content.replace(
  'className="relative aspect-square rounded-lg overflow-hidden mb-3 shadow-lg group-hover:shadow-teal/20 transition-all cursor-pointer"',
  'className="relative aspect-square rounded-lg overflow-hidden mb-3 shadow-lg hover-glow-teal hover-3d-tilt cursor-pointer"'
);

// 4. Update the text title to use text-hover-fade
content = content.replace(
  'className={`font-medium truncate text-sm cursor-pointer ${currentTrack?.id === track.id ? \'text-teal\' : \'text-slate-200 hover:text-white\'}`}',
  'className={`font-medium truncate text-sm cursor-pointer text-hover-fade ${currentTrack?.id === track.id ? \'text-teal\' : \'text-slate-200 hover:text-white\'}`}'
);

fs.writeFileSync('src/components/Section.tsx', content);
console.log('Patched Section.tsx with 3D animations and framer-motion');

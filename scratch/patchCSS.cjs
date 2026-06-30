const fs = require('fs');

const cssAdditions = `
/* =========================================
   PREMIUM 3D & HOLOGRAPHIC GLOW UTILITIES
   ========================================= */

/* The Perspective Wrapper establishes the 3D space for children to tilt in */
.perspective-wrapper {
  perspective: 1200px;
  transform-style: preserve-3d;
}

/* 3D Tilt Effect on Hover */
.hover-3d-tilt {
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
  will-change: transform, box-shadow;
}

.hover-3d-tilt:hover {
  /* Dynamic 3D tilt: Rotates up and left slightly while scaling */
  transform: rotateX(8deg) rotateY(-8deg) scale3d(1.05, 1.05, 1.05) translateZ(10px);
  z-index: 20;
}

/* Holographic Teal Glow Effect */
.hover-glow-teal {
  position: relative;
}

.hover-glow-teal::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(45deg, rgba(20, 184, 166, 0), rgba(20, 184, 166, 0.6), rgba(20, 184, 166, 0));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.6s ease;
  filter: blur(15px);
}

.hover-glow-teal:hover::after {
  opacity: 1;
}

/* Combine Both */
.hover-3d-glow {
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.hover-3d-glow:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(20, 184, 166, 0.35);
}

/* Smooth text fade */
.text-hover-fade {
  transition: color 0.3s ease;
}
`;

fs.appendFileSync('src/index.css', cssAdditions);
console.log('Appended 3D CSS utilities to index.css');

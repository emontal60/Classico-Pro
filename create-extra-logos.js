const fs = require('fs');
const path = require('path');

const publicLogosDir = path.join(__dirname, 'classico-v3', 'public', 'logos');
const rootLogosDir = path.join(__dirname, 'logos');

// Ensure directories exist
fs.mkdirSync(publicLogosDir, { recursive: true });
fs.mkdirSync(rootLogosDir, { recursive: true });

const SVGS = {
  64: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="tigerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffb03a"/>
        <stop offset="50%" stop-color="#ff5e3a"/>
        <stop offset="100%" stop-color="#990000"/>
      </linearGradient>
    </defs>
    <path d="M50,92 L20,62 L20,22 L50,8 L80,22 L80,62 Z" fill="#0f172a" stroke="url(#tigerGrad)" stroke-width="2" />
    <polygon points="50,22 36,36 40,48 50,44 60,48 64,36" fill="url(#tigerGrad)" />
    <polygon points="36,36 24,42 28,54 40,48" fill="#ff5e3a" />
    <polygon points="64,36 76,42 72,54 60,48" fill="#ff5e3a" />
    <polygon points="50,44 44,58 50,66 56,58" fill="#1e293b" stroke="#ffb03a" stroke-width="1.5" />
    <polygon points="40,42 46,44 44,40" fill="#fff" filter="drop-shadow(0 0 3px #fff)" />
    <polygon points="60,42 54,44 56,40" fill="#fff" filter="drop-shadow(0 0 3px #fff)" />
    <polygon points="44,58 46,62 48,58" fill="#fff" />
    <polygon points="56,58 54,62 52,58" fill="#fff" />
    <path d="M50,22 L50,32 M42,28 L48,32 M58,28 L52,32 M28,45 L36,44 M72,45 L64,44" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
  </svg>`,
  65: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="ballFire" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#ef4444" />
      </linearGradient>
    </defs>
    <path d="M10,50 C20,30 40,25 60,40 C50,22 30,22 15,35" fill="none" stroke="url(#ballFire)" stroke-width="3" stroke-linecap="round" opacity="0.8" />
    <path d="M12,58 C25,48 45,45 62,54 C48,38 28,40 18,50" fill="none" stroke="url(#ballFire)" stroke-width="4" stroke-linecap="round" />
    <path d="M15,66 C28,62 42,62 58,68 C45,55 30,58 20,64" fill="none" stroke="url(#ballFire)" stroke-width="3" stroke-linecap="round" opacity="0.8" />
    <circle cx="68" cy="50" r="22" fill="#1e293b" stroke="url(#ballFire)" stroke-width="3.5" />
    <polygon points="68,38 78,45 74,56 62,56 58,45" fill="url(#ballFire)" />
    <path d="M68,38 L68,28 M78,45 L88,43 M74,56 L81,64 M62,56 L55,64 M58,45 L48,43" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
    <path d="M68,28 L80,33 L88,43 L84,56 L81,64 L68,72 L55,64 L52,56 L48,43 L56,33 Z" fill="none" stroke="#fff" stroke-width="1.5" />
  </svg>`,
  66: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="neonCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f2fe"/>
        <stop offset="100%" stop-color="#4facfe"/>
      </linearGradient>
    </defs>
    <path d="M50,90 L20,60 L20,20 L50,5 L80,20 L80,60 Z" fill="#0b1329" stroke="url(#neonCupGrad)" stroke-width="2" />
    <path d="M32,26 L68,26 L64,50 C62,58 56,62 50,62 C44,62 38,58 36,50 Z" fill="url(#neonCupGrad)" />
    <path d="M32,30 C20,30 20,44 33,44" fill="none" stroke="url(#neonCupGrad)" stroke-width="3" stroke-linecap="round" />
    <path d="M68,30 C80,30 80,44 67,44" fill="none" stroke="url(#neonCupGrad)" stroke-width="3" stroke-linecap="round" />
    <rect x="42" y="62" width="16" height="12" fill="#4facfe" rx="2" />
    <rect x="36" y="74" width="28" height="6" fill="url(#neonCupGrad)" rx="2" />
    <polygon points="50,36 53,42 60,42 55,46 57,52 50,48 43,52 45,46 40,42 47,42" fill="#fff" filter="drop-shadow(0 0 4px #fff)" />
  </svg>`,
  67: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="goldLion" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffe066"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
    </defs>
    <path d="M50,92 L20,62 L20,22 L50,8 L80,22 L80,62 Z" fill="#0f172a" stroke="url(#goldLion)" stroke-width="2" />
    <path d="M30,22 L22,35 L32,38 L25,52 L36,52 L32,68 L44,64 L50,80 L56,64 L68,68 L64,52 L75,52 L68,38 L78,35 L70,22 Z" fill="url(#goldLion)" />
    <path d="M38,36 L62,36 L58,62 L50,70 L42,62 Z" fill="#1e293b" stroke="url(#goldLion)" stroke-width="2" />
    <polygon points="50,38 42,46 46,50 50,46 54,50 58,46" fill="url(#goldLion)" />
    <polygon points="48,50 52,50 50,58" fill="#ffe066" />
    <polygon points="40,43 45,45 42,41" fill="#ef4444" />
    <polygon points="60,43 55,45 58,41" fill="#ef4444" />
    <path d="M44,58 C44,65 50,66 50,66 C50,66 56,65 56,58 C56,62 50,62 50,62 C50,62 44,62 44,58 Z" fill="url(#goldLion)" />
  </svg>`,
  68: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="spartanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ff3366"/>
        <stop offset="100%" stop-color="#800020"/>
      </linearGradient>
      <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
    </defs>
    <path d="M50,92 L20,62 L20,22 L50,8 L80,22 L80,62 Z" fill="#0f172a" stroke="url(#spartanGrad)" stroke-width="2" />
    <path d="M50,12 C34,12 30,28 30,38 C30,30 38,20 50,20 C62,20 70,30 70,38 C70,28 66,12 50,12 Z" fill="url(#spartanGrad)" />
    <path d="M36,25 L40,16 M44,22 L46,14 M50,20 L50,12 M56,22 L54,14 M64,25 L60,16" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
    <path d="M35,38 L65,38 L65,58 C65,68 50,75 50,75 C50,75 35,68 35,58 Z" fill="url(#helmetGrad)" />
    <path d="M50,42 L38,50 L46,50 L48,65 L52,65 L54,50 L62,50 Z" fill="#0f172a" stroke="url(#spartanGrad)" stroke-width="1.5" />
    <path d="M35,50 L28,62 L35,58 Z" fill="#64748b" />
    <path d="M65,50 L72,62 L65,58 Z" fill="#64748b" />
  </svg>`,
  69: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="phoenixGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#ff3f00"/>
        <stop offset="50%" stop-color="#ffaf00"/>
        <stop offset="100%" stop-color="#ffffd0"/>
      </linearGradient>
    </defs>
    <path d="M50,92 L20,62 L20,22 L50,8 L80,22 L80,62 Z" fill="#0f172a" stroke="url(#phoenixGrad)" stroke-width="2" />
    <path d="M50,56 C30,56 16,40 22,25 C16,45 32,58 50,62" fill="url(#phoenixGrad)" />
    <path d="M50,56 C70,56 84,40 78,25 C84,45 68,58 50,62" fill="url(#phoenixGrad)" />
    <path d="M50,62 C40,70 42,85 50,90 C58,85 60,70 50,62" fill="url(#phoenixGrad)" />
    <path d="M50,32 C47,32 44,28 44,24 C48,22 50,16 50,16 C50,16 52,22 56,24 C56,28 53,32 50,32 Z" fill="#fff" filter="drop-shadow(0 0 3px #ffaf00)" />
    <path d="M46,32 L54,32 L52,58 L48,58 Z" fill="url(#phoenixGrad)" />
    <polygon points="50,24 48,26 52,26" fill="#ff3f00" />
  </svg>`,
  70: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="wolfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f2fe"/>
        <stop offset="100%" stop-color="#4facfe"/>
      </linearGradient>
    </defs>
    <path d="M50,92 L20,62 L20,22 L50,8 L80,22 L80,62 Z" fill="#0f172a" stroke="url(#wolfGrad)" stroke-width="2" />
    <polygon points="28,26 40,38 32,44" fill="url(#wolfGrad)" />
    <polygon points="72,26 60,38 68,44" fill="url(#wolfGrad)" />
    <polygon points="32,44 42,48 26,58" fill="#4facfe" />
    <polygon points="68,44 58,48 74,58" fill="#4facfe" />
    <polygon points="40,38 50,30 60,38 58,60 50,72 42,60" fill="#1e293b" stroke="url(#wolfGrad)" stroke-width="2" />
    <polygon points="50,42 42,48 46,52 50,48 54,52 58,48" fill="url(#wolfGrad)" />
    <polygon points="46,52 54,52 50,64" fill="#00f2fe" />
    <polygon points="43,44 48,46 46,42" fill="#fff" filter="drop-shadow(0 0 3px #00f2fe)" />
    <polygon points="57,44 52,46 54,42" fill="#fff" filter="drop-shadow(0 0 3px #00f2fe)" />
  </svg>`,
  71: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="50%" stop-color="#eab308"/>
        <stop offset="100%" stop-color="#fbbf24"/>
      </linearGradient>
    </defs>
    <path d="M50,92 C15,75 12,38 12,22 L50,8 L88,22 C88,38 85,75 50,92 Z" fill="#0f172a" stroke="url(#shieldGrad)" stroke-width="4.5" />
    <path d="M50,84 C22,70 20,42 20,28 L50,16 L80,28 C80,42 78,70 50,84 Z" fill="url(#shieldGrad)" opacity="0.15" />
    <polygon points="50,24 53,30 60,30 55,34 57,40 50,36 43,40 45,34 40,30 47,30" fill="url(#shieldGrad)" />
    <path d="M34,42 L66,58 M34,58 L66,42" stroke="url(#shieldGrad)" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    <path d="M36,62 L42,50 L50,56 L58,50 L64,62 Z" fill="url(#shieldGrad)" />
    <circle cx="50" cy="46" r="3" fill="#fff" />
  </svg>`
};

console.log('Writing 8 new enthusiastic SVGs...');
for (const [idx, svg] of Object.entries(SVGS)) {
  const pPath = path.join(publicLogosDir, `logo_${idx}.svg`);
  const rPath = path.join(rootLogosDir, `logo_${idx}.svg`);
  
  fs.writeFileSync(pPath, svg);
  fs.writeFileSync(rPath, svg);
  console.log(`Saved logo_${idx}.svg successfully.`);
}
console.log('All new logos written!');

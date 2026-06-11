const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const publicLogosDir = path.join(__dirname, 'classico-v3', 'public', 'logos');
const rootLogosDir = path.join(__dirname, 'logos');

// Create directories if they don't exist
fs.mkdirSync(publicLogosDir, { recursive: true });
fs.mkdirSync(rootLogosDir, { recursive: true });

// Wikipedia filenames mapping for 52 clubs & national teams
const CLUBS_AND_NATIONS = [
  // 1. European Clubs
  { name: 'Real Madrid', file: 'Real_Madrid_CF.svg', commons: false },
  { name: 'FC Barcelona', file: 'FC_Barcelona_(crest).svg', commons: false },
  { name: 'Liverpool', file: 'Liverpool_FC.svg', commons: false },
  { name: 'Manchester City', file: 'Manchester_City_FC_badge.svg', commons: false },
  { name: 'Manchester United', file: 'Manchester_United_FC_crest.svg', commons: false },
  { name: 'Chelsea', file: 'Chelsea_FC.svg', commons: false },
  { name: 'Arsenal', file: 'Arsenal_FC.svg', commons: false },
  { name: 'Bayern Munich', file: 'FC_Bayern_München_logo_(2017).svg', commons: true },
  { name: 'AC Milan', file: 'Logo_of_AC_Milan.svg', commons: true },
  { name: 'Inter Milan', file: 'FC_Internazionale_Milano_2021_logo.svg', commons: true },
  { name: 'Juventus', file: 'Juventus_FC_logo_(2017).svg', commons: true },
  { name: 'PSG', file: 'Paris_Saint-Germain_F.C..svg', commons: false },
  { name: 'Tottenham', file: 'Tottenham_Hotspur.svg', commons: false },
  { name: 'Atletico Madrid', file: 'Atletico_Madrid_2017_logo.svg', commons: false },
  { name: 'Dortmund', file: 'Borussia_Dortmund_logo.svg', commons: true },
  { name: 'Lazio', file: 'SS_Lazio.svg', commons: false },
  { name: 'AS Roma', file: 'AS_Roma_logo_(2017).svg', commons: false },
  { name: 'Benfica', file: 'SL_Benfica_logo.svg', commons: false },

  // 2. Egyptian & Arab Clubs
  { name: 'Al Ahly', file: 'Al_Ahly_SC_logo.svg', commons: false },
  { name: 'Zamalek', file: 'Zamalek_SC_logo.svg', commons: false },
  { name: 'Al Hilal', file: 'Al-Hilal_SFC_logo.svg', commons: true },
  { name: 'Al Nassr', file: 'Nassr_FC_Logo.svg', commons: false },
  { name: 'Al Ittihad', file: 'Ittihad_logo.svg', commons: false },
  { name: 'Al Ain', file: 'Al_Ain_FC_logo.svg', commons: true },
  { name: 'Pyramids FC', file: 'Pyramids_FC_logo.svg', commons: false },
  { name: 'Al Ahli Saudi', file: 'Al-Ahli_Saudi_FC_logo.svg', commons: false },
  { name: 'Al Shabab', file: 'Al_Shabab_Saudi_Club_Logo.svg', commons: true },
  { name: 'Wydad', file: 'Wydad_Athletic_Club_logo.svg', commons: false },
  { name: 'Raja', file: 'Raja_Club_Athletic_logo.svg', commons: false },
  { name: 'Esperance', file: 'Espérance_Sportive_de_Tunis_logo.svg', commons: false },

  // 3. National Teams
  { name: 'Egypt', file: 'Egyptian_Football_Association_logo.svg', commons: false },
  { name: 'Morocco', file: 'Morocco_national_football_team_badge.svg', commons: false },
  { name: 'Saudi Arabia', file: 'Saudi_Arabia_Football_Federation_logo.svg', commons: false },
  { name: 'Brazil', file: 'Brazilian_Football_Confederation_logo.svg', commons: true },
  { name: 'Argentina', file: 'Asociación_del_Fútbol_Argentino_(crest).svg', commons: true },
  { name: 'France', file: 'France national football team seal.svg', commons: false },
  { name: 'Germany', file: 'DFBEagle.svg', commons: false },
  { name: 'Spain', file: 'Spain_national_football_team_crest.svg', commons: false },
  { name: 'Italy', file: 'FIGC_logo_2023.svg', commons: true },
  { name: 'England', file: 'England_national_football_team_crest.svg', commons: false },
  { name: 'Portugal', file: 'Portuguese_Football_Federation_logo.svg', commons: false },
  { name: 'Netherlands', file: 'Netherlands_national_football_team_crest.svg', commons: false },
  { name: 'Algeria', file: 'Algerian_Football_Federation_logo.svg', commons: false },
  { name: 'Tunisia', file: 'Tunisian_Football_Federation_logo.svg', commons: false },
  { name: 'Sweden', file: 'Swedish_Football_Association_logo.svg', commons: false },
  { name: 'Belgium', file: 'Royal_Belgian_Football_Association_logo.svg', commons: false },
  { name: 'Uruguay', file: 'Uruguay_national_football_team_crest.svg', commons: false },
  { name: 'Croatia', file: 'Croatian_Football_Federation_logo.svg', commons: false },
  { name: 'Japan', file: 'Japan_national_football_team_crest.svg', commons: false },
  { name: 'South Korea', file: 'Korea_Football_Association_logo.svg', commons: false },
  { name: 'Senegal', file: 'Senegal_Football_Federation_logo.svg', commons: false },
  { name: 'Cameroon', file: 'Cameroonian_Football_Federation_logo.svg', commons: false }
];

// Custom vectors for 12 esports/special items (indices 52-63)
const SPECIAL_SVG = {
  52: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#ff0844"/>
        <stop offset="100%" stop-color="#ffb199"/>
      </linearGradient>
    </defs>
    <path d="M50,90 C20,70 15,45 25,20 C15,40 25,60 40,65 C30,45 35,25 50,10 C45,30 55,45 60,55 C55,40 60,25 75,20 C65,45 60,70 50,90 Z" fill="url(#fireGrad)" opacity="0.85" />
    <circle cx="50" cy="65" r="16" fill="#0f172a" stroke="#ffb199" stroke-width="2" />
    <circle cx="50" cy="65" r="12" fill="none" stroke="#fff" stroke-width="1.5" />
    <path d="M50,49 L50,53 M50,77 L50,81 M34,65 L38,65 M66,65 L62,65 M39,54 L42,57 M61,54 L58,57 M39,76 L42,73 M61,76 L58,73" stroke="#fff" stroke-width="1.5" />
  </svg>`,
  53: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="ltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f2fe"/>
        <stop offset="100%" stop-color="#4facfe"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="32" fill="#0b1326" stroke="url(#ltGrad)" stroke-width="2.5" />
    <circle cx="50" cy="50" r="24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
    <path d="M55,25 L38,52 L48,52 L42,75 L62,45 L50,45 Z" fill="url(#ltGrad)" filter="drop-shadow(0 0 5px #00f2fe)" />
  </svg>`,
  54: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="50%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#ffe066"/>
      </linearGradient>
    </defs>
    <path d="M30,80 L70,80 L65,70 L35,70 Z" fill="#475569" />
    <path d="M35,70 L65,70 L58,55 L42,55 Z" fill="#64748b" />
    <circle cx="50" cy="38" r="26" fill="url(#goldGrad)" filter="drop-shadow(0 0 8px rgba(251,191,36,0.5))" />
    <path d="M35,38 Q50,48 65,38 M50,12 Q50,38 50,64 M26,30 Q50,22 74,30 M26,46 Q50,54 74,46" fill="none" stroke="#d97706" stroke-width="1.5" />
  </svg>`,
  55: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffe066" />
        <stop offset="50%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
    </defs>
    <path d="M25,30 C25,12 35,12 50,12 C65,12 75,12 75,30 C75,48 68,58 55,62 L55,75 L68,75 L68,82 L32,82 L32,75 L45,75 L45,62 C32,58 25,48 25,30 Z" fill="url(#trophyGrad)" filter="drop-shadow(0 0 10px rgba(251,191,36,0.6))" />
    <path d="M25,25 C12,25 12,45 25,45 M75,25 C88,25 88,45 75,45" fill="none" stroke="url(#trophyGrad)" stroke-width="3" />
    <path d="M50,22 L52,27 L57,27 L53,30 L55,35 L50,32 L45,35 L47,30 L43,27 L48,27 Z" fill="#fff" />
  </svg>`,
  56: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="bootGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
    </defs>
    <path d="M15,65 L22,42 C24,38 32,32 45,35 L70,40 C80,42 85,50 82,60 L80,68 C78,72 70,72 65,72 L25,72 C18,72 15,68 15,65 Z" fill="url(#bootGrad)" filter="drop-shadow(0 0 6px rgba(251,191,36,0.4))" />
    <rect x="22" y="72" width="6" height="5" fill="#475569" rx="1" />
    <rect x="36" y="72" width="6" height="5" fill="#475569" rx="1" />
    <rect x="50" y="72" width="6" height="5" fill="#475569" rx="1" />
    <rect x="66" y="72" width="6" height="5" fill="#475569" rx="1" />
    <rect x="74" y="72" width="6" height="5" fill="#475569" rx="1" />
    <path d="M30,42 L42,48 M34,39 L46,45 M38,36 L50,42" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
    <path d="M55,42 Q62,56 75,56" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" />
  </svg>`,
  57: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="gloveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
    </defs>
    <path d="M32,78 L32,60 C32,58 34,56 36,56 C38,56 40,58 40,60 L40,30 C40,27 43,25 45,25 C47,25 49,27 49,30 L49,22 C49,19 52,17 54,17 C56,17 58,19 58,22 L58,28 C58,25 61,23 63,23 C65,23 67,25 67,28 L67,42 C67,39 70,37 72,37 C74,37 76,39 76,42 L76,65 C76,74 68,82 58,82 L42,82 C36,82 32,78 32,78 Z" fill="url(#gloveGrad)" filter="drop-shadow(0 0 8px rgba(217,119,6,0.5))" />
    <path d="M32,60 C26,58 20,50 24,44 C28,38 34,46 36,52 Z" fill="url(#gloveGrad)" />
    <rect x="34" y="72" width="38" height="10" fill="#1e293b" rx="2" stroke="#d97706" stroke-width="1.5" />
    <path d="M54,48 L56,52 L61,52 L57,55 L59,60 L54,57 L49,60 L51,55 L47,52 L52,52 Z" fill="#fff" />
  </svg>`,
  58: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="fireCtrl" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ec4899" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
    </defs>
    <path d="M50,75 C25,60 20,40 30,15 C20,35 30,50 45,55 C35,35 40,20 50,5 C45,25 55,40 60,50 C55,35 60,20 70,15 C65,40 60,60 50,75 Z" fill="#f43f5e" opacity="0.6" />
    <path d="M22,50 C22,44 28,38 40,38 L60,38 C72,38 78,44 78,50 L75,68 C73,74 65,76 60,76 L52,70 L48,70 L40,76 C35,76 27,74 25,68 Z" fill="url(#fireCtrl)" filter="drop-shadow(0 0 6px #a855f7)" />
    <circle cx="66" cy="52" r="3" fill="#fff" />
    <circle cx="72" cy="57" r="3" fill="#fff" />
    <circle cx="66" cy="62" r="3" fill="#fff" />
    <path d="M30,57 L34,57 L34,53 L38,53 L38,57 L42,57 L42,61 L38,61 L38,65 L34,65 L34,61 L30,61 Z" fill="#1e293b" />
    <circle cx="46" cy="64" r="5" fill="#1e293b" />
    <circle cx="54" cy="64" r="5" fill="#1e293b" />
  </svg>`,
  59: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="ltCtrl" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f2fe" />
        <stop offset="100%" stop-color="#4facfe" />
      </linearGradient>
    </defs>
    <path d="M54,12 L35,46 L47,46 L40,78 L65,38 L50,38 Z" fill="#00f2fe" opacity="0.6" />
    <path d="M22,46 C22,40 28,34 40,34 L60,34 C72,34 78,40 78,46 L75,64 C73,70 65,72 60,72 L52,66 L48,66 L40,72 C35,72 27,70 25,64 Z" fill="url(#ltCtrl)" filter="drop-shadow(0 0 6px #00f2fe)" />
    <circle cx="66" cy="48" r="3" fill="#fff" />
    <circle cx="72" cy="53" r="3" fill="#fff" />
    <circle cx="66" cy="58" r="3" fill="#fff" />
    <path d="M30,53 L34,53 L34,49 L38,49 L38,53 L42,53 L42,57 L38,57 L38,61 L34,61 L34,57 L30,57 Z" fill="#1e293b" />
  </svg>`,
  60: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="crownGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="50%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#ffe066"/>
      </linearGradient>
    </defs>
    <path d="M15,75 L22,35 L40,55 L50,25 L60,55 L78,35 L85,75 Z" fill="url(#crownGrad)" filter="drop-shadow(0 0 8px rgba(251,191,36,0.5))" />
    <path d="M15,75 L85,75 L85,81 L15,81 Z" fill="#d97706" />
    <circle cx="22" cy="35" r="3" fill="#fff" />
    <circle cx="50" cy="25" r="3" fill="#fff" />
    <circle cx="78" cy="35" r="3" fill="#fff" />
    <circle cx="30" cy="78" r="2.5" fill="#f43f5e" />
    <circle cx="50" cy="78" r="2.5" fill="#3b82f6" />
    <circle cx="70" cy="78" r="2.5" fill="#10b981" />
  </svg>`,
  61: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="dragGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff0844" />
        <stop offset="100%" stop-color="#b91c1c" />
      </linearGradient>
    </defs>
    <path d="M50,15 C45,22 35,25 32,32 C29,38 34,42 28,48 C22,54 12,50 15,62 C18,74 35,85 50,85 C65,85 82,74 85,62 C88,50 78,54 72,48 C66,42 71,38 68,32 C65,25 55,22 50,15 Z" fill="url(#dragGrad)" filter="drop-shadow(0 0 6px #ff0844)" />
    <path d="M42,42 L46,45 M58,42 L54,45" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
    <path d="M45,62 Q50,56 55,62" fill="none" stroke="#ffb199" stroke-width="2" />
  </svg>`,
  62: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="eagleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f2fe" />
        <stop offset="100%" stop-color="#1e3c72" />
      </linearGradient>
    </defs>
    <path d="M35,25 C30,35 25,48 20,62 C32,58 45,55 52,48 C58,42 62,35 72,38 C80,40 85,50 78,65 C70,78 50,82 35,82 C55,82 72,75 78,60 C84,45 78,30 65,32 C58,33 50,22 35,25 Z" fill="url(#eagleGrad)" filter="drop-shadow(0 0 6px #00f2fe)" />
    <circle cx="58" cy="42" r="3" fill="#fff" />
    <path d="M72,38 L76,46 L68,48 Z" fill="#fbbf24" />
  </svg>`,
  63: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="lionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#7c2d12" />
      </linearGradient>
    </defs>
    <path d="M50,15 C35,15 22,25 22,45 C22,60 30,70 42,78 C35,78 28,75 25,72 C35,85 45,85 50,85 C55,85 65,85 75,72 C72,75 65,78 58,78 C70,70 78,60 78,45 C78,25 65,15 50,15 Z" fill="url(#lionGrad)" filter="drop-shadow(0 0 6px #f59e0b)" />
    <path d="M40,48 C40,48 45,42 50,45 C55,42 60,48 60,48 L56,58 L44,58 Z" fill="#7c2d12" />
    <polygon points="50,58 47,54 53,54" fill="#fbbf24" />
    <circle cx="42" cy="40" r="2.5" fill="#fff" />
    <circle cx="58" cy="40" r="2.5" fill="#fff" />
    <path d="M42,20 L45,12 L50,16 L55,12 L58,20 Z" fill="#fbbf24" />
  </svg>`
};

// Generates the raw Wikimedia SVG/image link directly
function getWikiUrl(decodedName, isCommons = false) {
  const filename = decodedName.replace(/ /g, '_');
  const hash = crypto.createHash('md5').update(filename).digest('hex');
  const a = hash[0];
  const ab = hash.slice(0, 2);
  const encodedName = encodeURIComponent(filename)
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%27/g, "'");
  const domain = isCommons ? 'commons' : 'en';
  return `https://upload.wikimedia.org/wikipedia/${domain}/${a}/${ab}/${encodedName}`;
}

// Generate initials fallback SVG
function getFallbackSvg(name) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#00e5ff" stroke-width="3" />
    <text x="50" y="55" font-family="'Cairo', sans-serif" font-weight="bold" font-size="22" fill="#00e5ff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
}

// Helper to download image using parsed URL & custom User-Agent to avoid 429 rate limit
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'ClassicoAppLogoDownloader/1.1 (ayman@classicoapp.com; Classico Sports App Crest Retrieval)'
      }
    };
    https.get(options, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        res.resume();
        const redirectUrl = res.headers.location;
        downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
      } else {
        res.resume(); // consume response to free memory
        reject(new Error(`Failed with status: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Download sequence
async function run() {
  console.log('Starting downloading of 64 football and eSports logos...');
  
  for (let idx = 0; idx < 64; idx++) {
    const publicPath = path.join(publicLogosDir, `logo_${idx}.png`);
    const rootPath = path.join(rootLogosDir, `logo_${idx}.png`);
    
    if (idx >= 52) {
      // eSports / Special symbols (handcrafted vector SVGs)
      console.log(`[Special] Writing handcrafted SVG for logo_${idx}...`);
      const svgContent = SPECIAL_SVG[idx];
      fs.writeFileSync(publicPath, svgContent);
      fs.writeFileSync(rootPath, svgContent);
      continue;
    }
    
    // Club & National teams
    const def = CLUBS_AND_NATIONS[idx];
    const url = getWikiUrl(def.file, def.commons);
    console.log(`[Logo ${idx}] Downloading ${def.name} from: ${url}...`);
    
    try {
      await downloadFile(url, publicPath);
      // Copy to root dir
      fs.copyFileSync(publicPath, rootPath);
      console.log(`[Logo ${idx}] Success: saved ${def.name}.`);
    } catch (err) {
      console.error(`[Logo ${idx}] Error downloading raw SVG for ${def.name}. Using dynamic initials SVG.`, err.message);
      const fallbackSvg = getFallbackSvg(def.name);
      fs.writeFileSync(publicPath, fallbackSvg);
      fs.writeFileSync(rootPath, fallbackSvg);
    }
    
    // Add delay of 350ms to respect Wikipedia's rate limit policies
    await new Promise(r => setTimeout(r, 350));
  }
  
  console.log('All 64 logos processed successfully!');
}

run().catch(console.error);

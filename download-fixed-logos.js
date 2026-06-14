const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const publicLogosDir = path.join(__dirname, 'classico-v3', 'public', 'logos');
const rootLogosDir = path.join(__dirname, 'logos');

// Ensure directories exist
fs.mkdirSync(publicLogosDir, { recursive: true });
fs.mkdirSync(rootLogosDir, { recursive: true });

const FIXED_LOGOS = [
  { idx: 9, name: 'Inter Milan', file: 'FC Internazionale Milano 2021.svg', commons: true },
  { idx: 10, name: 'Juventus', file: 'Juventus FC - logo black (Italy, 2020).svg', commons: true },
  { idx: 13, name: 'Atletico Madrid', file: 'Atletico Madrid logo.svg', commons: false },
  { idx: 15, name: 'Lazio', file: 'S.S. Lazio badge.svg', commons: false },
  { idx: 22, name: 'Al Ittihad', file: 'Al-Ittihad Club (Jeddah) logo.svg', commons: false },
  { idx: 23, name: 'Newcastle United', file: 'Newcastle United Logo.svg', commons: false },
  { idx: 24, name: 'Everton', file: 'Everton FC logo.svg', commons: false },
  { idx: 25, name: 'Al Ahli Saudi', file: 'Al Ahli Saudi FC logo.svg', commons: false },
  { idx: 26, name: 'Al Shabab', file: 'Al Shabab FC (Riyadh).svg', commons: false },
  { idx: 27, name: 'Wydad', file: 'Wydad Athletic Club logo (1937).svg', commons: true },
  { idx: 28, name: 'West Ham', file: 'West Ham United FC logo.svg', commons: false },
  { idx: 29, name: 'Bayer Leverkusen', file: 'Bayer 04 Leverkusen logo.svg', commons: false },
  { idx: 31, name: 'Ajax', file: 'Ajax Amsterdam.svg', commons: false },
  { idx: 32, name: 'Saudi Arabia', file: 'Saudi Arabian Football Federation Logo.svg', commons: false },
  { idx: 34, name: 'Argentina', file: 'Asociación del Fútbol Argentino (crest).svg', commons: false },
  { idx: 38, name: 'Italy', file: 'Logo Italy National Football Team - 2023.svg', commons: true },
  { idx: 41, name: 'Napoli', file: 'SSC Napoli.svg', commons: true },
  { idx: 42, name: 'Porto', file: 'FC Porto.svg', commons: false },
  { idx: 44, name: 'Sweden', file: 'Swedish Football Association crest.svg', commons: false },
  { idx: 45, name: 'Belgium', file: 'Royal Belgian FA logo 2019.svg', commons: false },
  { idx: 46, name: 'Galatasaray', file: 'Galatasaray Sports Club Logo.svg', commons: true },
  { idx: 50, name: 'Senegal', file: 'Senegalese Football Federation logo.svg', commons: false },
  { idx: 51, name: 'Sevilla', file: 'Sevilla FC logo.svg', commons: false }
];

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
        res.resume();
        reject(new Error(`Failed with status: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log('Starting downloading of 23 fixed football logos...');
  for (const def of FIXED_LOGOS) {
    const publicPath = path.join(publicLogosDir, `logo_${def.idx}.svg`);
    const rootPath = path.join(rootLogosDir, `logo_${def.idx}.svg`);
    const url = getWikiUrl(def.file, def.commons);
    console.log(`[Logo ${def.idx}] Downloading ${def.name} from: ${url}...`);
    try {
      await downloadFile(url, publicPath);
      fs.copyFileSync(publicPath, rootPath);
      console.log(`[Logo ${def.idx}] Success: saved ${def.name}.`);
    } catch (err) {
      console.error(`[Logo ${def.idx}] Error downloading for ${def.name}:`, err.message);
    }
    // Respect rate limit with a short delay
    await new Promise(r => setTimeout(r, 400));
  }
  console.log('All downloads completed successfully!');
}

run().catch(console.error);

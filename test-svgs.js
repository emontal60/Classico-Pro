const https = require('https');
const crypto = require('crypto');

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

const candidates = [
  { name: 'Ajax', file: 'Ajax_Amsterdam.svg', commons: true },
  { name: 'Napoli', file: 'SSC_Napoli.svg', commons: true },
  { name: 'Aston Villa', file: 'Aston_Villa_FC_crest_(2016).svg', commons: true },
  { name: 'Newcastle United', file: 'Newcastle_United_Logo.svg', commons: true },
  { name: 'Bayer Leverkusen', file: 'Bayer_04_Leverkusen_logo.svg', commons: true },
  { name: 'Porto', file: 'FC_Porto.svg', commons: true },
  { name: 'Sporting CP', file: 'Sporting_Clube_de_Portugal_logo.svg', commons: true },
  { name: 'Galatasaray', file: 'Galatasaray_Sports_Club_Logo.svg', commons: true },
  { name: 'Fenerbahce', file: 'Fenerbahçe_SK.svg', commons: true },
  { name: 'West Ham', file: 'West_Ham_United_FC_logo.svg', commons: true },
  { name: 'Everton', file: 'Everton_FC_logo.svg', commons: true },
  { name: 'Sevilla', file: 'Sevilla_FC_logo.svg', commons: true },
  { name: 'Boca Juniors', file: 'CABJ70.svg', commons: true },
  { name: 'River Plate', file: 'Club_Atlético_River_Plate_logo.svg', commons: true },
  { name: 'Flamengo', file: 'Flamengo_escudo_novo.svg', commons: true },
  { name: 'Palmeiras', file: 'Sociedade_Esportiva_Palmeiras_logo.svg', commons: true },
  { name: 'Fiorentina', file: 'ACF_Fiorentina_2022.svg', commons: true },
  { name: 'AS Monaco', file: 'AS_Monaco_FC.svg', commons: true },
  { name: 'Lille', file: 'LOSC_Lille_logo.svg', commons: true },
  { name: 'PSV', file: 'PSV_Eindhoven.svg', commons: true },
  { name: 'Feyenoord', file: 'Feyenoord_logo.svg', commons: true },
  { name: 'Bologna', file: 'Bologna_F.C._1909_logo.svg', commons: true },
  { name: 'Torino', file: 'Torino_FC_Logo.svg', commons: true },
  { name: 'Valencia', file: 'Valencia_CF_logo.svg', commons: true },
  { name: 'Villarreal', file: 'Villarreal_CF_logo.svg', commons: true },
  { name: 'Athletic Bilbao', file: 'Athletic_Club_logo.svg', commons: true },
  { name: 'Real Betis', file: 'Real_Betis_logo.svg', commons: true },
  { name: 'Girona', file: 'Girona_FC.svg', commons: true }
];

async function checkUrl(urlStr) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(urlStr);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'ClassicoAppLogoDownloader/1.1 (ayman@classicoapp.com; Classico Sports App Crest Retrieval)'
      }
    };
    https.get(options, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function run() {
  const valid = [];
  for (const c of candidates) {
    const urlE = getWikiUrl(c.file, false);
    const urlC = getWikiUrl(c.file, true);
    let ok = false;
    
    if (await checkUrl(urlE)) { c.commons = false; ok = true; }
    else if (await checkUrl(urlC)) { c.commons = true; ok = true; }

    if (ok) {
      valid.push(c);
      console.log(`VALID: { name: '${c.name}', file: '${c.file}', commons: ${c.commons} }`);
      if (valid.length >= 22) break; // Need 21 or 22
    } else {
      console.log(`INVALID: ${c.name}`);
    }
  }
  console.log(`Found ${valid.length} valid SVGs`);
}
run();

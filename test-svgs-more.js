const https = require('https');
const crypto = require('crypto');

function getWikiUrl(decodedName, isCommons = false) {
  const filename = decodedName.replace(/ /g, '_');
  const hash = crypto.createHash('md5').update(filename).digest('hex');
  const a = hash[0];
  const ab = hash.slice(0, 2);
  const encodedName = encodeURIComponent(filename).replace(/%28/g, '(').replace(/%29/g, ')').replace(/%27/g, "'");
  const domain = isCommons ? 'commons' : 'en';
  return `https://upload.wikimedia.org/wikipedia/${domain}/${a}/${ab}/${encodedName}`;
}

const candidates = [
  { name: 'Stuttgart', file: 'VfB_Stuttgart_1893_Logo.svg', commons: true },
  { name: 'Frankfurt', file: 'Eintracht_Frankfurt_Logo.svg', commons: true },
  { name: 'Bremen', file: 'SV_Werder_Bremen_logo.svg', commons: true },
  { name: 'Brugge', file: 'Club_Brugge_KV_logo.svg', commons: false },
  { name: 'Anderlecht', file: 'RSC_Anderlecht_logo.svg', commons: false },
  { name: 'Celtic', file: 'Celtic_FC_logo.svg', commons: false },
  { name: 'Rangers', file: 'Rangers_FC_logo.svg', commons: false },
  { name: 'Olympiacos', file: 'Olympiacos_FC_logo.svg', commons: false }
];

async function checkUrl(urlStr) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(urlStr);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: { 'User-Agent': 'ClassicoAppLogoDownloader/1.1' }
    };
    https.get(options, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function run() {
  for (const c of candidates) {
    let ok = false;
    if (await checkUrl(getWikiUrl(c.file, false))) { c.commons = false; ok = true; }
    else if (await checkUrl(getWikiUrl(c.file, true))) { c.commons = true; ok = true; }
    if (ok) console.log(`VALID: { name: '${c.name}', file: '${c.file}', commons: ${c.commons} }`);
    else console.log(`INVALID: ${c.name}`);
  }
}
run();

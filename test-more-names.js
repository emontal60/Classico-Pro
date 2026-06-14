const https = require('https');
const crypto = require('crypto');

function getWikiUrl(filename, isCommons = false) {
  const name = filename.replace(/ /g, '_');
  const hash = crypto.createHash('md5').update(name).digest('hex');
  const a = hash[0];
  const ab = hash.slice(0, 2);
  const encodedName = encodeURIComponent(name)
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%27/g, "'");
  const domain = isCommons ? 'commons' : 'en';
  return `https://upload.wikimedia.org/wikipedia/${domain}/${a}/${ab}/${encodedName}`;
}

async function checkUrl(urlStr) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(urlStr);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
          'User-Agent': 'ClassicoAppLogoDownloader/1.1 (ayman@classicoapp.com)'
        }
      };
      https.get(options, (res) => {
        resolve(res.statusCode === 200);
      }).on('error', () => resolve(false));
    } catch (e) {
      resolve(false);
    }
  });
}

const tests = {
  Morocco: [
    'Morocco national football team badge.svg',
    'Morocco national football team crest.svg',
    'Morocco national football team logo.svg',
    'Morocco FA logo.svg',
    'Fédération Royale Marocaine de Football logo.svg'
  ],
  Netherlands: [
    'KNVB logo.svg',
    'Netherlands national football team crest.svg',
    'Logo KNVB.svg',
    'KNVB.svg',
    'Royal Dutch Football Association logo.svg'
  ],
  Uruguay: [
    'Asociación Uruguaya de Fútbol logo.svg',
    'Uruguayan Football Association logo.svg',
    'Uruguay national football team crest.svg',
    'Uruguay national football team badge.svg',
    'AUF logo.svg'
  ],
  Algeria: [
    'Algeria national football team badge.svg',
    'Algerian Football Federation logo.svg',
    'FAF logo.svg',
    'Algerian Football Federation.svg',
    'Algeria football crest.svg'
  ],
  Cameroon: [
    'Cameroonian Football Federation logo.svg',
    'FECAFOOT logo.svg',
    'Cameroon national football team badge.svg',
    'FECAFOOT.svg',
    'Fédération Camerounaise de Football logo.svg'
  ],
  Esperance: [
    'Espérance Sportive de Tunis logo.svg',
    'Esperance Sportive de Tunis logo.svg',
    'Esperance Sportive de Tunis.svg',
    'Espérance de Tunis logo.svg'
  ],
  AlAin: [
    'Al Ain FC crest.svg',
    'Al Ain FC logo.svg',
    'Al Ain Club logo.svg',
    'Al Ain FC.svg'
  ],
  PyramidsFC: [
    'Pyramids FC.svg',
    'Pyramids FC logo.svg',
    'Pyramids Club logo.svg'
  ],
  Raja: [
    'Raja Club Athletic.svg',
    'Raja CA logo.svg',
    'Raja Club Athletic logo.svg',
    'Raja Casablanca logo.svg'
  ]
};

async function run() {
  for (const [team, files] of Object.entries(tests)) {
    console.log(`\n--- testing ${team} ---`);
    for (const file of files) {
      for (const isCommons of [false, true]) {
        const url = getWikiUrl(file, isCommons);
        if (await checkUrl(url)) {
          console.log(`  MATCH: { file: '${file}', commons: ${isCommons} }`);
        }
      }
    }
  }
}

run();

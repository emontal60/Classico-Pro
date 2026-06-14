const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const path = require('path');

const TEAMS_TO_SEARCH = [
  { idx: 9, name: 'Inter Milan', queries: ['FC Internazionale Milano 2021 logo', 'Inter Milan logo', 'Inter Milan crest'] },
  { idx: 10, name: 'Juventus', queries: ['Juventus FC logo', 'Juventus logo', 'Juventus FC crest'] },
  { idx: 13, name: 'Atletico Madrid', queries: ['Atletico Madrid 2017 logo', 'Atletico Madrid crest'] },
  { idx: 15, name: 'Lazio', queries: ['SS Lazio logo', 'Lazio crest', 'S.S. Lazio logo'] },
  { idx: 22, name: 'Al Ittihad', queries: ['Al-Ittihad Saudi Club logo', 'Al Ittihad Club Jeddah logo', 'Al Ittihad logo'] },
  { idx: 23, name: 'Al Ain', queries: ['Al Ain FC logo', 'Al Ain Club logo', 'Al Ain FC crest'] },
  { idx: 24, name: 'Pyramids FC', queries: ['Pyramids FC logo', 'Pyramids Club logo', 'Pyramids FC crest'] },
  { idx: 25, name: 'Al Ahli Saudi', queries: ['Al-Ahli Saudi FC logo', 'Al Ahli Saudi Club logo', 'Al Ahli Jeddah logo'] },
  { idx: 26, name: 'Al Shabab', queries: ['Al Shabab Saudi Club Logo', 'Al Shabab Saudi logo', 'Al Shabab FC Riyadh'] },
  { idx: 27, name: 'Wydad', queries: ['Wydad Athletic Club logo', 'Wydad AC logo', 'Wydad Athletic Club'] },
  { idx: 28, name: 'Raja', queries: ['Raja Club Athletic logo', 'Raja CA logo', 'Raja Casablanca logo'] },
  { idx: 29, name: 'Esperance', queries: ['Esperance Sportive de Tunis logo', 'Espérance Sportive de Tunis logo'] },
  { idx: 31, name: 'Morocco', queries: ['Morocco national football team badge', 'Morocco FA logo', 'Morocco football crest'] },
  { idx: 32, name: 'Saudi Arabia', queries: ['Saudi Arabia Football Federation logo', 'Saudi Arabia national football team crest'] },
  { idx: 34, name: 'Argentina', queries: ['Asociacion del Futbol Argentino crest', 'Argentina national football team crest', 'AFA logo'] },
  { idx: 38, name: 'Italy', queries: ['FIGC logo 2023', 'Italy national football team badge', 'FIGC logo'] },
  { idx: 41, name: 'Netherlands', queries: ['Netherlands national football team crest', 'KNVB logo', 'Netherlands football badge'] },
  { idx: 42, name: 'Algeria', queries: ['Algerian Football Federation logo', 'Algeria national football team badge'] },
  { idx: 44, name: 'Sweden', queries: ['Swedish Football Association logo', 'Sweden national football team badge', 'SvFF logo'] },
  { idx: 45, name: 'Belgium', queries: ['Royal Belgian Football Association logo', 'Belgium national football team badge', 'RBFA logo'] },
  { idx: 46, name: 'Uruguay', queries: ['Uruguay national football team crest', 'Uruguay national football team badge', 'AUF logo'] },
  { idx: 50, name: 'Senegal', queries: ['Senegal Football Federation logo', 'Senegal national football team badge'] },
  { idx: 51, name: 'Cameroon', queries: ['Cameroonian Football Federation logo', 'Cameroon national football team badge'] }
];

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
          'User-Agent': 'ClassicoAppLogoDownloader/1.1 (ayman@classicoapp.com; Classico Sports App Crest Retrieval)'
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

async function searchApi(query, isCommons = false) {
  return new Promise((resolve) => {
    const domain = isCommons ? 'commons.wikimedia.org' : 'en.wikipedia.org';
    const url = `https://${domain}/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=10&srsearch=${encodeURIComponent(query)}`;
    const options = {
      headers: {
        'User-Agent': 'ClassicoAppLogoDownloader/1.1 (ayman@classicoapp.com)'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const results = parsed.query?.search || [];
          resolve(results.map(r => r.title.replace(/^File:/i, '')));
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function run() {
  console.log('Searching Wikipedia and Commons APIs for working team SVGs...');
  
  const resultsMap = {};

  for (const team of TEAMS_TO_SEARCH) {
    console.log(`\n--- Team [${team.idx}]: ${team.name} ---`);
    let found = false;
    
    // Combine unique file suggestions from searching queries on both en and commons
    const candidateFiles = new Set();
    
    for (const q of team.queries) {
      const enRes = await searchApi(q, false);
      const comRes = await searchApi(q, true);
      enRes.concat(comRes).forEach(f => {
        if (f.toLowerCase().endsWith('.svg')) {
          candidateFiles.add(f);
        }
      });
    }

    // Add some common guesses manually if not present
    const cleanName = team.name.replace(/ /g, '_');
    candidateFiles.add(`${cleanName}_logo.svg`);
    candidateFiles.add(`${cleanName}_crest.svg`);
    candidateFiles.add(`${cleanName}.svg`);

    console.log(`Testing ${candidateFiles.size} candidate SVG filenames...`);
    
    for (const file of candidateFiles) {
      // Test Wikipedia (en)
      const urlEn = getWikiUrl(file, false);
      if (await checkUrl(urlEn)) {
        console.log(`  MATCH (EN): { name: '${team.name}', file: '${file}', commons: false }`);
        resultsMap[team.idx] = { name: team.name, file, commons: false, url: urlEn };
        found = true;
        break;
      }
      
      // Test Commons
      const urlCom = getWikiUrl(file, true);
      if (await checkUrl(urlCom)) {
        console.log(`  MATCH (COMMONS): { name: '${team.name}', file: '${file}', commons: true }`);
        resultsMap[team.idx] = { name: team.name, file, commons: true, url: urlCom };
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.log(`  NO MATCH FOUND for ${team.name}`);
    }
  }

  console.log('\n=====================================');
  console.log('SUMMARY OF MATCHED TEAM SVGs:');
  console.log(JSON.stringify(resultsMap, null, 2));
}

run().catch(console.error);

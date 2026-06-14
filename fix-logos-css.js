const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, 'classico-v3/src/views/Tournaments/TournamentsView.vue'),
  path.join(__dirname, 'classico-v3/src/views/Tournaments/PublicRegister.vue')
];

for (const file of filesToFix) {
  let content = fs.readFileSync(file, 'utf8');

  // Remove border-radius: 50%, border, overflow: hidden from inline styles
  content = content.replace(/border-radius:\s*50%;?/g, '');
  content = content.replace(/overflow:\s*hidden;?/g, '');
  
  // Increase sizes in inline styles
  content = content.replace(/width:\s*20px;\s*height:\s*20px;/g, 'width: 32px; height: 32px;');
  content = content.replace(/width:\s*16px;\s*height:\s*16px;/g, 'width: 26px; height: 26px;');
  content = content.replace(/width:\s*18px;\s*height:\s*18px;/g, 'width: 28px; height: 28px;');
  content = content.replace(/width:\s*26px;\s*height:\s*26px;/g, 'width: 38px; height: 38px;');
  content = content.replace(/width:\s*28px;\s*height:\s*28px;/g, 'width: 40px; height: 40px;');
  content = content.replace(/width:\s*32px;\s*height:\s*32px;/g, 'width: 45px; height: 45px;');
  content = content.replace(/width:\s*36px;\s*height:\s*36px;/g, 'width: 50px; height: 50px;');
  content = content.replace(/width:\s*45px;\s*height:\s*45px;/g, 'width: 60px; height: 60px;');
  content = content.replace(/width:\s*50px;\s*height:\s*50px;/g, 'width: 70px; height: 70px;');

  // Now fix `getLogoStyle` inside the scripts
  content = content.replace(/background:\s*'rgba\(11,\s*19,\s*38,\s*0\.88\)',\s*border:\s*`2px solid \$\{borderColor\}`,/g, "background: 'transparent',");
  // Also we want to keep the drop shadow but on the image itself, so we can replace boxShadow with filter
  content = content.replace(/boxShadow:\s*`0 0 10px \$\{glowColor\}`/g, "filter: `drop-shadow(0 4px 6px ${glowColor})`");

  // Fix `.player-logo-large` css
  content = content.replace(/border-radius:\s*50%;\s*display:\s*flex;\s*align-items:\s*center;\s*justify-content:\s*center;\s*font-size:\s*2\.3rem;\s*border:\s*2px solid rgba\(255,255,255,0\.1\);/g, 'display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 2.3rem;');

  // Fix `.player-logo-mini` css
  content = content.replace(/\.player-logo-mini\s*\{\s*width:\s*20px;\s*height:\s*20px;\s*border-radius:\s*50%;/g, '.player-logo-mini {\n  width: 32px;\n  height: 32px;');

  // Remove `border-radius: 50%` from any other CSS blocks that have `.logo-`
  // Actually, just writing over the changes will be enough.
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}

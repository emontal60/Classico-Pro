const fs = require('fs');

function cleanLogos(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove border-radius: 50% and padding/borders from logo span styles
  content = content.replace(/border-radius:\s*50%;?/g, '');
  content = content.replace(/padding:\s*\d+px;?/g, '');
  content = content.replace(/overflow:\s*hidden;?/g, '');
  
  // Update getLogoStyle implementation
  const newLogoStyle = `
const getLogoStyle = (idx) => {
  const gIdx = (idx || 0) % 12;
  const glowColor = GLOWS[gIdx] || 'rgba(0, 242, 254, 0.4)';
  return {
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: \`drop-shadow(0 4px 6px \${glowColor})\`
  };
};`;
  
  // Replace getLogoStyle function completely
  content = content.replace(/const getLogoStyle = \(idx\) => \{[\s\S]*?\n\};/, newLogoStyle.trim());
  
  fs.writeFileSync(filePath, content);
}

cleanLogos('src/views/Tournaments/TournamentsView.vue');
cleanLogos('src/views/Tournaments/PublicRegister.vue');
console.log('Logo styling fixed!');

const fs = require('fs');

function safeReplace(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace .png with .svg for logos safely
  content = content.replace(/\/logos\/logo_' \+ ([\w.]+) \+ '\.png'/g, '/logos/logo_\' + $1 + \'.svg\'');
  content = content.replace(/\/logos\/logo_\$\{([^}]+)\}\.png/g, '/logos/logo_${$1}.svg');
  
  // Clean inline styles specifically for logo elements
  content = content.replace(/style="[^"]*border-radius:\s*50%;[^"]*"/g, (match) => {
    return match.replace(/border-radius:\s*50%;/g, '').replace(/padding:\s*\d+px;/g, '').replace(/overflow:\s*hidden;/g, '');
  });
  
  // Replace getLogoStyle function completely
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
  content = content.replace(/const getLogoStyle = \(idx\) => \{[\s\S]*?\n\};/, newLogoStyle.trim());
  
  fs.writeFileSync(filePath, content);
}

safeReplace('src/views/Tournaments/TournamentsView.vue');
safeReplace('src/views/Tournaments/PublicRegister.vue');

// Fix persistence
let tv = fs.readFileSync('src/views/Tournaments/TournamentsView.vue', 'utf8');
tv = tv.replace('store.activeTournamentId = savedTourId;', 'selectedTournamentId.value = savedTourId;\n    showCreateForm.value = false;');

// Remove back button
tv = tv.replace(
  '<button @click="$router.back()" title="إغلاق والعودة" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 1rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background=\'#ef4444\'; this.style.color=\'#fff\'" onmouseout="this.style.background=\'rgba(239, 68, 68, 0.15)\'; this.style.color=\'#ef4444\'">✖</button>', 
  ''
);

fs.writeFileSync('src/views/Tournaments/TournamentsView.vue', tv);
console.log('Fixed gracefully!');

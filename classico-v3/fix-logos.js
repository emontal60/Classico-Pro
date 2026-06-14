const fs = require('fs');

function replacePngWithSvg(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\/logos\/logo_' \+ ([\w.]+) \+ '\.png'/g, '/logos/logo_\' + $1 + \'.svg\'');
  content = content.replace(/\/logos\/logo_\$\{([^}]+)\}\.png/g, '/logos/logo_${$1}.svg');
  fs.writeFileSync(filePath, content);
}

replacePngWithSvg('src/views/Tournaments/TournamentsView.vue');
replacePngWithSvg('src/views/Tournaments/PublicRegister.vue');
console.log('Done!');

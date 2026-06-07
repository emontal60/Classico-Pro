const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'classico-v3', 'dist');
const destDir = __dirname;

if (!fs.existsSync(srcDir)) {
  console.error(`Source directory ${srcDir} does not exist. Run build first.`);
  process.exit(1);
}

// 1. Clean old assets folder in root
const destAssetsDir = path.join(destDir, 'assets');
if (fs.existsSync(destAssetsDir)) {
  console.log('Cleaning old assets directory in root...');
  fs.rmSync(destAssetsDir, { recursive: true, force: true });
}

// Helper function to copy recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 2. Copy all files/folders from classico-v3/dist to root
console.log(`Copying build from ${srcDir} to ${destDir}...`);
const items = fs.readdirSync(srcDir);
for (const item of items) {
  const srcPath = path.join(srcDir, item);
  const destPath = path.join(destDir, item);
  
  if (fs.statSync(srcPath).isDirectory()) {
    copyDirSync(srcPath, destPath);
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
}

console.log('Build copied to root successfully!');

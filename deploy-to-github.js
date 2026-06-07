const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'classico-v3', 'dist');

try {
  // 1. Build the Vue application
  console.log('Building Vue application...');
  execSync('npm run build --prefix classico-v3', { stdio: 'inherit' });
} catch (err) {
  console.error('Build failed:', err.message);
  process.exit(1);
}

let stashed = false;
try {
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    console.log('Stashing local changes...');
    execSync('git stash', { stdio: 'inherit' });
    stashed = true;
  }

  // 2. Checkout master branch
  console.log('Checking out master branch...');
  execSync('git checkout master', { stdio: 'inherit' });

  // 3. Clean old deployed files from master branch using git rm
  console.log('Cleaning old master build files...');
  
  // Helper to run command ignoring errors if files don't exist
  const runGitRm = (target) => {
    try {
      execSync(`git rm -rf ${target}`, { stdio: 'ignore' });
    } catch (e) {}
  };
  
  runGitRm('assets');
  runGitRm('index.html');
  runGitRm('manifest.json');
  runGitRm('favicon.svg');
  runGitRm('icons.svg');
  runGitRm('logo1.png');
  runGitRm('app-icon.png');

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

  // 4. Copy new build files from classico-v3/dist directly to master root
  console.log('Copying new build files to master root...');
  if (fs.existsSync(distDir)) {
    const items = fs.readdirSync(distDir);
    for (const item of items) {
      const srcPath = path.join(distDir, item);
      const destPath = path.join(__dirname, item);
      if (fs.statSync(srcPath).isDirectory()) {
        copyDirSync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // 5. Stage only the build files and push to master
  console.log('Committing and pushing to master...');
  execSync('git add index.html manifest.json favicon.svg icons.svg logo1.png app-icon.png assets/', { stdio: 'inherit' });
  execSync('git commit -m "Deploy: update public registration page with latest changes"', { stdio: 'inherit' });
  execSync('git push origin master', { stdio: 'inherit' });

  console.log('Deployment to master branch successful!');
} catch (err) {
  console.error('Error during deployment:', err.message);
} finally {
  // 6. Go back to main branch and restore stash
  console.log('Returning to main branch...');
  try {
    execSync('git checkout main', { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to checkout main branch, trying force...', e.message);
    execSync('git checkout -f main', { stdio: 'inherit' });
  }
  
  if (stashed) {
    console.log('Restoring local changes...');
    execSync('git stash pop', { stdio: 'inherit' });
  }
}

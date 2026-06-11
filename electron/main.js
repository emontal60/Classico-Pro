const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { fork } = require('child_process');

// Disable Hardware Acceleration to completely resolve mouse lag/sluggishness in packaged production environments on Windows
app.disableHardwareAcceleration();

let mainWindow;
let serverProcess;

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function startServer() {
  // Start the Express server (server.js) as a child process
  const serverPath = path.join(__dirname, '../server.js');
  const userDataPath = app.getPath('userData');
  
  // Use AppData only when packaged (Production)
  const dataPath = app.isPackaged ? userDataPath : path.join(__dirname, '..');

  serverProcess = fork(serverPath, [], {
    env: { 
      ...process.env, 
      ELECTRON_RUN_AS_NODE: '1',
      CLASSICO_DATA_PATH: dataPath
    }
  });

  serverProcess.on('message', (msg) => {
    console.log('Server message:', msg);
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    frame: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: 'rgba(0, 0, 0, 0)',
      symbolColor: '#ffffff',
      height: 35
    },
    backgroundColor: '#000000',
    show: false,
    icon: path.resolve(__dirname, '..', 'classico-v3', 'public', 'app-icon.png'), // Permanent icon in public folder
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Open external links in the default system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Hide the default menu bar (File, Edit, etc.) to keep the title bar clean
  mainWindow.setMenuBarVisibility(false);


  // Clear browser/HTTP cache to ensure the latest version is loaded on startup
  mainWindow.webContents.session.clearCache().then(() => {
    console.log('[System] WebContents session cache cleared successfully');
  }).catch(err => {
    console.error('[System] Failed to clear session cache:', err);
  });

  // In development, load from localhost. In production, we could load built files.
  // But since we rely on the local server.js, we always load from localhost:3000
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[System] Page loaded, checking for updates...');
    autoUpdater.checkForUpdates().catch(err => console.error('Update check failed:', err));

    // Check for updates periodically every 15 minutes
    if (!global.updateCheckInterval) {
      global.updateCheckInterval = setInterval(() => {
        console.log('[System] Periodic check for updates...');
        autoUpdater.checkForUpdates().catch(err => console.error('Periodic update check failed:', err));
      }, 15 * 60 * 1000); // 15 minutes
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize(); 
    mainWindow.show();
    mainWindow.focus(); 
  });

  mainWindow.on('closed', () => {
    if (global.updateCheckInterval) {
      clearInterval(global.updateCheckInterval);
      global.updateCheckInterval = null;
    }
    mainWindow = null;
  });
}

app.whenReady().then(() => {
    startServer();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
} // End of single instance lock else block

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Auto-updater events
autoUpdater.on('update-available', (info) => {
  const version = info ? info.version : '';
  if (mainWindow) mainWindow.webContents.send('update_available', version);
});

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send('download_progress', progressObj.percent);
  }
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('exit_app', () => {
  app.quit();
});

// Handle theme change from renderer: update titleBarOverlay symbol color
ipcMain.on('theme-changed', (event, theme) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setTitleBarOverlay({
      color: 'rgba(0, 0, 0, 0)',
      symbolColor: theme === 'light' ? '#0f172a' : '#ffffff',
      height: 35
    });
  }
});

ipcMain.on('print-html', (event, html) => {
  let printWin = new BrowserWindow({ 
    show: false, 
    webPreferences: { nodeIntegration: false } 
  });
  printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  printWin.webContents.on('did-finish-load', () => {
    printWin.webContents.print({ 
      silent: false, 
      printBackground: true,
      deviceName: '' // Default printer
    });
    // Wait for the dialog to finish before closing the hidden window
    setTimeout(() => { if (!printWin.isDestroyed()) printWin.close(); }, 30000);
  });
});

// IPC Handler to select backup file natively with defaultPath set to Downloads folder
ipcMain.handle('select-backup-file', async () => {
  const { dialog } = require('electron');
  const downloadsPath = app.getPath('downloads');

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'استعادة نسخة احتياطية',
    defaultPath: downloadsPath,
    filters: [
      { name: 'Backup Files', extensions: ['json'] }
    ],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return { success: true, filePath, content: fileContent };
  }
  return { success: false };
});

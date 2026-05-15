const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

function startServer() {
  // Start the Express server (server.js) as a child process
  const serverPath = path.join(__dirname, '../server.js');
  serverProcess = fork(serverPath, [], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
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

  // Hide the default menu bar (File, Edit, etc.) to keep the title bar clean
  mainWindow.setMenuBarVisibility(false);

  // In development, load from localhost. In production, we could load built files.
  // But since we rely on the local server.js, we always load from localhost:3000
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize(); // Open the window maximized
    mainWindow.show();
    mainWindow.focus(); // Bring to front
    // Check for updates on startup
    autoUpdater.checkForUpdatesAndNotify();
  });

  mainWindow.on('closed', () => {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) serverProcess.kill();
    app.quit();
  }
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  if (mainWindow) mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

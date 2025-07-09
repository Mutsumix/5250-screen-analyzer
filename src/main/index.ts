import { app, BrowserWindow, ipcMain, desktopCapturer } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { AppSettings } from '../shared/types';

const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

const store = new Store<{ settings: AppSettings }>({
  defaults: {
    settings: {
      captureInterval: 2000,
      ocrLanguage: 'eng+jpn',
    },
  },
});

let mainWindow: BrowserWindow | null = null;
let captureInterval: NodeJS.Timeout | null = null;

function createWindow() {
  console.log('Creating window...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready
  });

  console.log('Window created, loading content...');

  if (isDev) {
    console.log('Loading dev server...');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading production file...');
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow?.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('App ready, creating window...');
  createWindow();

  app.on('activate', () => {
    console.log('App activated');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Starting Electron app...');

// IPC Handlers
ipcMain.handle('settings:get', () => {
  return store.get('settings');
});

ipcMain.on('settings:update', (_, settings: Partial<AppSettings>) => {
  const currentSettings = store.get('settings');
  const newSettings = { ...currentSettings, ...settings };
  store.set('settings', newSettings);
});

ipcMain.on('capture:start', () => {
  startCapture();
});

ipcMain.on('capture:stop', () => {
  stopCapture();
});

ipcMain.on('capture:manual', () => {
  captureScreen();
});

async function startCapture() {
  const settings = store.get('settings');
  if (captureInterval) {
    clearInterval(captureInterval);
  }

  mainWindow?.webContents.send('status:update', 'capturing');
  
  captureInterval = setInterval(() => {
    captureScreen();
  }, settings.captureInterval);
}

function stopCapture() {
  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
  }
  mainWindow?.webContents.send('status:update', 'idle');
}

async function captureScreen() {
  try {
    const settings = store.get('settings');
    const captureArea = settings.captureArea;

    if (!captureArea) {
      mainWindow?.webContents.send('error:occurred', {
        message: 'Capture area not configured',
      });
      return;
    }

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: captureArea.width,
        height: captureArea.height,
      },
    });

    if (sources.length > 0) {
      const screenCapture = {
        id: Date.now().toString(),
        timestamp: new Date(),
        imageData: sources[0].thumbnail.toDataURL(),
      };

      mainWindow?.webContents.send('capture:result', screenCapture);
      mainWindow?.webContents.send('status:update', 'processing');
    }
  } catch (error) {
    mainWindow?.webContents.send('error:occurred', {
      message: 'Failed to capture screen',
      details: error,
    });
  }
}
import { app, BrowserWindow, ipcMain, desktopCapturer, systemPreferences, screen } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { AppSettings } from '../shared/types';

const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

const store = new Store<{ settings: AppSettings }>({
  defaults: {
    settings: {
      ocrLanguage: 'eng+jpn',
      captureArea: {
        x: 100,
        y: 100,
        width: 800,
        height: 600,
      },
    },
  },
});

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  console.log('Creating window...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,  // 最小幅：5250ターミナル用に十分なスペース
    minHeight: 700,  // 最小高：ヘッダー、コントロールバー、ガイド枠を含む
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready
    frame: true, // フレームは残す（操作のため）
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

  // ウィンドウ移動時にキャプチャエリアを更新
  mainWindow.on('moved', () => {
    console.log('Window moved');
    mainWindow?.webContents.send('window:moved');
  });

  mainWindow.on('resized', () => {
    console.log('Window resized');
    mainWindow?.webContents.send('window:resized');
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
  console.log('Received settings update:', settings);
  const currentSettings = store.get('settings');
  console.log('Current settings:', currentSettings);
  const newSettings = { ...currentSettings, ...settings };
  console.log('New settings to save:', newSettings);
  store.set('settings', newSettings);
  console.log('Settings saved successfully');
  
  // Verify the settings were saved
  const savedSettings = store.get('settings');
  console.log('Verified saved settings:', savedSettings);
});

ipcMain.on('capture:manual', () => {
  captureScreen();
});

ipcMain.handle('window:getBounds', () => {
  if (mainWindow) {
    return mainWindow.getBounds();
  }
  return { x: 0, y: 0, width: 1200, height: 800 };
});

ipcMain.on('capture:updateArea', (_, captureArea) => {
  const currentSettings = store.get('settings');
  const newSettings = { ...currentSettings, captureArea };
  store.set('settings', newSettings);
  console.log('Capture area updated:', captureArea);
});


async function captureScreen() {
  let wasVisible = false;
  try {
    const settings = store.get('settings');
    const captureArea = settings.captureArea;

    if (!captureArea) {
      mainWindow?.webContents.send('error:occurred', {
        message: 'Capture area not configured',
      });
      return;
    }

    console.log('Capturing screen with area:', captureArea);

    // アプリを一時的に隠してキャプチャ（アプリ自体を除外）
    if (mainWindow && mainWindow.isVisible()) {
      wasVisible = true;
      mainWindow.hide();
      await new Promise(resolve => setTimeout(resolve, 50)); // 隠す処理の完了を待つ
    }

    // Get full screen first, then crop
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: 1920,
        height: 1080,
      },
    });

    if (sources.length > 0) {
      console.log(`Found ${sources.length} screen sources`);
      
      // Get the full screen image
      const fullScreenImage = sources[0].thumbnail;
      const screenSize = fullScreenImage.getSize();
      
      console.log(`Full screen size: ${screenSize.width}x${screenSize.height}`);
      console.log(`Capture area: ${captureArea.x}, ${captureArea.y}, ${captureArea.width}x${captureArea.height}`);
      
      // Calculate scale factor between screen resolution and thumbnail
      const primaryDisplay = screen.getPrimaryDisplay();
      const actualScreenSize = primaryDisplay.size;
      
      console.log(`Actual screen size: ${actualScreenSize.width}x${actualScreenSize.height}`);
      
      const scaleX = screenSize.width / actualScreenSize.width;
      const scaleY = screenSize.height / actualScreenSize.height;
      
      console.log(`Scale factors: X=${scaleX}, Y=${scaleY}`);
      
      // Calculate scaled crop area
      const scaledCropArea = {
        x: Math.max(0, Math.round(captureArea.x * scaleX)),
        y: Math.max(0, Math.round(captureArea.y * scaleY)),
        width: Math.min(Math.round(captureArea.width * scaleX), screenSize.width),
        height: Math.min(Math.round(captureArea.height * scaleY), screenSize.height),
      };
      
      console.log(`Scaled crop area: ${scaledCropArea.x}, ${scaledCropArea.y}, ${scaledCropArea.width}x${scaledCropArea.height}`);
      
      // Validate crop area
      if (scaledCropArea.width <= 0 || scaledCropArea.height <= 0) {
        console.error('Invalid crop area dimensions');
        throw new Error('Invalid crop area dimensions');
      }
      
      // Crop the image
      const croppedImage = fullScreenImage.crop(scaledCropArea);
      
      const screenCapture = {
        id: Date.now().toString(),
        timestamp: new Date(),
        imageData: croppedImage.toDataURL(),
      };

      console.log('Screen captured and cropped successfully');
      mainWindow?.webContents.send('capture:result', screenCapture);
      
      // Send status update for manual capture
      mainWindow?.webContents.send('status:update', 'idle');
    } else {
      throw new Error('No screen sources found');
    }
  } catch (error) {
    console.error('Screen capture failed:', error);
    mainWindow?.webContents.send('error:occurred', {
      message: 'Failed to capture screen',
      details: error,
    });
    mainWindow?.webContents.send('status:update', 'error');
  } finally {
    // アプリを再表示
    if (mainWindow && wasVisible) {
      mainWindow.show();
    }
  }
}
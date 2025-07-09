import { contextBridge, ipcRenderer } from 'electron';
import { AppSettings, ScreenCapture, AIResponse, AppStatus } from '../shared/types';

const electronAPI = {
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Partial<AppSettings>) => ipcRenderer.send('settings:update', settings),

  // Capture controls
  startCapture: () => ipcRenderer.send('capture:start'),
  stopCapture: () => ipcRenderer.send('capture:stop'),
  manualCapture: () => ipcRenderer.send('capture:manual'),

  // Event listeners
  onCaptureResult: (callback: (capture: ScreenCapture) => void) => {
    ipcRenderer.on('capture:result', (_, capture) => callback(capture));
  },
  onOcrResult: (callback: (result: { captureId: string; text: string }) => void) => {
    ipcRenderer.on('ocr:result', (_, result) => callback(result));
  },
  onAiResponse: (callback: (response: AIResponse) => void) => {
    ipcRenderer.on('ai:response', (_, response) => callback(response));
  },
  onStatusUpdate: (callback: (status: AppStatus) => void) => {
    ipcRenderer.on('status:update', (_, status) => callback(status));
  },
  onError: (callback: (error: { message: string; details?: any }) => void) => {
    ipcRenderer.on('error:occurred', (_, error) => callback(error));
  },

  // Cleanup
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('capture:result');
    ipcRenderer.removeAllListeners('ocr:result');
    ipcRenderer.removeAllListeners('ai:response');
    ipcRenderer.removeAllListeners('status:update');
    ipcRenderer.removeAllListeners('error:occurred');
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
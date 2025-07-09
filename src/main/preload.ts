import { contextBridge, ipcRenderer } from 'electron';
import { AppSettings, ScreenCapture, AIResponse, AppStatus } from '../shared/types';

const electronAPI = {
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Partial<AppSettings>) => ipcRenderer.send('settings:update', settings),

  // Capture controls
  manualCapture: () => ipcRenderer.send('capture:manual'),
  
  // Window management
  getWindowBounds: () => ipcRenderer.invoke('window:getBounds'),
  updateCaptureArea: (captureArea: { x: number; y: number; width: number; height: number }) => 
    ipcRenderer.send('capture:updateArea', captureArea),

  // Event listeners
  onCaptureResult: (callback: (capture: ScreenCapture) => void) => {
    const handler = (_: any, capture: ScreenCapture) => callback(capture);
    ipcRenderer.on('capture:result', handler);
    return () => ipcRenderer.removeListener('capture:result', handler);
  },
  onOcrResult: (callback: (result: { captureId: string; text: string }) => void) => {
    const handler = (_: any, result: { captureId: string; text: string }) => callback(result);
    ipcRenderer.on('ocr:result', handler);
    return () => ipcRenderer.removeListener('ocr:result', handler);
  },
  onAiResponse: (callback: (response: AIResponse) => void) => {
    const handler = (_: any, response: AIResponse) => callback(response);
    ipcRenderer.on('ai:response', handler);
    return () => ipcRenderer.removeListener('ai:response', handler);
  },
  onStatusUpdate: (callback: (status: AppStatus) => void) => {
    const handler = (_: any, status: AppStatus) => callback(status);
    ipcRenderer.on('status:update', handler);
    return () => ipcRenderer.removeListener('status:update', handler);
  },
  onError: (callback: (error: { message: string; details?: any }) => void) => {
    const handler = (_: any, error: { message: string; details?: any }) => callback(error);
    ipcRenderer.on('error:occurred', handler);
    return () => ipcRenderer.removeListener('error:occurred', handler);
  },
  onWindowMoved: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('window:moved', handler);
    return () => ipcRenderer.removeListener('window:moved', handler);
  },
  onWindowResized: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('window:resized', handler);
    return () => ipcRenderer.removeListener('window:resized', handler);
  },

  // Cleanup
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('capture:result');
    ipcRenderer.removeAllListeners('ocr:result');
    ipcRenderer.removeAllListeners('ai:response');
    ipcRenderer.removeAllListeners('status:update');
    ipcRenderer.removeAllListeners('error:occurred');
    ipcRenderer.removeAllListeners('window:moved');
    ipcRenderer.removeAllListeners('window:resized');
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
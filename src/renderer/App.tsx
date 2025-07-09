import { useEffect, useState } from 'react';
import { AppStatus, ScreenCapture, AIResponse, AppSettings } from '../shared/types';
import { useStore } from './stores/useStore';
import Header from './components/Header';
import TerminalPreview from './components/TerminalPreview';
import AssistantPanel from './components/AssistantPanel';
import ControlBar from './components/ControlBar';
import SettingsModal from './components/SettingsModal';
import CaptureGuide from './components/CaptureGuide';

// Mock electronAPI for development
const mockElectronAPI = {
  getSettings: () => Promise.resolve({ 
    ocrLanguage: 'eng+jpn',
    captureArea: {
      x: 100,
      y: 100,
      width: 800,
      height: 600,
    }
  }),
  updateSettings: (settings: any) => console.log('Update settings:', settings),
  manualCapture: () => console.log('Manual capture'),
  onCaptureResult: (callback: (capture: ScreenCapture) => void) => {
    console.log('Mock: onCaptureResult listener added');
    return () => console.log('Mock: onCaptureResult listener removed');
  },
  onOcrResult: (callback: (result: { captureId: string; text: string }) => void) => {
    console.log('Mock: onOcrResult listener added');
    return () => console.log('Mock: onOcrResult listener removed');
  },
  onAiResponse: (callback: (response: AIResponse) => void) => {
    console.log('Mock: onAiResponse listener added');
    return () => console.log('Mock: onAiResponse listener removed');
  },
  onStatusUpdate: (callback: (status: AppStatus) => void) => {
    console.log('Mock: onStatusUpdate listener added');
    return () => console.log('Mock: onStatusUpdate listener removed');
  },
  onError: (callback: (error: { message: string; details?: any }) => void) => {
    console.log('Mock: onError listener added');
    return () => console.log('Mock: onError listener removed');
  },
  removeAllListeners: () => console.log('Mock: removeAllListeners called'),
  getWindowBounds: () => Promise.resolve({ x: 100, y: 100, width: 1200, height: 800 }),
  updateCaptureArea: (captureArea: any) => console.log('Mock: updateCaptureArea called with:', captureArea),
  onWindowMoved: (callback: () => void) => {
    console.log('Mock: onWindowMoved listener added');
    return () => console.log('Mock: onWindowMoved listener removed');
  },
  onWindowResized: (callback: () => void) => {
    console.log('Mock: onWindowResized listener added');
    return () => console.log('Mock: onWindowResized listener removed');
  },
};

declare global {
  interface Window {
    electronAPI?: typeof mockElectronAPI;
  }
}

function App() {
  const { 
    status, 
    setStatus, 
    addCapture,
    updateCaptureOcr,
    addAiResponse,
    currentCapture,
    currentResponse
  } = useStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    ocrLanguage: 'eng+jpn',
    captureArea: {
      x: 100,
      y: 100,
      width: 800,
      height: 600,
    },
  });

  useEffect(() => {
    // Use mock API if electronAPI is not available
    const api = window.electronAPI || mockElectronAPI;
    
    // Set up event listeners and collect cleanup functions
    const cleanupFunctions: (() => void)[] = [];
    
    if (api.onCaptureResult) {
      const cleanup = api.onCaptureResult((capture) => {
        addCapture(capture);
      });
      if (cleanup) cleanupFunctions.push(cleanup);
    }

    if (api.onOcrResult) {
      const cleanup = api.onOcrResult((result) => {
        updateCaptureOcr(result.captureId, result.text);
      });
      if (cleanup) cleanupFunctions.push(cleanup);
    }

    if (api.onAiResponse) {
      const cleanup = api.onAiResponse((response) => {
        addAiResponse(response);
      });
      if (cleanup) cleanupFunctions.push(cleanup);
    }

    if (api.onStatusUpdate) {
      const cleanup = api.onStatusUpdate((newStatus) => {
        setStatus(newStatus);
      });
      if (cleanup) cleanupFunctions.push(cleanup);
    }

    if (api.onError) {
      const cleanup = api.onError((error) => {
        console.error('Error:', error);
        // TODO: Show error notification
      });
      if (cleanup) cleanupFunctions.push(cleanup);
    }

    // Load initial settings
    if (api.getSettings) {
      api.getSettings().then((loadedSettings) => {
        console.log('Settings loaded:', loadedSettings);
        setSettings(loadedSettings);
      }).catch((error) => {
        console.error('Failed to load settings:', error);
      });
    }

    return () => {
      // Clean up all listeners
      cleanupFunctions.forEach(cleanup => cleanup());
      if (api.removeAllListeners) {
        api.removeAllListeners();
      }
    };
  }, []);

  const handleManualCapture = () => {
    const api = window.electronAPI || mockElectronAPI;
    api.manualCapture();
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 p-4">
          {currentCapture ? (
            <TerminalPreview capture={currentCapture} />
          ) : (
            <CaptureGuide settings={settings} />
          )}
        </div>
        
        <div className="w-1/2 p-4 border-l border-gray-700">
          <AssistantPanel response={currentResponse} />
        </div>
      </div>
      
      <ControlBar
        onManualCapture={handleManualCapture}
        onOpenSettings={handleOpenSettings}
      />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
      />
    </div>
  );
}

export default App;
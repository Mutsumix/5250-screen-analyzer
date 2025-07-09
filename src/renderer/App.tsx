import { useEffect, useState } from 'react';
import { AppStatus, ScreenCapture, AIResponse } from '../shared/types';
import { useStore } from './stores/useStore';
import Header from './components/Header';
import TerminalPreview from './components/TerminalPreview';
import AssistantPanel from './components/AssistantPanel';
import ControlBar from './components/ControlBar';
import SettingsModal from './components/SettingsModal';

// Mock electronAPI for development
const mockElectronAPI = {
  getSettings: () => Promise.resolve({ 
    captureInterval: 2000, 
    ocrLanguage: 'eng+jpn',
    captureArea: {
      x: 100,
      y: 100,
      width: 800,
      height: 600,
    }
  }),
  updateSettings: (settings: any) => console.log('Update settings:', settings),
  startCapture: () => console.log('Start capture'),
  stopCapture: () => console.log('Stop capture'),
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

  const [isCapturing, setIsCapturing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        setIsCapturing(newStatus === 'capturing');
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
      api.getSettings().then((settings) => {
        console.log('Settings loaded:', settings);
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

  const handleStartCapture = () => {
    const api = window.electronAPI || mockElectronAPI;
    api.startCapture();
  };

  const handleStopCapture = () => {
    const api = window.electronAPI || mockElectronAPI;
    api.stopCapture();
  };

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
          <TerminalPreview capture={currentCapture} />
        </div>
        
        <div className="w-1/2 p-4 border-l border-gray-700">
          <AssistantPanel response={currentResponse} />
        </div>
      </div>
      
      <ControlBar
        status={status}
        isCapturing={isCapturing}
        onStart={handleStartCapture}
        onStop={handleStopCapture}
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
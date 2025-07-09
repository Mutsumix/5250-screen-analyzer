import { useEffect, useState } from 'react';
import { AppStatus, ScreenCapture, AIResponse } from '../shared/types';
import { useStore } from './stores/useStore';
import Header from './components/Header';
import TerminalPreview from './components/TerminalPreview';
import AssistantPanel from './components/AssistantPanel';
import ControlBar from './components/ControlBar';

// Mock electronAPI for development
const mockElectronAPI = {
  getSettings: () => Promise.resolve({ captureInterval: 2000, ocrLanguage: 'eng+jpn' }),
  updateSettings: (settings: any) => console.log('Update settings:', settings),
  startCapture: () => console.log('Start capture'),
  stopCapture: () => console.log('Stop capture'),
  manualCapture: () => console.log('Manual capture'),
  onCaptureResult: (callback: (capture: ScreenCapture) => void) => {},
  onOcrResult: (callback: (result: { captureId: string; text: string }) => void) => {},
  onAiResponse: (callback: (response: AIResponse) => void) => {},
  onStatusUpdate: (callback: (status: AppStatus) => void) => {},
  onError: (callback: (error: { message: string; details?: any }) => void) => {},
  removeAllListeners: () => {},
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

  useEffect(() => {
    // Use mock API if electronAPI is not available
    const api = window.electronAPI || mockElectronAPI;
    
    // Set up event listeners
    api.onCaptureResult((capture) => {
      addCapture(capture);
    });

    api.onOcrResult((result) => {
      updateCaptureOcr(result.captureId, result.text);
    });

    api.onAiResponse((response) => {
      addAiResponse(response);
    });

    api.onStatusUpdate((newStatus) => {
      setStatus(newStatus);
      setIsCapturing(newStatus === 'capturing');
    });

    api.onError((error) => {
      console.error('Error:', error);
      // TODO: Show error notification
    });

    // Load initial settings
    api.getSettings().then((settings) => {
      console.log('Settings loaded:', settings);
    });

    return () => {
      api.removeAllListeners();
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
      />
    </div>
  );
}

export default App;
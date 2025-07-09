import { useEffect, useState } from 'react';
import { AppStatus, ScreenCapture, AIResponse } from '../shared/types';
import { useStore } from './stores/useStore';
import Header from './components/Header';
import TerminalPreview from './components/TerminalPreview';
import AssistantPanel from './components/AssistantPanel';
import ControlBar from './components/ControlBar';

declare global {
  interface Window {
    electronAPI: {
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => void;
      startCapture: () => void;
      stopCapture: () => void;
      manualCapture: () => void;
      onCaptureResult: (callback: (capture: ScreenCapture) => void) => void;
      onOcrResult: (callback: (result: { captureId: string; text: string }) => void) => void;
      onAiResponse: (callback: (response: AIResponse) => void) => void;
      onStatusUpdate: (callback: (status: AppStatus) => void) => void;
      onError: (callback: (error: { message: string; details?: any }) => void) => void;
      removeAllListeners: () => void;
    };
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
    // Set up event listeners
    window.electronAPI.onCaptureResult((capture) => {
      addCapture(capture);
    });

    window.electronAPI.onOcrResult((result) => {
      updateCaptureOcr(result.captureId, result.text);
    });

    window.electronAPI.onAiResponse((response) => {
      addAiResponse(response);
    });

    window.electronAPI.onStatusUpdate((newStatus) => {
      setStatus(newStatus);
      setIsCapturing(newStatus === 'capturing');
    });

    window.electronAPI.onError((error) => {
      console.error('Error:', error);
      // TODO: Show error notification
    });

    // Load initial settings
    window.electronAPI.getSettings().then((settings) => {
      console.log('Settings loaded:', settings);
    });

    return () => {
      window.electronAPI.removeAllListeners();
    };
  }, []);

  const handleStartCapture = () => {
    window.electronAPI.startCapture();
  };

  const handleStopCapture = () => {
    window.electronAPI.stopCapture();
  };

  const handleManualCapture = () => {
    window.electronAPI.manualCapture();
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
import { useEffect, useState } from 'react';
import { AppStatus, ScreenCapture, AIResponse, AppSettings } from '../shared/types';
import { useStore } from './stores/useStore';
import Header from './components/Header';
import AssistantPanel from './components/AssistantPanel';
import ControlBar from './components/ControlBar';
import SettingsModal from './components/SettingsModal';
import CaptureGuide from './components/CaptureGuide';
import './styles/scrollbar.css';

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
  sendTextOnlyQuestion: (question: string) => console.log('Mock: Text-only question:', question),
  sendWithScreenQuestion: (question: string, captureId: string, imageData: string) => 
    console.log('Mock: With-screen question:', question, captureId),
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
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
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
        
        // If we have a pending question, send it with the captured screen
        if (currentQuestion && api.sendWithScreenQuestion) {
          api.sendWithScreenQuestion(currentQuestion, capture.id, capture.imageData);
          setCurrentQuestion(''); // Clear the question after sending
        }
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
        setIsProcessing(false); // Processing completed
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
        setIsProcessing(false); // Processing failed
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
  }, [currentQuestion, addCapture, updateCaptureOcr, addAiResponse, setStatus, setIsProcessing]);

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

  const handleTextOnlyQuestion = (question: string) => {
    console.log('Text-only question:', question);
    setIsProcessing(true); // Start processing
    const api = window.electronAPI || mockElectronAPI;
    api.sendTextOnlyQuestion(question);
  };

  const handleWithScreenQuestion = (question: string) => {
    console.log('With-screen question:', question);
    setIsProcessing(true); // Start processing
    const api = window.electronAPI || mockElectronAPI;
    
    // First capture the screen, then send question with the captured image
    // We'll store the question and send it when capture is received
    setCurrentQuestion(question);
    api.manualCapture();
  };

  return (
    <div className="h-screen flex flex-col text-white">
      <Header isProcessing={isProcessing} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Transparent with only borders/text having background */}
        <div className="w-1/2 relative">
          <div className="h-full">
            <div className="relative h-full p-4 pb-8">
              <CaptureGuide settings={settings} />
            </div>
          </div>
        </div>
        
        {/* Right Panel - AI Assistant */}
        <div className="w-1/2 relative p-2">
          <div className="h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 rounded-lg border-2 border-gray-500 shadow-2xl">
            <div className="absolute inset-0 rounded-lg border border-gray-400 shadow-inner"></div>
            <div className="relative h-full p-4 rounded-lg">
              <AssistantPanel 
                response={currentResponse} 
                onTextOnlyQuestion={handleTextOnlyQuestion}
                onWithScreenQuestion={handleWithScreenQuestion}
              />
            </div>
          </div>
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
import { ScreenCapture } from '../../shared/types';

interface TerminalPreviewProps {
  capture: ScreenCapture | null;
}

const TerminalPreview = ({ capture }: TerminalPreviewProps) => {
  return (
    <div className="relative h-full bg-black border-2 border-green-400 rounded-lg overflow-hidden">
      <div className="absolute inset-1 border border-green-300 rounded-sm"></div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2 border-b-2 border-green-400 relative">
        <div className="absolute inset-0 border-b border-green-300"></div>
        <h3 className="text-sm font-medium text-green-400 font-mono tracking-wide relative z-10" style={{ textShadow: '0 0 2px #00ff00' }}>
          ► TERMINAL PREVIEW
        </h3>
      </div>

      {/* Capture Content */}
      <div className="relative h-full bg-black">
        {capture ? (
          <>
            {/* Captured Image - center with no black bars */}
            <div className="absolute inset-4 flex items-center justify-center">
              <img 
                src={capture.imageData} 
                alt="Terminal capture" 
                className="max-w-full max-h-full object-contain border border-green-600 rounded"
                style={{ boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)' }}
              />
            </div>
            
            {/* OCR Text */}
            {capture.ocrText && (
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-95 rounded border border-green-600 p-2">
                <p className="text-xs text-green-400 font-mono" style={{ textShadow: '0 0 1px #00ff00' }}>
                  ► OCR: {capture.ocrText.substring(0, 150)}...
                </p>
              </div>
            )}

            {/* Capture Info */}
            <div className="absolute top-16 right-2 bg-black bg-opacity-95 rounded border border-green-600 p-2">
              <p className="text-xs text-green-600 font-mono">
                ► Captured: {new Date(capture.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </>
        ) : (
          /* Instructions when no capture - keep CaptureGuide visible */
          <div className="absolute inset-4 flex items-center justify-center">
            <div className="text-center text-green-600 font-mono">
              <div className="text-2xl mb-2" style={{ filter: 'drop-shadow(0 0 4px #00ff00)' }}>📷</div>
              <p className="text-sm">► No capture yet</p>
              <p className="text-xs mt-1">► Use "📷 WITH SCREEN" to capture</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalPreview;
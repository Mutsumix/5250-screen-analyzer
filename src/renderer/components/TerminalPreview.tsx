import { ScreenCapture } from '../../shared/types';

interface TerminalPreviewProps {
  capture: ScreenCapture | null;
}

const TerminalPreview = ({ capture }: TerminalPreviewProps) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-sm font-semibold mb-2 text-gray-400">Terminal Preview</h2>
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-gray-700">
        {capture ? (
          <div className="relative h-full">
            <img 
              src={capture.imageData} 
              alt="Terminal capture" 
              className="w-full h-full object-contain"
            />
            {capture.ocrText && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-2">
                <p className="text-xs text-terminal-green font-mono">
                  OCR: {capture.ocrText.substring(0, 100)}...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600">
            <p>No capture yet. Click "Start" to begin monitoring.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalPreview;
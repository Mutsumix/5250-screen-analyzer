import { AppStatus } from '../../shared/types';

interface ControlBarProps {
  status: AppStatus;
  isCapturing: boolean;
  onStart: () => void;
  onStop: () => void;
  onManualCapture: () => void;
  onOpenSettings: () => void;
}

const ControlBar = ({ status, isCapturing, onStart, onStop, onManualCapture, onOpenSettings }: ControlBarProps) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {!isCapturing ? (
          <button
            onClick={onStart}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center space-x-2 no-drag"
          >
            <span>▶</span>
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md flex items-center space-x-2 no-drag"
          >
            <span>⏸</span>
            <span>Pause</span>
          </button>
        )}
        
        <button
          onClick={onManualCapture}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md no-drag"
        >
          📷 Capture Now
        </button>
        
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md no-drag"
        >
          ⚙ Settings
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">Status:</span>
        <span className={`text-sm font-medium ${
          status === 'capturing' ? 'text-green-400' :
          status === 'processing' ? 'text-yellow-400' :
          status === 'error' ? 'text-red-400' :
          'text-gray-400'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default ControlBar;
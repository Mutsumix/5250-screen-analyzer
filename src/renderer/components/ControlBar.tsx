interface ControlBarProps {
  onManualCapture: () => void;
  onOpenSettings: () => void;
}

const ControlBar = ({ onManualCapture, onOpenSettings }: ControlBarProps) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onManualCapture}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md no-drag"
        >
          📷 Manual Capture
        </button>
        
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md no-drag"
        >
          ⚙ Settings
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">Ready for questions</span>
      </div>
    </div>
  );
};

export default ControlBar;
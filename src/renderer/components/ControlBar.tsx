interface ControlBarProps {
  onManualCapture: () => void;
  onOpenSettings: () => void;
}

const ControlBar = ({ onManualCapture, onOpenSettings }: ControlBarProps) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-t-2 border-gray-500 p-4 flex items-center justify-between relative">
      <div className="absolute inset-0 border-t border-gray-400 shadow-inner"></div>
      <div className="flex items-center space-x-4 relative z-10">
        <button
          onClick={onManualCapture}
          className="px-4 py-2 bg-gradient-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded border-2 border-blue-500 hover:border-blue-400 no-drag text-green-400 font-mono text-sm tracking-wide shadow-lg transition-all"
          style={{ textShadow: '0 0 2px #00ff00' }}
        >
          📷 MANUAL CAPTURE
        </button>
        
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 rounded border-2 border-gray-500 hover:border-gray-400 no-drag text-green-400 font-mono text-sm tracking-wide shadow-lg transition-all"
          style={{ textShadow: '0 0 2px #00ff00' }}
        >
          ⚙ SETTINGS
        </button>
      </div>
      
      <div className="flex items-center space-x-2 relative z-10">
        <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
        <span className="text-sm text-green-400 font-mono tracking-wide" style={{ textShadow: '0 0 2px #00ff00' }}>
          ► READY FOR QUESTIONS
        </span>
      </div>
    </div>
  );
};

export default ControlBar;
interface HeaderProps {
  isProcessing?: boolean;
}

const Header = ({ isProcessing = false }: HeaderProps) => {
  return (
    <header className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-b-2 border-gray-500 h-12 flex items-center px-4 draggable relative">
      <div className="absolute inset-0 border-b border-gray-400 shadow-inner"></div>
      <h1 className="text-lg font-semibold text-green-400 font-mono tracking-wider relative z-10" style={{ textShadow: '0 0 4px #00ff00' }}>
        ► SCREEN FRIEND - RPG LEARNING ASSISTANT
      </h1>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        {isProcessing ? (
          <>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ boxShadow: '0 0 4px #fbbf24' }}></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ boxShadow: '0 0 4px #fbbf24', animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ boxShadow: '0 0 4px #fbbf24', animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-xs text-yellow-400 font-mono" style={{ textShadow: '0 0 2px #fbbf24' }}>
              PROCESSING...
            </span>
          </>
        ) : (
          <>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
              <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
              <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
            </div>
            <span className="text-xs text-green-400 font-mono" style={{ textShadow: '0 0 2px #00ff00' }}>
              READY
            </span>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
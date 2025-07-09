const Header = () => {
  return (
    <header className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-b-2 border-gray-500 h-12 flex items-center px-4 draggable relative">
      <div className="absolute inset-0 border-b border-gray-400 shadow-inner"></div>
      <h1 className="text-lg font-semibold text-green-400 font-mono tracking-wider relative z-10" style={{ textShadow: '0 0 4px #00ff00' }}>
        ► SCREEN FRIEND - RPG LEARNING ASSISTANT
      </h1>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 4px #00ff00', animationDelay: '0.5s' }}></div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 4px #00ff00', animationDelay: '1s' }}></div>
      </div>
    </header>
  );
};

export default Header;
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AppSettings } from '../../shared/types';

interface CaptureGuideProps {
  settings: AppSettings;
}

const CaptureGuide = ({ settings }: CaptureGuideProps) => {
  const { captureArea } = settings;
  const frameRef = useRef<HTMLDivElement>(null);
  const [actualFrameArea, setActualFrameArea] = useState({ x: 0, y: 0, width: 800, height: 600 });

  const updateCaptureArea = async () => {
    const api = window.electronAPI;
    if (!api) return;
    
    // frameRef.currentがnullの場合は処理をスキップ
    if (!frameRef.current) {
      console.log('Frame ref not ready, skipping capture area update');
      return;
    }

    try {
      // ウィンドウの画面上での位置を取得
      const windowBounds = await api.getWindowBounds();
      
      // フレーム要素の位置とサイズを取得
      const frameRect = frameRef.current.getBoundingClientRect();
      
      // スクリーン座標を計算
      const screenX = windowBounds.x + frameRect.left;
      const screenY = windowBounds.y + frameRect.top;
      
      const newCaptureArea = {
        x: Math.round(screenX),
        y: Math.round(screenY),
        width: Math.round(frameRect.width),
        height: Math.round(frameRect.height),
      };
      
      setActualFrameArea(newCaptureArea);
      
      // キャプチャエリアを更新
      api.updateCaptureArea(newCaptureArea);
      
      console.log('Updated capture area:', newCaptureArea);
    } catch (error) {
      console.error('Failed to update capture area:', error);
    }
  };

  // DOM読み込み完了後に初期設定
  useLayoutEffect(() => {
    setTimeout(updateCaptureArea, 200);
  }, []);

  useEffect(() => {
    const api = window.electronAPI;

    // ウィンドウリサイズ時に更新
    const handleResize = () => {
      setTimeout(updateCaptureArea, 100); // 少し遅延して確実に更新
    };

    window.addEventListener('resize', handleResize);
    
    // ウィンドウ移動・リサイズ時に更新
    let cleanupWindowMoved: (() => void) | undefined;
    let cleanupWindowResized: (() => void) | undefined;
    
    if (api && api.onWindowMoved) {
      cleanupWindowMoved = api.onWindowMoved(updateCaptureArea);
    }
    if (api && api.onWindowResized) {
      cleanupWindowResized = api.onWindowResized(updateCaptureArea);
    }
    
    // 定期的に更新（フォールバック）
    const interval = setInterval(updateCaptureArea, 2000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      if (cleanupWindowMoved) cleanupWindowMoved();
      if (cleanupWindowResized) cleanupWindowResized();
    };
  }, []);

  // 5250ターミナルに適したサイズ（80カラム x 24行 + マージン）
  const frameWidth = 640;  // 典型的な5250ターミナル幅
  const frameHeight = 480; // 典型的な5250ターミナル高

  return (
    <div className="relative h-full bg-black border-2 border-green-400 rounded-lg overflow-hidden">
      <div className="absolute inset-1 border border-green-300 rounded-sm"></div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2 border-b-2 border-green-400 relative">
        <div className="absolute inset-0 border-b border-green-300"></div>
        <h3 className="text-sm font-medium text-green-400 font-mono tracking-wide relative z-10" style={{ textShadow: '0 0 2px #00ff00' }}>
          ► 5250 TERMINAL CAPTURE GUIDE
        </h3>
        <p className="text-xs text-green-600 mt-1 font-mono relative z-10">
          ► Position your 5250 terminal window to match this frame area
        </p>
      </div>

      {/* Capture Frame Container */}
      <div className="relative h-full p-4 bg-black">
        {/* Visual guide frame */}
        <div 
          ref={frameRef}
          className="border-2 border-dashed border-green-400 bg-green-900 bg-opacity-10 rounded-lg relative mx-auto"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
          }}
        >
          {/* Corner indicators */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-2 border-green-400 border-r-0 border-b-0 bg-black" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 border-2 border-green-400 border-l-0 border-b-0 bg-black" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-2 border-green-400 border-r-0 border-t-0 bg-black" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-2 border-green-400 border-l-0 border-t-0 bg-black" style={{ boxShadow: '0 0 4px #00ff00' }}></div>

          {/* Center guide */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-green-400">
              <div className="text-4xl mb-2" style={{ filter: 'drop-shadow(0 0 4px #00ff00)' }}>🖥️</div>
              <div className="text-sm font-medium font-mono tracking-wide" style={{ textShadow: '0 0 2px #00ff00' }}>
                ► 5250 TERMINAL WINDOW
              </div>
              <div className="text-xs mt-1 font-mono text-green-600">
                {frameWidth} × {frameHeight} pixels
              </div>
              <div className="text-xs text-green-500 mt-1 font-mono">
                Screen: ({actualFrameArea.x}, {actualFrameArea.y})
              </div>
            </div>
          </div>

          {/* Grid lines for alignment */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="retro-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00ff00" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#retro-grid)" />
          </svg>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className="bg-black bg-opacity-90 rounded-lg border border-green-600 p-3 text-xs text-green-400 font-mono">
            <div className="font-medium text-green-400 mb-2" style={{ textShadow: '0 0 2px #00ff00' }}>
              ► SETUP INSTRUCTIONS
            </div>
            <div className="text-green-600 space-y-1">
              <div>► 1. Note the position and size of the green frame</div>
              <div>► 2. Open your 5250 terminal emulator</div>
              <div>► 3. Position the terminal to overlap this frame area</div>
              <div>► 4. Use "📷 WITH SCREEN" to capture with questions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptureGuide;
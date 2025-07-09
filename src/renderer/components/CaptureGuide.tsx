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
    <div className="relative h-full bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
        <h3 className="text-sm font-medium text-gray-200">5250 Terminal Capture Guide</h3>
        <p className="text-xs text-gray-400 mt-1">
          Position your 5250 terminal window to match this frame area on your screen
        </p>
      </div>

      {/* Capture Frame Container */}
      <div className="relative h-full p-4 bg-gray-800">
        {/* Visual guide frame */}
        <div 
          ref={frameRef}
          className="border-2 border-dashed border-blue-400 bg-blue-900 bg-opacity-10 rounded-lg relative mx-auto"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
          }}
        >
          {/* Corner indicators */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-2 border-blue-400 border-r-0 border-b-0 bg-gray-800"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 border-2 border-blue-400 border-l-0 border-b-0 bg-gray-800"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-2 border-blue-400 border-r-0 border-t-0 bg-gray-800"></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-2 border-blue-400 border-l-0 border-t-0 bg-gray-800"></div>

          {/* Center guide */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-blue-300 opacity-60">
              <div className="text-4xl mb-2">🖥️</div>
              <div className="text-sm font-medium">5250 Terminal Window</div>
              <div className="text-xs mt-1">
                {frameWidth} × {frameHeight} pixels
              </div>
              <div className="text-xs text-blue-200 mt-1">
                Screen: ({actualFrameArea.x}, {actualFrameArea.y})
              </div>
            </div>
          </div>

          {/* Grid lines for alignment */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className="bg-gray-700 bg-opacity-90 rounded-lg p-3 text-xs text-gray-300">
            <div className="font-medium text-blue-300 mb-1">💡 Setup Instructions</div>
            <div>1. Note the position and size of the blue frame</div>
            <div>2. Open your 5250 terminal emulator</div>
            <div>3. Position the terminal to overlap this frame area</div>
            <div>4. Click "Start" to begin automated capture</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptureGuide;
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
  const frameWidth = 1200;  // 高解像度5250ターミナルの正しいサイズ
  const frameHeight = 900;

  return (
    <div className="relative h-full overflow-hidden">

      {/* Header */}
      <div className="bg-gray-800 bg-opacity-95 px-3 py-1 border-2 border-green-400 rounded-t-lg relative">
        <h3 className="text-sm font-medium text-green-400 font-mono tracking-wide relative z-10" style={{ textShadow: '0 0 2px #00ff00' }}>
          ► 5250 TERMINAL CAPTURE GUIDE
        </h3>
        <p className="text-xs text-green-600 mt-1 font-mono relative z-10">
          ► Position your 5250 terminal window to match this frame area
        </p>
      </div>

      {/* Capture Frame Container - transparent */}
      <div className="relative h-full p-1">
        {/* Visual guide frame - completely transparent inside */}
        <div
          ref={frameRef}
          className="border-2 border-dashed border-green-400 rounded-lg relative mx-auto"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
            background: 'transparent',
          }}
        >
          {/* Corner indicators - minimal */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-2 border-green-400 border-r-0 border-b-0 bg-black bg-opacity-80" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 border-2 border-green-400 border-l-0 border-b-0 bg-black bg-opacity-80" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-2 border-green-400 border-r-0 border-t-0 bg-black bg-opacity-80" style={{ boxShadow: '0 0 4px #00ff00' }}></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-2 border-green-400 border-l-0 border-t-0 bg-black bg-opacity-80" style={{ boxShadow: '0 0 4px #00ff00' }}></div>

          {/* Minimal center info */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-black bg-opacity-80 px-2 py-1 rounded border border-green-400">
            <div className="text-xs text-green-400 font-mono" style={{ textShadow: '0 0 2px #00ff00' }}>
              ► {frameWidth}×{frameHeight}
            </div>
          </div>

          {/* Grid lines for alignment - more transparent */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="retro-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00ff00" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#retro-grid)" />
          </svg>
        </div>

        {/* Instructions - positioned to avoid cutoff */}
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <div className="bg-gray-800 bg-opacity-95 rounded border border-green-600 p-2 text-xs text-green-400 font-mono">
            <div className="font-medium text-green-400 mb-1" style={{ textShadow: '0 0 2px #00ff00' }}>
              ► SETUP INSTRUCTIONS
            </div>
            <div className="text-green-600 space-y-0.5 text-left">
              <div>► 1. Note green frame position (1200×900)</div>
              <div>► 2. Open 5250 terminal emulator</div>
              <div>► 3. Position terminal to overlap frame</div>
              <div>► 4. Use "📷 WITH SCREEN" for questions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptureGuide;

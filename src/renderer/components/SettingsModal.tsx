import { useState, useEffect } from 'react';
import { AppSettings } from '../../shared/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [settings, setSettings] = useState<AppSettings>({
    ocrLanguage: 'eng+jpn',
    captureArea: {
      x: 100,
      y: 100,
      width: 800,
      height: 600,
    },
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Load current settings
      const api = window.electronAPI || (window as any).mockElectronAPI;
      if (api?.getSettings) {
        api.getSettings().then((loadedSettings: AppSettings) => {
          console.log('Loaded settings:', loadedSettings);
          // Ensure captureArea is present
          const settingsWithArea = {
            ...loadedSettings,
            captureArea: loadedSettings.captureArea || {
              x: 100,
              y: 100,
              width: 800,
              height: 600,
            }
          };
          setSettings(settingsWithArea);
          setIsLoading(false);
        }).catch((error: any) => {
          console.error('Failed to load settings:', error);
          setIsLoading(false);
        });
      } else {
        console.log('Using default settings');
        setIsLoading(false);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    console.log('Saving settings:', settings);
    const api = window.electronAPI || (window as any).mockElectronAPI;
    if (api?.updateSettings) {
      api.updateSettings(settings);
      console.log('Settings sent to Electron:', settings);
    } else {
      console.log('Mock: Settings would be saved:', settings);
    }
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 rounded-lg border-2 border-green-400 shadow-2xl w-96 max-w-md relative">
        <div className="absolute inset-0 rounded-lg border border-green-300 shadow-inner"></div>
        <div className="relative p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 4px #00ff00' }}>
            ► SYSTEM SETTINGS
          </h2>
          
          {/* Debug info */}
          <div className="mb-4 p-2 bg-black border border-green-600 rounded text-xs text-green-400 font-mono">
            <div>Debug: {JSON.stringify(settings, null, 2)}</div>
          </div>
          
          <div className="space-y-4">
            {/* OCR Language */}
            <div>
              <label className="block text-sm font-medium text-green-400 mb-1 font-mono tracking-wide">
                ► OCR LANGUAGE
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-black rounded border border-green-400"></div>
                <select
                  value={settings.ocrLanguage}
                  onChange={(e) => setSettings({ ...settings, ocrLanguage: e.target.value })}
                  className="relative w-full px-3 py-2 bg-black border-0 rounded text-green-400 font-mono focus:outline-none"
                  style={{ textShadow: '0 0 2px #00ff00' }}
                >
                  <option value="eng">English</option>
                  <option value="jpn">Japanese</option>
                  <option value="eng+jpn">English + Japanese</option>
                </select>
              </div>
            </div>

            {/* Capture Area Note */}
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2 font-mono tracking-wide">
                ► CAPTURE AREA
              </label>
              <div className="bg-black border border-green-600 p-3 rounded">
                <p className="text-sm text-green-600 font-mono leading-relaxed">
                  ► Position your 5250 terminal window within the capture frame shown in the main application window.
                  <br />
                  ► The application will capture the content within that frame when using "📷 WITH SCREEN".
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-green-400 rounded border-2 border-gray-500 hover:border-gray-400 font-mono text-sm tracking-wide shadow-lg transition-all"
              style={{ textShadow: '0 0 2px #00ff00' }}
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-green-400 rounded border-2 border-blue-500 hover:border-blue-400 font-mono text-sm tracking-wide shadow-lg transition-all"
              style={{ textShadow: '0 0 2px #00ff00' }}
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
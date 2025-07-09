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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-white">Settings</h2>
        
        {/* Debug info */}
        <div className="mb-4 p-2 bg-gray-700 rounded text-xs text-gray-300">
          <div>Debug: {JSON.stringify(settings, null, 2)}</div>
        </div>
        
        <div className="space-y-4">
          {/* OCR Language */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              OCR Language
            </label>
            <select
              value={settings.ocrLanguage}
              onChange={(e) => setSettings({ ...settings, ocrLanguage: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="eng">English</option>
              <option value="jpn">Japanese</option>
              <option value="eng+jpn">English + Japanese</option>
            </select>
          </div>

          {/* Capture Area Note */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Capture Area
            </label>
            <div className="text-sm text-gray-400 bg-gray-700 p-3 rounded">
              📍 Position your 5250 terminal window within the capture frame shown in the main application window.
              <br />
              The application will automatically capture the content within that frame.
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
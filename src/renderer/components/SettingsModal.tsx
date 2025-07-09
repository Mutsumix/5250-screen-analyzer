import { useState, useEffect } from 'react';
import { AppSettings } from '../../shared/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [settings, setSettings] = useState<AppSettings>({
    captureInterval: 2000,
    ocrLanguage: 'eng+jpn',
    captureArea: {
      x: 100,
      y: 100,
      width: 800,
      height: 600,
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Load current settings
      const api = window.electronAPI;
      if (api?.getSettings) {
        api.getSettings().then((loadedSettings) => {
          setSettings(loadedSettings);
        }).catch((error) => {
          console.error('Failed to load settings:', error);
        });
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    const api = window.electronAPI;
    if (api?.updateSettings) {
      api.updateSettings(settings);
      console.log('Settings saved:', settings);
      onClose();
    }
  };

  const handleCaptureAreaChange = (field: keyof typeof settings.captureArea, value: number) => {
    if (settings.captureArea) {
      setSettings({
        ...settings,
        captureArea: {
          ...settings.captureArea,
          [field]: value,
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-white">Settings</h2>
        
        <div className="space-y-4">
          {/* Capture Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Capture Interval (ms)
            </label>
            <input
              type="number"
              value={settings.captureInterval}
              onChange={(e) => setSettings({ ...settings, captureInterval: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              min="1000"
              max="10000"
              step="500"
            />
          </div>

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

          {/* Capture Area */}
          {settings.captureArea && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capture Area
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400">X Position</label>
                  <input
                    type="number"
                    value={settings.captureArea.x}
                    onChange={(e) => handleCaptureAreaChange('x', parseInt(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">Y Position</label>
                  <input
                    type="number"
                    value={settings.captureArea.y}
                    onChange={(e) => handleCaptureAreaChange('y', parseInt(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">Width</label>
                  <input
                    type="number"
                    value={settings.captureArea.width}
                    onChange={(e) => handleCaptureAreaChange('width', parseInt(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">Height</label>
                  <input
                    type="number"
                    value={settings.captureArea.height}
                    onChange={(e) => handleCaptureAreaChange('height', parseInt(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}
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
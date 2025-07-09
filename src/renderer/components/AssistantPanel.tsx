import { AIResponse } from '../../shared/types';

interface AssistantPanelProps {
  response: AIResponse | null;
}

const AssistantPanel = ({ response }: AssistantPanelProps) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-sm font-semibold mb-2 text-gray-400">AI Assistant</h2>
      <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-y-auto">
        {response ? (
          <div className="space-y-4">
            <div className="bg-gray-700 rounded p-3">
              <p className="text-sm text-gray-400 mb-1">Guidance:</p>
              <p className="text-white whitespace-pre-wrap">{response.response}</p>
            </div>
            <p className="text-xs text-gray-500">
              Updated: {new Date(response.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600">
            <p className="text-center">
              AI assistance will appear here when screen changes are detected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantPanel;
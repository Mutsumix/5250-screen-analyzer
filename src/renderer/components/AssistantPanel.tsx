import { useState } from 'react';
import { AIResponse } from '../../shared/types';

interface AssistantPanelProps {
  response: AIResponse | null;
  onTextOnlyQuestion: (question: string) => void;
  onWithScreenQuestion: (question: string) => void;
}

const AssistantPanel = ({ response, onTextOnlyQuestion, onWithScreenQuestion }: AssistantPanelProps) => {
  const [question, setQuestion] = useState('');

  const handleTextOnlySubmit = () => {
    if (question.trim()) {
      onTextOnlyQuestion(question.trim());
      setQuestion('');
    }
  };

  const handleWithScreenSubmit = () => {
    if (question.trim()) {
      onWithScreenQuestion(question.trim());
      setQuestion('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleWithScreenSubmit();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Question Input Area */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold mb-2 text-green-400 font-mono tracking-wide">
          ► QUESTION INPUT
        </h2>
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 bg-black rounded border-2 border-green-400 shadow-lg"></div>
            <div className="absolute inset-1 border border-green-300 rounded-sm"></div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="何について助けが必要ですか？例：「この画面で次に何をすべきですか？」"
              className="relative w-full h-20 px-3 py-2 bg-black border-0 rounded text-green-400 placeholder-green-600 resize-none focus:outline-none font-mono leading-relaxed"
              style={{ textShadow: '0 0 2px #00ff00' }}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleTextOnlySubmit}
              disabled={!question.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-600 text-green-400 rounded border-2 border-gray-500 hover:border-gray-400 transition-all font-mono text-sm tracking-wide shadow-lg"
              style={{ textShadow: !question.trim() ? 'none' : '0 0 2px #00ff00' }}
            >
              📝 TEXT ONLY
            </button>
            <button
              onClick={handleWithScreenSubmit}
              disabled={!question.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-b from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-600 text-green-400 rounded border-2 border-blue-600 hover:border-blue-500 transition-all font-mono text-sm tracking-wide shadow-lg"
              style={{ textShadow: !question.trim() ? 'none' : '0 0 2px #00ff00' }}
            >
              📷 WITH SCREEN
            </button>
          </div>
          <p className="text-xs text-green-600 font-mono">
            ► TIP: Press Ctrl+Enter for screen capture
          </p>
        </div>
      </div>

      {/* AI Response Area */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-sm font-semibold mb-2 text-green-400 font-mono tracking-wide">
          ► AI RESPONSE
        </h2>
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-black rounded border-2 border-green-400 shadow-lg"></div>
          <div className="absolute inset-1 border border-green-300 rounded-sm"></div>
          <div className="relative h-full p-4 overflow-y-auto">
            {response ? (
              <div className="space-y-4">
                <div className="border border-green-600 rounded p-3 bg-black">
                  <p className="text-sm text-green-600 mb-2 font-mono tracking-wide">► ANSWER:</p>
                  <p className="text-green-400 whitespace-pre-wrap font-mono leading-relaxed" style={{ textShadow: '0 0 1px #00ff00' }}>
                    {response.response}
                  </p>
                </div>
                <p className="text-xs text-green-600 font-mono">
                  ► Response: {new Date(response.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-center text-green-600 font-mono leading-relaxed">
                  ► Enter your question above and select<br />
                  ► "📝 TEXT ONLY" or "📷 WITH SCREEN"<br />
                  ► to get AI assistance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantPanel;
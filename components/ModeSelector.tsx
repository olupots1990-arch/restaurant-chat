
import React from 'react';
import { ChatMode } from '../types';
import { Zap, BrainCircuit, MessageSquare, Mic } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modes = [
  { mode: ChatMode.STANDARD, icon: <MessageSquare size={16} />, label: "Standard chat for general questions." },
  { mode: ChatMode.THINKING, icon: <BrainCircuit size={16} />, label: "Deeper thought for complex problems." },
  { mode: ChatMode.FAST, icon: <Zap size={16} />, label: "Quick responses for fast-paced needs." },
  { mode: ChatMode.VOICE, icon: <Mic size={16} />, label: "Real-time voice conversation." },
];

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex justify-center items-center p-2 bg-gray-200 dark:bg-whatsapp-input-bg border-t border-gray-300 dark:border-gray-700">
      <div className="flex items-center space-x-1 bg-gray-300 dark:bg-whatsapp-bg p-1 rounded-full">
        {modes.map(({ mode, icon }) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`flex items-center justify-center px-3 py-1 text-sm rounded-full transition-colors ${
              currentMode === mode
                ? 'bg-whatsapp-teal text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-gray-600/50'
            }`}
            title={mode}
          >
            {icon}
            <span className="ml-2 hidden sm:inline">{mode}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;

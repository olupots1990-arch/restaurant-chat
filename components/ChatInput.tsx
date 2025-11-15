
import React, { useRef } from 'react';
import { Paperclip, Mic, Send, X, FileImage } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isRecording: boolean;
  isLoading: boolean;
  attachedFile: File | null;
  setAttachedFile: (file: File | null) => void;
  onSendMessage: () => void;
  onMicClick: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isRecording,
  isLoading,
  attachedFile,
  setAttachedFile,
  onSendMessage,
  onMicClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-3 bg-gray-200 dark:bg-whatsapp-input-bg border-t border-gray-300 dark:border-gray-700">
        {attachedFile && (
            <div className="mb-2 p-2 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="text-gray-800 dark:text-gray-200">{attachedFile.name}</span>
                </div>
                <button onClick={() => setAttachedFile(null)} className="p-1 rounded-full hover:bg-gray-400 dark:hover:bg-gray-600">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}
      <div className="flex items-center bg-white dark:bg-whatsapp-bg rounded-full px-2 py-1">
        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <Paperclip className="w-5 h-5" />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 px-2"
          disabled={isLoading}
        />
        {isLoading ? (
            <div className="p-2">
                <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-whatsapp-teal"></div>
            </div>
        ) : input || attachedFile ? (
          <button onClick={onSendMessage} className="p-2 text-white bg-whatsapp-teal rounded-full">
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={onMicClick} className={`p-2 rounded-full ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 dark:text-gray-400'}`}>
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;


import React, { useRef, useEffect } from 'react';
import { ChatMessage, MessageAuthor, MessagePart, GroundingChunk } from '../types';
import { Volume2, Link, MapPin, MessageCircle } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  onPlayAudio: (text: string) => void;
}

const GroundingPart: React.FC<{ chunks: GroundingChunk[] }> = ({ chunks }) => {
    return (
        <div className="mt-2 pt-2 border-t border-gray-500/50">
            <h4 className="text-xs font-semibold mb-1 text-gray-400">Information from Google</h4>
            <div className="flex flex-wrap gap-2">
                {chunks.map((chunk, index) => {
                    if (chunk.web) {
                        return (
                            <a key={index} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-700 hover:bg-gray-600 text-blue-300 rounded-full px-2 py-1 flex items-center gap-1">
                                <Link size={12}/> {chunk.web.title}
                            </a>
                        );
                    }
                    if (chunk.maps) {
                         return (
                            <div key={index}>
                                <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-700 hover:bg-gray-600 text-blue-300 rounded-full px-2 py-1 flex items-center gap-1">
                                    <MapPin size={12}/> {chunk.maps.title}
                                </a>
                                {chunk.maps.placeAnswerSources?.[0]?.reviewSnippets?.map((review, rIndex) => (
                                     <a key={`${index}-${rIndex}`} href={review.uri} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg p-2 flex items-start gap-2">
                                        <MessageCircle size={14} className="flex-shrink-0 mt-0.5"/> 
                                        <span>"{review.reviewText}" - {review.author}</span>
                                    </a>
                                ))}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};


const MessageList: React.FC<MessageListProps> = ({ messages, onPlayAudio }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderPart = (part: MessagePart, message: ChatMessage) => {
    switch (part.type) {
      case 'text':
        return <p className="whitespace-pre-wrap">{part.content}</p>;
      case 'image':
        return <img src={part.content} alt="User upload" className="mt-2 rounded-lg max-w-xs" />;
      case 'grounding':
        return <GroundingPart chunks={part.meta} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-whatsapp-bg/80 dark:[background-image:url('https://i.imgur.com/pYmE0NC.png')]">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex mb-4 ${message.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`rounded-lg px-3 py-2 max-w-md shadow ${
              message.author === MessageAuthor.USER
                ? 'bg-whatsapp-outgoing-bubble text-white'
                : message.author === MessageAuthor.BOT
                ? 'bg-white dark:bg-whatsapp-incoming-bubble text-gray-800 dark:text-gray-200'
                : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm w-full text-center'
            }`}
          >
            {message.parts.map((part, index) => (
                <div key={index}>{renderPart(part, message)}</div>
            ))}
            
            <div className="flex items-center justify-end mt-1">
                 {message.author === MessageAuthor.BOT && message.parts.some(p => p.type === 'text') && (
                    <button onClick={() => onPlayAudio(message.parts.find(p=>p.type==='text')?.content || '')} className="p-1 hover:bg-black/20 rounded-full transition-colors mr-2">
                        <Volume2 className="w-4 h-4 text-gray-400" />
                    </button>
                )}
                <span className="text-xs text-gray-400">{message.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;

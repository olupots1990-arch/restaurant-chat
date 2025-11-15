
export enum ChatMode {
  STANDARD = 'Standard',
  THINKING = 'Thinking',
  FAST = 'Fast',
  VOICE = 'Voice',
}

export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system',
}

export interface MessagePart {
  type: 'text' | 'image' | 'audio' | 'grounding';
  content: string; // for text or data URL for image/audio
  meta?: any; // for grounding citations
}

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  parts: MessagePart[];
  timestamp: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            uri: string;
            reviewText: string;
            author: string;
        }[]
    }[]
  };
}

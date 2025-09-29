
export interface WordInfo {
  word: string;
  reading: string | null;
  meaning: string | null;
}

export interface Correction {
  isCorrect: boolean;
  feedback: string;
  correctedText: string;
}

export interface AIMessageContent {
    type: 'text';
    content: WordInfo[];
}

export interface ImageMessageContent {
    type: 'image';
    content: string; // base64 string
}

export type MessageContent = AIMessageContent | ImageMessageContent;

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  parts: MessageContent[];
  timestamp: number;
  correction?: Correction | null;
}

export interface Character {
  id: string;
  name: string;
  avatar: string; // base64 string
  description: string;
  chatHistory: Message[];
}

export interface AppData {
    characters: Character[];
    apiKey?: string;
}

export interface GeminiChatResponse {
    corrections: (Correction & { userMessageIndex: number })[];
    responses: ({ type: 'text'; content: WordInfo[] } | { type: 'image_prompt'; content: string })[];
}
export type ChatClientRole = 'user' | 'assistant';

export interface ChatHistoryMessage {
  role: ChatClientRole;
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatHistoryMessage[];
}

export interface ChatResponse {
  reply: string;
  model: string;
  promptFeedback?: unknown;
  usageMetadata?: unknown;
}

export interface GeminiContentPart {
  text: string;
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

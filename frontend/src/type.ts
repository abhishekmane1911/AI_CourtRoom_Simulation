export interface ChatMessage {
    role: string;
    content: string;
  }
  
  export interface MessagePayload {
    role: string;
    case: string;
    message: string;
    history: ChatMessage[];
  }
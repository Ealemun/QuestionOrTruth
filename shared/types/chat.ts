interface PlayerMessage {
  time: string;
  system?: false;
  senderId: string;
  senderName: string;
  text: string;
}

interface SystemMessage {
  time: string;
  system: true;
  messageKey: string;
  messageParams?: Record<string, string>;
  text?: string; // fallback
}

export type ChatMessage = PlayerMessage | SystemMessage;
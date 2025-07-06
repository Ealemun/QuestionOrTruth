import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '../../shared/types/chat';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSend }) => {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      onSend(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="border-t pt-2 mt-4">
      <h3 className="font-semibold">{t('chat.title')}</h3>
      <div className="max-h-64 overflow-y-auto mb-2">
        {messages.map((msg, i) => (
          <div key={i} className={msg.system ? 'text-gray-500 italic text-sm' : 'text-sm'}>
            <span className="text-xs text-gray-400 mr-2">[{msg.time}]</span>
            {msg.system
              ? String(t(msg.messageKey, msg.messageParams))
              : (
                <>
                  <strong>{msg.senderName}:</strong> {msg.text}
                </>
              )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border rounded p-1 text-sm resize-none"
          rows={2}
          placeholder={t('chat.placeholder')}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          {t('chat.send')}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;


// import ChatBox from './ChatBox'; // adapte le chemin

// // ... à mettre dans RoomScreen.tsx

// <ChatBox
//   messages={room.messages}
//   onSend={(text) =>
//     socket.emit('chat:message', {
//       roomId: room.id,
//       senderId: socket.id,
//       text,
//     })
//   }
// />

import React from 'react';
import { Conversation } from '../../utils/types';
import { formatDate } from '../../utils/formatters';

interface ConversationCardProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  // Get the most recent message text
  const getPreviewText = () => {
    if (conversation.chat_messages.length === 0) {
      return 'No messages';
    }

    // Sort messages by date
    const sortedMessages = [...conversation.chat_messages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Get the most recent message
    const recentMessage = sortedMessages[0];

    // Try to get plain text content
    let previewText = '';
    if (recentMessage.content && recentMessage.content.length > 0) {
      const textContent = recentMessage.content.find(c => c.type === 'text');
      if (textContent && textContent.text) {
        previewText = textContent.text;
      }
    }

    // If no text found in content, use the main text field
    if (!previewText && recentMessage.text) {
      previewText = recentMessage.text;
    }

    // Truncate long messages
    if (previewText.length > 100) {
      previewText = previewText.substring(0, 100) + '...';
    }

    return previewText || 'No preview available';
  };

  // Get message count
  const messageCount = conversation.chat_messages.length;

  // Format the date
  const formattedDate = formatDate(conversation.updated_at);

  return (
    <div
      className={`mb-2 cursor-pointer rounded-lg border p-4 transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="mb-1 flex items-start justify-between">
        <h3 className="flex-1 truncate font-medium" title={conversation.name}>
          {conversation.name || 'Untitled Conversation'}
        </h3>
        <span className="ml-2 text-xs whitespace-nowrap text-gray-500">{formattedDate}</span>
      </div>

      <p className="line-clamp-2 text-sm text-gray-600">{getPreviewText()}</p>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {messageCount} {messageCount === 1 ? 'message' : 'messages'}
        </span>

        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
          {new Date(conversation.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default ConversationCard;

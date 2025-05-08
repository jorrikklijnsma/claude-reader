import { Conversation, Conversations } from './types';

/**
 * Split a large conversations file into individual conversation files
 * @param conversations The array of conversations to split
 * @returns An array of individual conversation data with filenames
 */
export const splitConversations = (
  conversations: Conversations
): Array<{
  filename: string;
  data: Conversation;
}> => {
  return conversations.map(conversation => {
    // Create a sanitized filename
    const sanitizedName = conversation.name
      ? conversation.name
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
          .substring(0, 30)
      : 'untitled';

    const filename = `${sanitizedName}_${conversation.uuid.substring(0, 8)}.json`;

    return {
      filename,
      data: conversation,
    };
  });
};

/**
 * Export a conversation to a downloadable JSON file
 * @param conversation The conversation to export
 */
export const exportConversationToFile = (conversation: Conversation): void => {
  // Create a sanitized filename
  const sanitizedName = conversation.name
    ? conversation.name
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 30)
    : 'untitled';

  const filename = `${sanitizedName}_${conversation.uuid.substring(0, 8)}.json`;

  // Convert to a JSON string with pretty formatting
  const jsonString = JSON.stringify(conversation, null, 2);

  // Create a blob from the JSON string
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a link element and trigger a download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export all conversations as individual files in a ZIP archive
 * @param conversations The array of conversations to export
 */
export const exportAllConversationsAsSeparateFiles = async (
  conversations: Conversations
): Promise<void> => {
  // We'll need to dynamically import JSZip as it's a client-side library
  const JSZip = (await import('jszip')).default;

  // Create a new ZIP file
  const zip = new JSZip();

  // Add each conversation as a separate file
  conversations.forEach(conversation => {
    // Create a sanitized filename
    const sanitizedName = conversation.name
      ? conversation.name
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
          .substring(0, 30)
      : 'untitled';

    const filename = `${sanitizedName}_${conversation.uuid.substring(0, 8)}.json`;

    // Add the file to the ZIP
    zip.file(filename, JSON.stringify(conversation, null, 2));
  });

  // Generate the ZIP file
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Create a URL for the blob
  const url = URL.createObjectURL(zipBlob);

  // Create a link element and trigger a download
  const link = document.createElement('a');
  link.href = url;
  link.download = 'claude_conversations.zip';
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Load a single conversation JSON file
 * @param file The file to load
 * @returns Promise resolving to the parsed conversation
 */
export const loadConversationFromFile = async (file: File): Promise<Conversation> => {
  const text = await file.text();
  const conversation = JSON.parse(text) as Conversation;

  // Parse date strings to Date objects
  conversation.created_at = new Date(conversation.created_at);
  conversation.updated_at = new Date(conversation.updated_at);

  conversation.chat_messages = conversation.chat_messages.map(msg => ({
    ...msg,
    created_at: new Date(msg.created_at),
    updated_at: new Date(msg.updated_at),
    content: msg.content.map(content => ({
      ...content,
      start_timestamp: content.start_timestamp ? new Date(content.start_timestamp) : null,
      stop_timestamp: content.stop_timestamp ? new Date(content.stop_timestamp) : null,
    })),
  }));

  return conversation;
};

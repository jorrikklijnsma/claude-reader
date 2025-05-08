import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ConversationBranchView from '../components/ui/ConversationBranchView';
import MessageItem from '../components/ui/MessageItem';
import {
  IoArrowBack,
  IoCalendarOutline,
  IoTimeOutline,
  IoChatbubbleOutline,
  IoFilterOutline,
  IoGitBranchOutline,
  IoDownloadOutline,
  IoGitNetworkOutline,
} from 'react-icons/io5';
import {
  exportConversationToFile,
  exportAllConversationsAsSeparateFiles,
} from '../utils/conversationSplitter';

const ConversationPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'standard' | 'branches'>('standard');
  const [isExporting, setIsExporting] = useState(false);

  // Find the selected conversation from URL parameter
  useEffect(() => {
    if (!data.conversations) {
      navigate('/');
      return;
    }

    const conversation = data.conversations.find(c => c.uuid === uuid);
    if (!conversation) {
      navigate('/conversations');
    }
  }, [uuid, data.conversations, navigate]);

  // Get the current conversation
  const conversation = data.conversations?.find(c => c.uuid === uuid);

  if (!conversation) {
    return <div>Loading...</div>;
  }

  // Filter messages by search term
  const filteredMessages =
    searchTerm.trim() === ''
      ? conversation.chat_messages
      : conversation.chat_messages.filter(msg => {
          const lowerSearchTerm = searchTerm.toLowerCase();

          // Search in main text
          if (msg.text && msg.text.toLowerCase().includes(lowerSearchTerm)) {
            return true;
          }

          // Search in content
          if (msg.content) {
            for (const content of msg.content) {
              if (content.text && content.text.toLowerCase().includes(lowerSearchTerm)) {
                return true;
              }
            }
          }

          return false;
        });

  // Export the current conversation as a separate file
  const handleExportConversation = () => {
    exportConversationToFile(conversation);
  };

  // Export all conversations as separate files in a ZIP archive
  const handleExportAllConversations = async () => {
    if (!data.conversations) return;

    setIsExporting(true);
    try {
      await exportAllConversationsAsSeparateFiles(data.conversations);
    } catch (error) {
      console.error('Error exporting conversations:', error);
      alert('Failed to export conversations. See console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/conversations')}
          className="flex items-center space-x-1 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <IoArrowBack />
          <span>Back to conversations</span>
        </button>

        <div className="flex space-x-2">
          <button
            onClick={handleExportConversation}
            className="flex items-center space-x-1 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Export this conversation as a separate file"
          >
            <IoDownloadOutline />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handleExportAllConversations}
            className="flex items-center space-x-1 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Export all conversations as separate files in a ZIP archive"
            disabled={isExporting}
          >
            <IoGitNetworkOutline />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export All'}</span>
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-3 text-2xl font-bold">{conversation.name || 'Untitled Conversation'}</h1>

        <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <IoCalendarOutline className="mr-1" />
            <span>Created: {new Date(conversation.created_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <IoTimeOutline className="mr-1" />
            <span>Updated: {new Date(conversation.updated_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <IoChatbubbleOutline className="mr-1" />
            <span>{conversation.chat_messages.length} messages</span>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search in this conversation..."
              className="w-full rounded-md border p-2 pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="absolute top-2.5 left-3 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              className={`flex items-center rounded-md px-3 py-2 ${
                viewMode === 'standard'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setViewMode('standard')}
              title="Standard view"
            >
              <IoFilterOutline className="mr-2" />
              Standard
            </button>
            <button
              className={`flex items-center rounded-md px-3 py-2 ${
                viewMode === 'branches'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setViewMode('branches')}
              title="Show conversation branches"
            >
              <IoGitBranchOutline className="mr-2" />
              Branches
            </button>
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {searchTerm
              ? 'No messages found for your search.'
              : 'No messages in this conversation.'}
          </div>
        ) : (
          searchTerm &&
          filteredMessages.length !== conversation.chat_messages.length && (
            <div className="mb-4 rounded-md bg-blue-50 p-2 text-sm text-blue-700">
              Showing {filteredMessages.length} of {conversation.chat_messages.length} messages
              <button className="ml-2 underline" onClick={() => setSearchTerm('')}>
                Clear search
              </button>
            </div>
          )
        )}
      </div>

      {viewMode === 'standard' ? (
        <div className="space-y-4">
          {filteredMessages.map(message => (
            <MessageItem key={message.uuid} message={message} />
          ))}
        </div>
      ) : (
        <ConversationBranchView conversation={conversation} messages={filteredMessages} />
      )}
    </div>
  );
};

export default ConversationPage;

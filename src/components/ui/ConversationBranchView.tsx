import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../../utils/types';
import { extractConversationBranches } from '../../utils/conversationTree';
import MessageItem from './MessageItem';
import { IoGitBranchOutline, IoTimeOutline, IoDownloadOutline } from 'react-icons/io5';
import { exportConversationToFile } from '../../utils/conversationSplitter';

interface ConversationBranchViewProps {
  conversation: any; // Full conversation object
  messages: ChatMessage[];
}

const ConversationBranchView: React.FC<ConversationBranchViewProps> = ({
  conversation,
  messages,
}) => {
  const [branches, setBranches] = useState<{
    mainConversation: ChatMessage[];
    branches: { id: string; messages: ChatMessage[] }[];
  }>({ mainConversation: [], branches: [] });

  const [activeBranchId, setActiveBranchId] = useState<string>('main');
  const [viewMode, setViewMode] = useState<'branch' | 'timeline'>('branch');

  // Detect branches when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const extracted = extractConversationBranches(messages);
      setBranches(extracted);
    }
  }, [messages]);

  // Get messages for the active branch
  const activeBranchMessages =
    activeBranchId === 'main'
      ? branches.mainConversation
      : branches.branches.find(b => b.id === activeBranchId)?.messages || [];

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  // Get a timestamp-based name for a branch
  const getBranchName = (branchMessages: ChatMessage[]) => {
    if (branchMessages.length === 0) return 'Empty Branch';

    const firstMessage = branchMessages[0];
    const date = new Date(firstMessage.created_at);

    return `Conversation from ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  // Export the current branch as a separate file
  const exportBranch = () => {
    if (activeBranchId === 'main') {
      // Create a copy of the main conversation
      const mainConversationCopy = {
        ...conversation,
        chat_messages: branches.mainConversation,
      };

      exportConversationToFile(mainConversationCopy);
    } else {
      // Find the branch
      const branch = branches.branches.find(b => b.id === activeBranchId);

      if (branch) {
        // Create a new conversation object with just these messages
        const branchConversation = {
          ...conversation,
          name: `${conversation.name || 'Untitled'} - Branch ${activeBranchId}`,
          chat_messages: branch.messages,
        };

        exportConversationToFile(branchConversation);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex space-x-2">
            <button
              className={`flex items-center rounded-md px-3 py-2 ${
                viewMode === 'branch'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setViewMode('branch')}
            >
              <IoGitBranchOutline className="mr-2" />
              Branch View
            </button>
            <button
              className={`flex items-center rounded-md px-3 py-2 ${
                viewMode === 'timeline'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setViewMode('timeline')}
            >
              <IoTimeOutline className="mr-2" />
              Timeline View
            </button>
          </div>

          {viewMode === 'branch' && (
            <button
              className="flex items-center rounded-md bg-blue-100 px-3 py-2 text-blue-700"
              onClick={exportBranch}
              title="Export this branch as a separate conversation file"
            >
              <IoDownloadOutline className="mr-2" />
              Export Branch
            </button>
          )}
        </div>
      </div>

      {branches.branches.length === 0 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          <h3 className="font-medium">No branches detected</h3>
          <p className="mt-1 text-sm">
            This conversation appears to be a single linear thread without any branches or
            significant time gaps.
          </p>
        </div>
      ) : viewMode === 'branch' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Branch Selector */}
          <div className="md:col-span-1">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-lg font-medium">Conversation Branches</h3>
              <div className="space-y-2">
                <button
                  className={`w-full rounded-md p-3 text-left transition ${
                    activeBranchId === 'main'
                      ? 'border-l-4 border-purple-600 bg-purple-100 text-purple-700'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveBranchId('main')}
                >
                  <div className="flex items-center font-medium">
                    <IoGitBranchOutline className="mr-2" />
                    Main Conversation
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {branches.mainConversation.length} messages
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {branches.mainConversation.length > 0 &&
                      formatDate(new Date(branches.mainConversation[0].created_at))}
                  </div>
                </button>

                {branches.branches.map(branch => (
                  <button
                    key={branch.id}
                    className={`w-full rounded-md p-3 text-left transition ${
                      branch.id === activeBranchId
                        ? 'border-l-4 border-purple-600 bg-purple-100 text-purple-700'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveBranchId(branch.id)}
                  >
                    <div className="flex items-center font-medium">
                      <IoGitBranchOutline className="mr-2" />
                      Branch {branch.id.replace('branch-', '')}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {branch.messages.length} messages
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {branch.messages.length > 0 &&
                        formatDate(new Date(branch.messages[0].created_at))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Branch Messages */}
          <div className="md:col-span-3">
            <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <h3 className="text-lg font-medium">
                {activeBranchId === 'main'
                  ? 'Main Conversation'
                  : `Branch ${activeBranchId.replace('branch-', '')}`}
              </h3>
              <div className="mt-1 text-sm text-gray-600">
                {activeBranchMessages.length} messages
              </div>
              {activeBranchMessages.length > 0 && (
                <div className="mt-1 text-sm text-gray-600">
                  From {formatDate(new Date(activeBranchMessages[0].created_at))}
                  {activeBranchMessages.length > 1 && (
                    <>
                      {' '}
                      to{' '}
                      {formatDate(
                        new Date(activeBranchMessages[activeBranchMessages.length - 1].created_at)
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {activeBranchMessages.length === 0 ? (
                <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                  No messages in this branch
                </div>
              ) : (
                activeBranchMessages.map(message => (
                  <MessageItem key={message.uuid} message={message} />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        // Timeline View - Show all messages in chronological order with branch indicators
        <div className="space-y-4">
          {messages
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((message, index) => {
              // Find which branch this message belongs to
              const isMainBranch = branches.mainConversation.some(m => m.uuid === message.uuid);
              let branchId = isMainBranch ? 'main' : null;

              if (!branchId) {
                // Check other branches
                for (const branch of branches.branches) {
                  if (branch.messages.some(m => m.uuid === message.uuid)) {
                    branchId = branch.id;
                    break;
                  }
                }
              }

              // Check if message starts a branch
              const isBranchStart =
                branchId &&
                branchId !== 'main' &&
                branches.branches.find(b => b.id === branchId)?.messages[0].uuid === message.uuid;

              return (
                <div key={message.uuid}>
                  {isBranchStart && (
                    <div className="my-6 flex items-center">
                      <div className="h-px flex-grow bg-gray-300"></div>
                      <div className="mx-4 flex items-center rounded-full bg-purple-100 px-4 py-1 text-sm text-purple-700">
                        <IoGitBranchOutline className="mr-2" />
                        New branch: {branchId}
                      </div>
                      <div className="h-px flex-grow bg-gray-300"></div>
                    </div>
                  )}

                  <div className="relative">
                    {/* Branch indicator on the left */}
                    {branchId && branchId !== 'main' && (
                      <div className="absolute top-0 bottom-0 -left-5 w-1 rounded-full bg-purple-400"></div>
                    )}

                    <div className="mb-1 flex items-center">
                      <div className="mr-2 text-xs text-gray-500">
                        {formatDate(new Date(message.created_at))}
                      </div>
                      {branchId && branchId !== 'main' && (
                        <div className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                          Branch {branchId.replace('branch-', '')}
                        </div>
                      )}
                    </div>

                    <MessageItem message={message} />
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default ConversationBranchView;

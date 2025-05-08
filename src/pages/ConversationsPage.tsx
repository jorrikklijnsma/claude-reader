import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ConversationCard from '../components/ui/ConversationCard';
import FileUpload from '../components/ui/FileUpload';
import {
  IoCloudUploadOutline,
  IoFilterOutline,
  IoSearchOutline,
  IoDownloadOutline,
} from 'react-icons/io5';
import { exportAllConversationsAsSeparateFiles } from '../utils/conversationSplitter';

const ConversationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, loadConversations } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Show 20 conversations per page

  // If no conversations data is loaded, redirect to the home page
  useEffect(() => {
    if (!data.conversations && !data.isLoading) {
      navigate('/');
    }
  }, [data.conversations, data.isLoading, navigate]);

  // Sort and filter conversations
  const filteredConversations = React.useMemo(() => {
    if (!data.conversations) return [];

    let filtered = [...data.conversations];

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        conv =>
          // Search in conversation name
          (conv.name && conv.name.toLowerCase().includes(lowerSearchTerm)) ||
          // Search in messages
          conv.chat_messages.some(msg => {
            // Search in message text
            if (msg.text && msg.text.toLowerCase().includes(lowerSearchTerm)) {
              return true;
            }

            // Search in message content
            if (msg.content) {
              for (const content of msg.content) {
                if (content.text && content.text.toLowerCase().includes(lowerSearchTerm)) {
                  return true;
                }
              }
            }

            return false;
          })
      );
    }

    // Sort conversations
    if (sortOption === 'newest') {
      filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortOption === 'oldest') {
      filtered.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    } else if (sortOption === 'name') {
      filtered.sort((a, b) => {
        const nameA = a.name || 'Untitled';
        const nameB = b.name || 'Untitled';
        return nameA.localeCompare(nameB);
      });
    }

    return filtered;
  }, [data.conversations, searchTerm, sortOption]);

  // Paginate conversations
  const paginatedConversations = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredConversations.slice(startIndex, endIndex);
  }, [filteredConversations, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);

  // Handle conversation selection
  const handleConversationClick = (uuid: string) => {
    navigate(`/conversations/${uuid}`);
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

  // Pagination controls component
  const PaginationControls = () => {
    return (
      <div className="my-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredConversations.length)} of{' '}
            {filteredConversations.length} conversations
          </span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`rounded border px-3 py-1 ${
              currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'
            }`}
          >
            Previous
          </button>

          {/* Page numbers - show 5 pages max */}
          {[...Array(Math.min(5, totalPages))].map((_, idx) => {
            // Calculate page number to show
            let pageToShow;
            if (totalPages <= 5) {
              pageToShow = idx + 1;
            } else if (currentPage <= 3) {
              pageToShow = idx + 1;
            } else if (currentPage >= totalPages - 2) {
              pageToShow = totalPages - 4 + idx;
            } else {
              pageToShow = currentPage - 2 + idx;
            }

            return (
              <button
                key={idx}
                onClick={() => setCurrentPage(pageToShow)}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentPage === pageToShow ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {pageToShow}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`rounded border px-3 py-1 ${
              currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (data.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!data.conversations) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <IoCloudUploadOutline className="mx-auto mb-4 text-5xl text-purple-500" />
        <h2 className="mb-2 text-2xl font-bold">No Conversations Loaded</h2>
        <p className="mb-6 text-gray-600">
          Please upload your conversations.json file to view your Claude conversations.
        </p>
        <div className="mx-auto max-w-md">
          <FileUpload onUpload={loadConversations} label="Upload conversations.json" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Conversations</h1>

        <button
          onClick={handleExportAllConversations}
          className="flex items-center space-x-1 rounded-md bg-blue-100 px-3 py-2 text-blue-700 transition-colors hover:bg-blue-200"
          disabled={isExporting}
        >
          <IoDownloadOutline />
          <span>{isExporting ? 'Exporting...' : 'Export All as Separate Files'}</span>
        </button>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <IoSearchOutline className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search in all conversations..."
              className="w-full rounded-md border p-2 pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <IoFilterOutline className="mr-2 text-gray-400" />
            <label htmlFor="sort-option" className="mr-2 text-sm">
              Sort by:
            </label>
            <select
              id="sort-option"
              className="rounded-md border p-2"
              value={sortOption}
              onChange={e => setSortOption(e.target.value as any)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {filteredConversations.length !== data.conversations.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredConversations.length} of {data.conversations.length} conversations
            {searchTerm && (
              <button
                className="ml-2 text-purple-600 hover:underline"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {filteredConversations.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <h2 className="mb-2 text-xl font-bold">No Conversations Found</h2>
          <p className="text-gray-600">
            {searchTerm
              ? 'No conversations match your search criteria.'
              : 'There are no conversations in the loaded file.'}
          </p>
        </div>
      ) : (
        <>
          {/* Pagination Controls - Top */}
          {totalPages > 1 && <PaginationControls />}

          {/* Conversations List */}
          <div className="grid grid-cols-1 gap-4">
            {paginatedConversations.map(conversation => (
              <ConversationCard
                key={conversation.uuid}
                conversation={conversation}
                isSelected={data.selectedConversation?.uuid === conversation.uuid}
                onClick={() => handleConversationClick(conversation.uuid)}
              />
            ))}
          </div>

          {/* Pagination Controls - Bottom */}
          {totalPages > 1 && <PaginationControls />}
        </>
      )}
    </div>
  );
};

export default ConversationsPage;

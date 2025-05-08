import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FileUpload from '../components/ui/FileUpload';
import {
  IoPersonOutline,
  IoFolderOutline,
  IoChatbubbleOutline,
  IoCloudUploadOutline,
} from 'react-icons/io5';

const HomePage: React.FC = () => {
  const { data, loadUsers, loadProjects, loadConversations } = useData();

  // Check if any data is loaded
  const hasData = data.users || data.projects || data.conversations;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Welcome to Claude Reader</h1>
        <p className="text-gray-600">
          An easy-to-use interface for browsing your Claude data exports.
        </p>
      </header>

      {!hasData ? (
        // No data loaded - show upload section
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-6 text-center">
            <IoCloudUploadOutline className="mx-auto mb-2 text-5xl text-purple-500" />
            <h2 className="text-xl font-bold">Upload Your Claude Export Files</h2>
            <p className="text-gray-600">Start by uploading your Claude export JSON files</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-medium">Users</h3>
              <FileUpload
                onUpload={loadUsers}
                label="Upload users.json"
                className={data.users ? 'border-green-300 bg-green-50' : ''}
              />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Projects</h3>
              <FileUpload
                onUpload={loadProjects}
                label="Upload projects.json"
                className={data.projects ? 'border-green-300 bg-green-50' : ''}
              />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Conversations</h3>
              <FileUpload
                onUpload={loadConversations}
                label="Upload conversations.json"
                className={data.conversations ? 'border-green-300 bg-green-50' : ''}
              />
            </div>
          </div>
        </div>
      ) : (
        // Data is loaded - show data summary and navigation
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">Your Claude Data</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Link
                to="/users"
                className={`block rounded-lg border p-4 ${
                  data.users
                    ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                    : 'border-gray-200 bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <IoPersonOutline className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Users</h3>
                    <p className="text-sm text-gray-600">
                      {data.users ? `${data.users.length} users` : 'No data loaded'}
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/projects"
                className={`block rounded-lg border p-4 ${
                  data.projects
                    ? 'border-green-200 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <IoFolderOutline className="text-xl text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Projects</h3>
                    <p className="text-sm text-gray-600">
                      {data.projects ? `${data.projects.length} projects` : 'No data loaded'}
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/conversations"
                className={`block rounded-lg border p-4 ${
                  data.conversations
                    ? 'border-purple-200 bg-purple-50 hover:bg-purple-100'
                    : 'border-gray-200 bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <IoChatbubbleOutline className="text-xl text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Conversations</h3>
                    <p className="text-sm text-gray-600">
                      {data.conversations
                        ? `${data.conversations.length} conversations`
                        : 'No data loaded'}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {data.conversations && (
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold">Recent Conversations</h2>

              {data.conversations.length > 0 ? (
                <div className="space-y-3">
                  {data.conversations.slice(0, 5).map(conv => (
                    <Link
                      key={conv.uuid}
                      to={`/conversations/${conv.uuid}`}
                      className="block rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="truncate font-medium">
                          {conv.name || 'Untitled Conversation'}
                        </h3>
                        <span className="text-xs whitespace-nowrap text-gray-500">
                          {new Date(conv.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-gray-600">
                        {conv.chat_messages.length} messages
                      </p>
                    </Link>
                  ))}

                  {data.conversations.length > 5 && (
                    <Link
                      to="/conversations"
                      className="mt-3 block text-center text-sm text-purple-600 hover:text-purple-800"
                    >
                      View all {data.conversations.length} conversations
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">No conversations found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;

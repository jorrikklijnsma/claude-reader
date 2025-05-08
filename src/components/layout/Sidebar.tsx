import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FileUpload from '../ui/FileUpload';
import { useData } from '../../context/DataContext';
import {
  IoHomeOutline,
  IoPersonOutline,
  IoFolderOutline,
  IoChatbubbleOutline,
  IoCloseOutline,
} from 'react-icons/io5';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const location = useLocation();
  const { loadUsers, loadProjects, loadConversations, data } = useData();
  const [activeTab, setActiveTab] = useState<'navigation' | 'upload'>('navigation');

  // Determine if a route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-20 bg-black md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-bold text-purple-700">Claude Reader</h2>
            <button
              className="rounded-full p-1 hover:bg-gray-100 md:hidden"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>

          {/* Tab buttons */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'navigation'
                  ? 'border-b-2 border-purple-700 text-purple-700'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('navigation')}
            >
              Navigation
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'upload'
                  ? 'border-b-2 border-purple-700 text-purple-700'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Files
            </button>
          </div>

          {/* Navigation tab */}
          {activeTab === 'navigation' && (
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/"
                    className={`flex items-center space-x-2 rounded-md p-2 ${
                      isActive('/')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => closeSidebar()}
                  >
                    <IoHomeOutline />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/users"
                    className={`flex items-center space-x-2 rounded-md p-2 ${
                      isActive('/users')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${!data.users ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => closeSidebar()}
                  >
                    <IoPersonOutline />
                    <span>Users</span>
                    {data.users && (
                      <span className="ml-auto rounded-full bg-gray-200 px-2 py-1 text-xs">
                        {data.users.length}
                      </span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects"
                    className={`flex items-center space-x-2 rounded-md p-2 ${
                      isActive('/projects')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${!data.projects ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => closeSidebar()}
                  >
                    <IoFolderOutline />
                    <span>Projects</span>
                    {data.projects && (
                      <span className="ml-auto rounded-full bg-gray-200 px-2 py-1 text-xs">
                        {data.projects.length}
                      </span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/conversations"
                    className={`flex items-center space-x-2 rounded-md p-2 ${
                      isActive('/conversations')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${!data.conversations ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => closeSidebar()}
                  >
                    <IoChatbubbleOutline />
                    <span>Conversations</span>
                    {data.conversations && (
                      <span className="ml-auto rounded-full bg-gray-200 px-2 py-1 text-xs">
                        {data.conversations.length}
                      </span>
                    )}
                  </Link>
                </li>
              </ul>
            </nav>
          )}

          {/* Upload files tab */}
          {activeTab === 'upload' && (
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Users</h3>
                <FileUpload
                  onUpload={loadUsers}
                  label="Upload users.json"
                  className={data.users ? 'border-green-300 bg-green-50' : ''}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Projects</h3>
                <FileUpload
                  onUpload={loadProjects}
                  label="Upload projects.json"
                  className={data.projects ? 'border-green-300 bg-green-50' : ''}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Conversations</h3>
                <FileUpload
                  onUpload={loadConversations}
                  label="Upload conversations.json"
                  className={data.conversations ? 'border-green-300 bg-green-50' : ''}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t p-4 text-xs text-gray-500">
            <p>Claude Reader v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

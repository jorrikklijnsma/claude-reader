import React from 'react';
import { useData } from '../../context/DataContext';
import { IoMenu, IoTrashOutline, IoInformationCircleOutline } from 'react-icons/io5';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { data, clearData } = useData();

  // Count loaded data files
  let loadedCount = 0;
  if (data.users) loadedCount++;
  if (data.projects) loadedCount++;
  if (data.conversations) loadedCount++;

  // Handle clear data confirmation
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all loaded data? This cannot be undone.')) {
      clearData();
    }
  };

  return (
    <header className="bg-purple-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="rounded-md p-2 transition-colors hover:bg-purple-600 md:hidden"
              aria-label="Toggle sidebar"
            >
              <IoMenu className="text-xl" />
            </button>

            <div className="flex items-center">
              <h1 className="text-xl font-bold">Claude Reader</h1>
              <div className="ml-2 rounded-md bg-purple-800 px-2 py-1 text-xs">
                {loadedCount}/3 files loaded
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleClearData}
              className="flex items-center space-x-1 rounded-md px-3 py-1 text-sm transition-colors hover:bg-purple-600"
              title="Clear all data"
              disabled={loadedCount === 0}
            >
              <IoTrashOutline />
              <span className="hidden sm:inline">Clear Data</span>
            </button>

            <button
              className="flex items-center space-x-1 rounded-md px-3 py-1 text-sm transition-colors hover:bg-purple-600"
              title="About Claude Reader"
            >
              <IoInformationCircleOutline />
              <span className="hidden sm:inline">About</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

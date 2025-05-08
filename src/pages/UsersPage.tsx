import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FileUpload from '../components/ui/FileUpload';
import { IoCloudUploadOutline, IoSearchOutline, IoPersonOutline } from 'react-icons/io5';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, loadUsers } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // If no users data is loaded, redirect to the home page
  useEffect(() => {
    if (!data.users && !data.isLoading) {
      navigate('/');
    }
  }, [data.users, data.isLoading, navigate]);

  // Filter users by search term
  const filteredUsers = React.useMemo(() => {
    if (!data.users) return [];

    if (searchTerm.trim() === '') {
      return data.users;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return data.users.filter(
      user =>
        (user.full_name && user.full_name.toLowerCase().includes(lowerSearchTerm)) ||
        (user.email_address && user.email_address.toLowerCase().includes(lowerSearchTerm))
    );
  }, [data.users, searchTerm]);

  if (data.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!data.users) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <IoCloudUploadOutline className="mx-auto mb-4 text-5xl text-purple-500" />
        <h2 className="mb-2 text-2xl font-bold">No Users Loaded</h2>
        <p className="mb-6 text-gray-600">
          Please upload your users.json file to view Claude users.
        </p>
        <div className="mx-auto max-w-md">
          <FileUpload onUpload={loadUsers} label="Upload users.json" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Users</h1>

      <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
        <div className="relative">
          <IoSearchOutline className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full rounded-md border p-2 pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredUsers.length !== data.users.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredUsers.length} of {data.users.length} users
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

      {filteredUsers.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <h2 className="mb-2 text-xl font-bold">No Users Found</h2>
          <p className="text-gray-600">
            {searchTerm
              ? 'No users match your search criteria.'
              : 'There are no users in the loaded file.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  UUID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.map(user => (
                <tr key={user.uuid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                        <IoPersonOutline className="text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'Unnamed User'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email_address || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.verified_phone_number || 'No phone'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    <div className="font-mono">{user.uuid}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;

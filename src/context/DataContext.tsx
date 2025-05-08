import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppData, Conversation, Conversations, Projects, Users } from '../utils/types';

// Create the context with a default value
const DataContext = createContext<
  | {
      data: AppData;
      loadUsers: (file: File) => Promise<void>;
      loadProjects: (file: File) => Promise<void>;
      loadConversations: (file: File) => Promise<void>;
      selectConversation: (uuid: string) => void;
      clearData: () => void;
    }
  | undefined
>(undefined);

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<AppData>({
    users: null,
    projects: null,
    conversations: null,
    isLoading: false,
    selectedConversation: null,
  });

  // Function to load users from file
  const loadUsers = async (file: File): Promise<void> => {
    setData(prev => ({ ...prev, isLoading: true }));
    try {
      const text = await file.text();
      const users = JSON.parse(text) as Users;
      setData(prev => ({ ...prev, users, isLoading: false }));

      // Store in localStorage for persistence
      localStorage.setItem('claude_reader_users', text);
    } catch (error) {
      console.error('Error loading users:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Function to load projects from file
  const loadProjects = async (file: File): Promise<void> => {
    setData(prev => ({ ...prev, isLoading: true }));
    try {
      const text = await file.text();
      const projects = JSON.parse(text) as Projects[];
      setData(prev => ({ ...prev, projects, isLoading: false }));

      // Store in localStorage for persistence
      localStorage.setItem('claude_reader_projects', text);
    } catch (error) {
      console.error('Error loading projects:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Function to load conversations from file
  const loadConversations = async (file: File): Promise<void> => {
    setData(prev => ({ ...prev, isLoading: true }));
    try {
      const text = await file.text();
      const conversations = JSON.parse(text) as Conversations;

      // Parse date strings to Date objects
      const parsedConversations = conversations.map(conv => ({
        ...conv,
        created_at: new Date(conv.created_at),
        updated_at: new Date(conv.updated_at),
        chat_messages: conv.chat_messages.map(msg => ({
          ...msg,
          created_at: new Date(msg.created_at),
          updated_at: new Date(msg.updated_at),
          content: msg.content.map(content => ({
            ...content,
            start_timestamp: content.start_timestamp ? new Date(content.start_timestamp) : null,
            stop_timestamp: content.stop_timestamp ? new Date(content.stop_timestamp) : null,
          })),
        })),
      }));

      setData(prev => ({
        ...prev,
        conversations: parsedConversations,
        isLoading: false,
      }));

      // Store in localStorage for persistence
      localStorage.setItem('claude_reader_conversations', text);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Function to select a conversation
  const selectConversation = (uuid: string) => {
    if (!data.conversations) return;

    const selected = data.conversations.find(conv => conv.uuid === uuid) || null;
    setData(prev => ({ ...prev, selectedConversation: selected }));
  };

  // Function to clear all data
  const clearData = () => {
    setData({
      users: null,
      projects: null,
      conversations: null,
      isLoading: false,
      selectedConversation: null,
    });

    localStorage.removeItem('claude_reader_users');
    localStorage.removeItem('claude_reader_projects');
    localStorage.removeItem('claude_reader_conversations');
  };

  // Load data from localStorage on initial render
  React.useEffect(() => {
    const loadFromLocalStorage = () => {
      const usersData = localStorage.getItem('claude_reader_users');
      const projectsData = localStorage.getItem('claude_reader_projects');
      const conversationsData = localStorage.getItem('claude_reader_conversations');

      let users = null;
      let projects = null;
      let conversations = null;

      try {
        if (usersData) {
          users = JSON.parse(usersData) as Users;
        }

        if (projectsData) {
          projects = JSON.parse(projectsData) as Projects[];
        }

        if (conversationsData) {
          const parsedConvs = JSON.parse(conversationsData) as Conversations;

          // Parse date strings to Date objects
          conversations = parsedConvs.map(conv => ({
            ...conv,
            created_at: new Date(conv.created_at),
            updated_at: new Date(conv.updated_at),
            chat_messages: conv.chat_messages.map(msg => ({
              ...msg,
              created_at: new Date(msg.created_at),
              updated_at: new Date(msg.updated_at),
              content: msg.content.map(content => ({
                ...content,
                start_timestamp: content.start_timestamp ? new Date(content.start_timestamp) : null,
                stop_timestamp: content.stop_timestamp ? new Date(content.stop_timestamp) : null,
              })),
            })),
          }));
        }

        setData(prev => ({
          ...prev,
          users,
          projects,
          conversations,
        }));
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };

    loadFromLocalStorage();
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        loadUsers,
        loadProjects,
        loadConversations,
        selectConversation,
        clearData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import ConversationPage from './pages/ConversationPage';
import ConversationsPage from './pages/ConversationsPage';
import ProjectsPage from './pages/ProjectsPage';
import UsersPage from './pages/UsersPage';

const App: React.FC = () => {
  return (
    <Router>
      <DataProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="conversations" element={<ConversationsPage />} />
            <Route path="conversations/:uuid" element={<ConversationPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Routes>
      </DataProvider>
    </Router>
  );
};

export default App;

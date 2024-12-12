import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <Router>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

export default App;

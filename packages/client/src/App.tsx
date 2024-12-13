import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import FormDesign from './pages/FormDesign';
import FormCreate from './pages/FormCreate';
import FormList from './pages/FormList';
import FormDetail from './pages/FormDetail';

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/forms" replace />} />
              <Route path="forms" element={<FormList />} />
              <Route path="forms/design" element={<FormDesign />} />
              <Route path="forms/create/:formId" element={<FormCreate />} />
              <Route path="forms/:instanceId" element={<FormDetail />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

export default App;

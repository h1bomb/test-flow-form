import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import FormDesign from '../pages/FormDesign';
import FormCreate from '../pages/FormCreate';
import FormList from '../pages/FormList';
import FormDetail from '../pages/FormDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/forms" replace /> },
      { path: '/forms', element: <FormList /> },
      { path: '/forms/design', element: <FormDesign /> },
      { path: '/forms/create/:formId', element: <FormCreate /> },
      { path: '/forms/:instanceId', element: <FormDetail /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
]);

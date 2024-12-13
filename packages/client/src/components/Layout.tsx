import React, { useEffect, useState } from 'react';
import { Layout as AntLayout, Menu, Button, Space, Typography } from 'antd';
import {
  UnorderedListOutlined,
  FormOutlined,
  LogoutOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi, formApi } from '../services/api';
import { FormSpecification } from '../types/form';

const { Header, Content, Sider } = AntLayout;
const { Text } = Typography;

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [specs, setSpecs] = useState<FormSpecification[]>([]);

  useEffect(() => {
    loadSpecs();
  }, []);

  const loadSpecs = async () => {
    try {
      const data = await formApi.getFormSpecs();
      setSpecs(data);
    } catch (error) {
      console.error('Failed to load form specifications:', error);
    }
  };

  const baseMenuItems = [
    {
      key: '/forms',
      icon: <UnorderedListOutlined />,
      label: '待处理流程',
    },
    {
      key: '/forms/design',
      icon: <FormOutlined />,
      label: '表单设计',
    },
  ];

  const specMenuItems = specs.map(spec => ({
    key: `/forms/create/${spec.id}`,
    icon: <FileOutlined />,
    label: spec.name,
  }));

  const menuItems = [
    ...specMenuItems,
    ...baseMenuItems,
  ];

  const handleLogout = async () => {
    try {
      await userApi.logout();
      logout();
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 8, marginBottom: 8 }}>
        <h2 style={{ color: 'white', margin: 0 }}>流程管理系统</h2>
        <Space>
          <Text style={{ color: 'white' }}>{user?.username}</Text>
          <Button 
            type="link" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{ color: 'white' }}
          >
            登出
          </Button>
        </Space>
      </Header>
      <AntLayout>
        <Sider width={200}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <AntLayout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            <Outlet />
          </Content>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;

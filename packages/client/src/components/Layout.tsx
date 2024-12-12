import React from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FormOutlined, UnorderedListOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = AntLayout;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/forms',
      icon: <UnorderedListOutlined />,
      label: '表单列表',
    },
    {
      key: '/forms/design',
      icon: <FormOutlined />,
      label: '表单设计',
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 16px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ float: 'left', width: 200, height: 31, margin: '16px 24px 16px 0' }}>
          流程表单系统
        </div>
      </Header>
      <AntLayout>
        <Sider width={200} style={{ background: '#fff' }}>
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

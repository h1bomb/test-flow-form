import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, message, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FormInstanceListItem } from '../types/form';
import { formApi } from '../services/api';
import type { User } from '../contexts/AuthContext';

interface FormListProps {}

const FormList: React.FC<FormListProps> = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formInstances, setFormInstances] = useState<FormInstanceListItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const fetchFormInstances = async () => {
    try {
      setLoading(true);
      const response = await formApi.getFormInstances();
      setFormInstances(response);
    } catch (error) {
      message.error('获取表单实例列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormInstances();
  }, []);

  const getFilteredInstances = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
    switch (activeTab) {
      case 'handled':
        return formInstances.filter(instance => {
          const flowConfig = JSON.parse(instance.flowConfig ?? '{ "nodes": [] }');
          const currentNode = flowConfig.nodes.find((node: { handler: string; }) => node.handler === user.username);
          return !!currentNode && currentNode.id !== instance.currentStatus;
        });
      case 'handling':
        return formInstances.filter(instance => {
          const flowConfig = JSON.parse(instance.flowConfig ?? '{ "nodes": [] }');
          const currentNode = flowConfig.nodes.find((node: { handler: string; }) => node.handler === user.username);
          return !!currentNode && currentNode.id === instance.currentStatus;
        });
      case 'created':
        return formInstances.filter(instance => instance.creatorName === user.username);
      default:
        return formInstances;
    }
  };

  const getStatusTag = (status: string) => {
    let color = 'default';
    let text = status;

    switch (status) {
      case 'start':
        color = 'blue';
        text = '开始';
        break;
      case 'process':
        color = 'orange';
        text = '处理中';
        break;
      case 'end':
        color = 'green';
        text = '已完成';
        break;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  const columns: ColumnsType<FormInstanceListItem> = [
    {
      title: '表单名称',
      dataIndex: 'formName',
      key: 'formName',
    },
    {
      title: '提交人',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: '当前处理人',
      dataIndex: 'handler',
      key: 'handler',
      render: (_handler, record) => {
        const flowConfig = JSON.parse(record.flowConfig ?? '{ "nodes": [] }');
        const currentNode = flowConfig.nodes.find(
          (node: { id: string; handler?: string }) => node.id === record.currentStatus
        );
        return currentNode?.handler || '-';  
      },
    },
    {
      title: '当前状态',
      dataIndex: 'currentStatus',
      key: 'currentStatus',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => navigate(`/forms/${record.id}`)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="待处理流程"
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        style={{ marginBottom: 16 }}
        items={[
          { label: '全部', key: 'all' },
          { label: '待我处理的', key: 'handling' },
          { label: '我已处理的', key: 'handled' },
          { label: '我提交的', key: 'created' },
        ]}
      />
      
      <Table
        columns={columns}
        dataSource={getFilteredInstances()}
        loading={loading}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />
    </Card>
  );
};

export default FormList;

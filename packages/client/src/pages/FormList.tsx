import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Tag, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { FormInstanceListItem } from '../types/form';
import { formApi } from '../services/api';

const FormList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formInstances, setFormInstances] = useState<FormInstanceListItem[]>([]);

  useEffect(() => {
    fetchFormInstances();
  }, []);

  const fetchFormInstances = async () => {
    try {
      const response = await formApi.getFormInstances();
      setFormInstances(response);
    } catch (error) {
      console.error('Failed to fetch form instances:', error);
    } finally {
      setLoading(false);
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
      dataIndex: 'formSpecName',
      key: 'formSpecName',
    },
    {
      title: '提交人',
      dataIndex: 'submitter',
      key: 'submitter',
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
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
      title="表单实例列表"
      extra={
        <Button 
          type="primary" 
          onClick={() => navigate('/forms/design')}
        >
          创建新表单
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={formInstances}
        rowKey="id"
        loading={loading}
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

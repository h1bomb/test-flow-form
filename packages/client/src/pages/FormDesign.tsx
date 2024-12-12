import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Select, 
  Switch, 
  Divider,
  message 
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { FormField, FlowNode, FormSpecification } from '../types/form';
import { formApi } from '../services/api';

const { Option } = Select;

const FormDesign: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fields, setFields] = useState<FormField[]>([]);

  // 默认的开始和结束节点
  const defaultNodes: FlowNode[] = [
    { id: 'start', name: '开始', type: 'start' },
    { id: 'end', name: '结束', type: 'end' }
  ];

  const [processNode, setProcessNode] = useState<FlowNode>({
    id: 'process',
    name: '处理',
    type: 'process',
    handler: ''
  });

  const addField = () => {
    const newField: FormField = {
      id: uuidv4(),
      type: 'input',
      label: '',
      required: false
    };
    setFields([...fields, newField]);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const onFinish = async (values: { name: string }) => {
    if (fields.length === 0) {
      message.error('请至少添加一个表单项');
      return;
    }

    if (!processNode.handler) {
      message.error('请配置处理人');
      return;
    }

    const formSpec: FormSpecification = {
      name: values.name,
      formConfig: {
        fields: fields
      },
      flowConfig: {
        nodes: [...defaultNodes.slice(0, 1), processNode, ...defaultNodes.slice(1)]
      }
    };

    try {
      await formApi.createFormSpec(formSpec);
      message.success('表单创建成功');
      navigate('/forms');
    } catch (error) {
      message.error('表单创建失败');
    }
  };

  return (
    <div>
      <Card title="表单设计">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="表单名称"
            name="name"
            rules={[{ required: true, message: '请输入表单名称' }]}
          >
            <Input placeholder="请输入表单名称" />
          </Form.Item>

          <Divider>表单项配置</Divider>

          {fields.map((field) => (
            <Card 
              key={field.id} 
              size="small" 
              style={{ marginBottom: 16 }}
              extra={
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeField(field.id)}
                />
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="字段名称"
                  value={field.label}
                  onChange={e => updateField(field.id, { label: e.target.value })}
                />
                <Space>
                  <Select
                    value={field.type}
                    onChange={value => updateField(field.id, { type: value })}
                    style={{ width: 120 }}
                  >
                    <Option value="input">输入框</Option>
                    <Option value="textarea">文本框</Option>
                  </Select>
                  <span>必填：</span>
                  <Switch
                    checked={field.required}
                    onChange={checked => updateField(field.id, { required: checked })}
                  />
                </Space>
              </Space>
            </Card>
          ))}

          <Button 
            type="dashed" 
            onClick={addField} 
            block 
            icon={<PlusOutlined />}
            style={{ marginBottom: 24 }}
          >
            添加表单项
          </Button>

          <Divider>流程配置</Divider>

          <div style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Card size="small" style={{ backgroundColor: '#f0f0f0' }}>
                <div>开始节点</div>
              </Card>
              
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="处理节点名称"
                    value={processNode.name}
                    onChange={e => setProcessNode({ ...processNode, name: e.target.value })}
                  />
                  <Input
                    placeholder="处理人"
                    value={processNode.handler}
                    onChange={e => setProcessNode({ ...processNode, handler: e.target.value })}
                  />
                </Space>
              </Card>

              <Card size="small" style={{ backgroundColor: '#f0f0f0' }}>
                <div>结束节点</div>
              </Card>
            </Space>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存表单
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FormDesign;

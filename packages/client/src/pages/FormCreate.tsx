import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, message, Spin } from 'antd';
import { FormSpecification, FormField } from '../types/form';
import { formApi } from '../services/api';

const { TextArea } = Input;

const FormCreate: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [formSpec, setFormSpec] = useState<FormSpecification | null>(null);

  useEffect(() => {
    const fetchFormSpec = async () => {
      try {
        if (!formId) return;
        const response = await formApi.getFormSpec(parseInt(formId));
        setFormSpec(response);
      } catch (error) {
        message.error('获取表单配置失败');
      } finally {
        setLoading(false);
      }
    };

    fetchFormSpec();
  }, [formId]);

  const renderFormItem = (field: FormField) => {
    const commonProps = {
      label: field.label,
      name: field.id,
      rules: field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined,
    };

    switch (field.type) {
      case 'input':
        return (
          <Form.Item key={field.id} {...commonProps}>
            <Input placeholder={`请输入${field.label}`} />
          </Form.Item>
        );
      case 'textarea':
        return (
          <Form.Item key={field.id} {...commonProps}>
            <TextArea rows={4} placeholder={`请输入${field.label}`} />
          </Form.Item>
        );
      default:
        return null;
    }
  };

  const onFinish = async (values: Record<string, any>) => {
    if (!formSpec) {
      message.error('表单配置不存在');
      return;
    }

    try {
      const formInstance = {
        formSpecId: parseInt(formId!),
        formData: values,
        currentStatus: formSpec.flowConfig.nodes[1].id, // 设置为第一个处理节点
        flowRemarks: '',
      };

      const response = await formApi.createFormInstance(formInstance);
      message.success('表单提交成功');
      navigate(`/forms/${response.id}`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('请先登录');
        navigate('/login');
      } else {
        message.error('表单提交失败');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!formSpec) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        表单配置不存在
      </div>
    );
  }

  return (
    <Card 
      title={formSpec.name}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        {formSpec.formConfig.fields.map(renderFormItem)}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FormCreate;

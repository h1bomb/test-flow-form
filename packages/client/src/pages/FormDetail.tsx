import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card,
  Descriptions,
  Steps,
  Input,
  Button,
  Space,
  message,
  Spin,
  Form,
  Divider
} from 'antd';
import { FormInstanceDetail, FormConfig, FlowConfig, FormField } from '../types/form';
import { formApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { TextArea } = Input;

const FormDetail: React.FC = () => {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [formInstance, setFormInstance] = useState<FormInstanceDetail | null>(null);

  useEffect(() => {
    fetchFormInstance();
  }, [instanceId]);

  const fetchFormInstance = async () => {
    try {
      if (!instanceId) return;
      const response = await formApi.getFormInstance(parseInt(instanceId));
      setFormInstance(response);
    } catch (error) {
      message.error('获取表单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = () => {
    if (!formInstance) return 0;
    const flowConfig: FlowConfig = JSON.parse(formInstance.flowConfig);
    return flowConfig.nodes.findIndex(
      (node) => node.id === formInstance.currentStatus
    );
  };

  const handleSubmit = async (values: { remarks: string }) => {
    if (!formInstance) return;

    const currentStepIndex = getCurrentStep();
    const flowConfig: FlowConfig = JSON.parse(formInstance.flowConfig);
    const nextNode = flowConfig.nodes[currentStepIndex + 1];

    try {
      await formApi.updateFormInstance(formInstance.id, {
        currentStatus: nextNode.id,
        flowRemarks: values.remarks,
      });
      message.success('提交成功');
      navigate('/forms');
    } catch (error) {
      message.error('提交失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!formInstance) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        表单实例不存在
      </div>
    );
  }

  const currentStep = getCurrentStep();
  const flowConfig: FlowConfig = JSON.parse(formInstance.flowConfig);
  const isLastStep = currentStep === flowConfig.nodes.length - 1;
  const formConfig: FormConfig = JSON.parse(formInstance.formConfig);

  // 创建字段映射
  const fieldMap = formConfig.fields.reduce<Record<string, FormField>>((acc, field) => {
    acc[field.id] = field;
    return acc;
  }, {});

  return (
    <Card title={formInstance.formName}>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="提交人">{formInstance.creatorName}</Descriptions.Item>
        <Descriptions.Item label="处理人">{formInstance.handler || '-'}</Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {new Date(formInstance.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {new Date(formInstance.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>

      <Divider>流程状态</Divider>

      <Steps
        current={currentStep}
        items={flowConfig.nodes.map((node) => ({
          title: node.name,
          description: node.handler,
        }))}
      />

      <Divider>表单数据</Divider>

      <Descriptions bordered column={1}>
        {Object.entries(formInstance.formData).map(([key, value]) => (
          <Descriptions.Item key={key} label={fieldMap[key]?.label || key}>
            {value}
          </Descriptions.Item>
        ))}
      </Descriptions>

      {!isLastStep && (
        <>
          <Divider>处理意见</Divider>
          {user?.username === formInstance.handler ? (
            <Form form={form} onFinish={handleSubmit}>
              <Form.Item
                name="remarks"
                rules={[{ required: true, message: '请输入处理意见' }]}
              >
                <TextArea rows={4} placeholder="请输入处理意见" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    提交
                  </Button>
                  <Button onClick={() => navigate('/forms')}>返回</Button>
                </Space>
              </Form.Item>
            </Form>
          ) : (
            <Button onClick={() => navigate('/forms')}>返回</Button>
          )}
        </>
      )}
    </Card>
  );
};

export default FormDetail;

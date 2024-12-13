// 表单规格相关类型
export interface FormField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
}

export interface FormConfig {
  fields: FormField[];
}

export interface FlowNode {
  id: string;
  name: string;
  handler: string;
}

export interface FlowConfig {
  nodes: FlowNode[];
}

export interface FormSpecification {
  id: number;
  name: string;
  formConfig: FormConfig;
  flowConfig: FlowConfig;
  createdAt: string;
  updatedAt: string;
}

// 表单实例相关类型
export interface FormInstanceListItem {
  id: number;
  formSpecId: number;
  formName: string;
  creatorName: string;
  currentStatus: string;
  currentNodeName: string;
  handler: string;
  flowConfig: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormInstanceDetail {
  id: number;
  formSpecId: number;
  formName: string;
  creatorName: string;
  currentStatus: string;
  currentNodeName: string;
  handler: string;
  formData: Record<string, any>;
  formConfig: string;
  flowConfig: string;
  flowRemark?: string;
  createdAt: string;
  updatedAt: string;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

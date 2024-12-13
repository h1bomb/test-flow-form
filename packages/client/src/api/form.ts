import { typedRequest } from './request';

export interface FormSpec {
  id: number;
  name: string;
  fields: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 获取所有表单规格
export const getFormSpecs = () => {
  return typedRequest.get<ApiResponse<FormSpec[]>>('/api/forms/specs');
};

// 获取单个表单规格
export const getFormSpec = (id: number) => {
  return typedRequest.get<ApiResponse<FormSpec>>(`/api/forms/specs/${id}`);
};

// 创建表单规格
export const createFormSpec = (data: Omit<FormSpec, 'id' | 'createdAt' | 'updatedAt'>) => {
  return typedRequest.post<ApiResponse<FormSpec>>('/api/forms/specs', data);
};

// 更新表单规格
export const updateFormSpec = (id: number, data: Partial<Omit<FormSpec, 'id' | 'createdAt' | 'updatedAt'>>) => {
  return typedRequest.put<ApiResponse<FormSpec>>(`/api/forms/specs/${id}`, data);
};

// 删除表单规格
export const deleteFormSpec = (id: number) => {
  return typedRequest.delete<ApiResponse<void>>(`/api/forms/specs/${id}`);
};

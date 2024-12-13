import axios from 'axios';
import { FormSpecification, FormInstanceListItem, FormInstanceDetail } from '../types/form';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // 允许跨域请求携带 cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // 确保每个请求都带上 credentials
  config.withCredentials = true;
  return config;
});

// 响应拦截器处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
}

export interface FormInstanceUpdate {
  currentStatus: string;
  flowRemarks: string;
}

// 用户相关 API
export const userApi = {
  login: (data: LoginData) => api.post<LoginResponse>('/users/login', data).then(res => res.data),
  register: (data: LoginData) => api.post<void>('/users/register', data).then(res => res.data),
  logout: async () => {
    const response = await api.post('/users/logout');
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get<any>('/users/current');
    return response.data;
  },
};

// 表单相关 API
export const formApi = {
  // 表单规格
  createFormSpec: (data: FormSpecification) => 
    api.post<FormSpecification>('/forms/specs', data).then(res => res.data),
  getFormSpecs: () => 
    api.get<FormSpecification[]>('/forms/specs').then(res => res.data),
  getFormSpec: (id: number) => 
    api.get<FormSpecification>(`/forms/specs/${id}`).then(res => res.data),
  
  // 表单实例
  createFormInstance: (data: Partial<FormInstanceDetail>) => 
    api.post<FormInstanceDetail>('/forms/instances', data).then(res => res.data),
  getFormInstances: () => 
    api.get<FormInstanceListItem[]>('/forms/instances').then(res => res.data),
  getFormInstance: (id: number) => 
    api.get<FormInstanceDetail>(`/forms/instances/${id}`).then(res => res.data),
  updateFormInstance: (id: number, data: FormInstanceUpdate) => 
    api.put<FormInstanceDetail>(`/forms/instances/${id}`, data).then(res => res.data),
};

export default api;

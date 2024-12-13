import axios, { AxiosRequestConfig } from 'axios';
import { message } from 'antd';

// 创建 axios 实例
export const request = axios.create({
  baseURL: 'http://localhost:3000', // 服务器地址
  timeout: 10000, // 请求超时时间
  withCredentials: true, // 允许跨域携带 cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 确保每个请求都带上 credentials
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 如果响应成功，直接返回数据
    return response.data;
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          message.error('请先登录');
          // 可以在这里添加跳转到登录页的逻辑
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(error.response.data?.error || '请求失败');
      }
    } else if (error.request) {
      // 请求已经发出，但没有收到响应
      message.error('网络错误，请检查您的网络连接');
    } else {
      // 请求配置发生的错误
      message.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);

// 定义请求方法的类型
export interface RequestInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

export const typedRequest = request as unknown as RequestInstance;

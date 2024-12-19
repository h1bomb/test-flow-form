import { InferModel } from 'drizzle-orm';
import { formSpecs, formInstances, users } from './db/schema';
import { DefaultState, DefaultContext } from 'koa';

// 用户相关类型
export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, 'insert'>;

// 表单规格相关类型
export type FormSpec = Omit<InferModel<typeof formSpecs>, 'formConfig' | 'flowConfig'> & {
  formConfig: any;
  flowConfig: any;
};
export type NewFormSpec = Omit<InferModel<typeof formSpecs, 'insert'>, 'formConfig' | 'flowConfig'> & {
  formConfig: any;
  flowConfig: any;
};

// 表单实例相关类型
export interface FormInstance extends Omit<InferModel<typeof formInstances>, 'formData'> {
  formData: any;
  formName: string;
  creatorName: string;
  currentNodeName: string;
  handler: string;
}

export type NewFormInstance = Omit<InferModel<typeof formInstances, 'insert'>, 'formData'> & {
  formData: any;
};

export type UpdateFormInstance = Partial<Omit<FormInstance, 'id' | 'formData'>>;

// 扩展 Koa 的 Session 类型
declare module 'koa-session' {
  interface Session {
    userId?: number;
    username?: string;
  }
}

// 扩展 Koa 的 Context 类型
export interface CustomContext extends DefaultContext {
  session: {
    userId?: number;
    username?: string;
  };
}

export interface CustomState extends DefaultState {
  user?: User;
}

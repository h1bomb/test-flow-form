import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq, and } from 'drizzle-orm';
import { formSpecs, formInstances, users } from '../schema';
import { NewFormSpec, NewFormInstance, UpdateFormInstance } from '../types';

interface FormInstanceQuery {
  creatorId?: number;
  handlerId?: number;
}

export class FormService {
  constructor(private db: MySql2Database) {}

  // 保存表单规格
  async saveFormSpec(data: NewFormSpec) {
    try {
      const [result] = await this.db.insert(formSpecs).values(data);
      if (!result.insertId) {
        throw new Error('Failed to insert form specification');
      }

      // 获取刚插入的记录
      const [spec] = await this.db
        .select()
        .from(formSpecs)
        .where(eq(formSpecs.id, result.insertId));

      if (!spec) {
        throw new Error('Failed to retrieve saved form specification');
      }

      return {
        ...spec,
        formConfig: JSON.parse(spec.formConfig),
        flowConfig: JSON.parse(spec.flowConfig),
      };
    } catch (error) {
      console.error('Error saving form spec:', error);
      throw new Error('Failed to save form specification');
    }
  }

  // 获取所有表单规格
  async getFormSpecs() {
    try {
      const specs = await this.db.select().from(formSpecs);
      return specs.map(spec => ({
        ...spec,
        formConfig: JSON.parse(spec.formConfig),
        flowConfig: JSON.parse(spec.flowConfig),
      }));
    } catch (error) {
      console.error('Error getting form specs:', error);
      throw new Error('Failed to get form specifications');
    }
  }

  // 获取单个表单规格
  async getFormSpec(id: number) {
    try {
      const [spec] = await this.db
        .select()
        .from(formSpecs)
        .where(eq(formSpecs.id, id));

      if (!spec) {
        return null;
      }

      return {
        ...spec,
        formConfig: JSON.parse(spec.formConfig),
        flowConfig: JSON.parse(spec.flowConfig),
      };
    } catch (error) {
      console.error('Error getting form spec:', error);
      throw new Error('Failed to get form specification');
    }
  }

  // 保存表单实例
  async saveFormInstance(data: NewFormInstance) {
    try {
      // 检查表单规格是否存在
      const formSpec = await this.db
        .select()
        .from(formSpecs)
        .where(eq(formSpecs.id, data.formSpecId))
        .limit(1);

      if (!formSpec.length) {
        throw new Error('Form specification not found');
      }

      const [result] = await this.db.insert(formInstances).values(data);
      if (!result.insertId) {
        throw new Error('Failed to insert form instance');
      }

      // 获取刚插入的记录
      const [instance] = await this.db
        .select({
          id: formInstances.id,
          formSpecId: formInstances.formSpecId,
          userId: formInstances.userId,
          currentStatus: formInstances.currentStatus,
          formData: formInstances.formData,
          flowRemark: formInstances.flowRemark,
          createdAt: formInstances.createdAt,
          updatedAt: formInstances.updatedAt,
          formName: formSpecs.name,
          formConfig: formSpecs.formConfig,
          flowConfig: formSpecs.flowConfig,
          creatorName: users.username,
        })
        .from(formInstances)
        .leftJoin(formSpecs, eq(formInstances.formSpecId, formSpecs.id))
        .leftJoin(users, eq(formInstances.userId, users.id))
        .where(eq(formInstances.id, result.insertId));

      if (!instance) {
        throw new Error('Failed to retrieve saved form instance');
      }

      const flowConfig = JSON.parse(instance.flowConfig ?? '{ "nodes": [] }');
      const currentNode = flowConfig.nodes.find(
        (node: any) => node.id === instance.currentStatus
      );

      return {
        ...instance,
        formData: instance.formData ? JSON.parse(instance.formData) : {},
        currentNodeName: currentNode?.name || instance.currentStatus,
        handler: currentNode?.handler,
      };
    } catch (error) {
      console.error('Error saving form instance:', error);
      throw new Error('Failed to save form instance');
    }
  }

  // 更新表单实例
  async updateFormInstance(id: number, data: UpdateFormInstance) {
    try {
      const [instance] = await this.db
        .select()
        .from(formInstances)
        .where(eq(formInstances.id, id));

      if (!instance) {
        throw new Error('Form instance not found');
      }

      await this.db
        .update(formInstances)
        .set(data)
        .where(eq(formInstances.id, id));

      const [updatedInstance] = await this.db
        .select({
          id: formInstances.id,
          formSpecId: formInstances.formSpecId,
          userId: formInstances.userId,
          currentStatus: formInstances.currentStatus,
          formData: formInstances.formData,
          flowRemark: formInstances.flowRemark,
          createdAt: formInstances.createdAt,
          updatedAt: formInstances.updatedAt,
          formName: formSpecs.name,
          formConfig: formSpecs.formConfig,
          flowConfig: formSpecs.flowConfig,
          creatorName: users.username,
        })
        .from(formInstances)
        .leftJoin(formSpecs, eq(formInstances.formSpecId, formSpecs.id))
        .leftJoin(users, eq(formInstances.userId, users.id))
        .where(eq(formInstances.id, id));

        const flowConfig = JSON.parse(updatedInstance.flowConfig ?? '{ "nodes": [] }');
      const currentNode = flowConfig.nodes.find(
        (node: any) => node.id === updatedInstance.currentStatus
      );

      return {
        ...updatedInstance,
        formData: updatedInstance.formData ? JSON.parse(updatedInstance.formData) : {},
        currentNodeName: currentNode?.name || updatedInstance.currentStatus,
        handler: currentNode?.handler,
      };
    } catch (error) {
      console.error('Error updating form instance:', error);
      throw new Error('Failed to update form instance');
    }
  }

  // 查询表单实例
  async queryFormInstances(query: FormInstanceQuery) {
    try {
      const conditions = [];

      if (query.creatorId) {
        conditions.push(eq(formInstances.userId, query.creatorId));
      }

      if (query.handlerId) {
        conditions.push(eq(formInstances.userId, query.handlerId));
      }

      const instances = await this.db
        .select({
          id: formInstances.id,
          formSpecId: formInstances.formSpecId,
          userId: formInstances.userId,
          currentStatus: formInstances.currentStatus,
          formData: formInstances.formData,
          flowRemark: formInstances.flowRemark,
          createdAt: formInstances.createdAt,
          updatedAt: formInstances.updatedAt,
          formName: formSpecs.name,
          formConfig: formSpecs.formConfig,
          flowConfig: formSpecs.flowConfig,
          creatorName: users.username,
        })
        .from(formInstances)
        .leftJoin(formSpecs, eq(formInstances.formSpecId, formSpecs.id))
        .leftJoin(users, eq(formInstances.userId, users.id))
        .where(conditions.length ? and(...conditions) : undefined);

      return instances.map(instance => {
        const flowConfig = JSON.parse(instance.flowConfig ?? '{ "nodes": [] }');
        const currentNode = flowConfig.nodes.find(
          (node: any) => node.id === instance.currentStatus
        );

        return {
          ...instance,
          formData: instance.formData ? JSON.parse(instance.formData) : {},
          currentNodeName: currentNode?.name || instance.currentStatus,
          handler: currentNode?.handler,
        };
      });
    } catch (error) {
      console.error('Error querying form instances:', error);
      throw new Error('Failed to query form instances: Unknown error');
    }
  }

  // 获取单个表单实例
  async getFormInstance(id: number) {
    try {
      const [instance] = await this.db
        .select({
          id: formInstances.id,
          formSpecId: formInstances.formSpecId,
          userId: formInstances.userId,
          currentStatus: formInstances.currentStatus,
          formData: formInstances.formData,
          flowRemark: formInstances.flowRemark,
          createdAt: formInstances.createdAt,
          updatedAt: formInstances.updatedAt,
          formName: formSpecs.name,
          formConfig: formSpecs.formConfig,
          flowConfig: formSpecs.flowConfig,
          creatorName: users.username,
        })
        .from(formInstances)
        .leftJoin(formSpecs, eq(formInstances.formSpecId, formSpecs.id))
        .leftJoin(users, eq(formInstances.userId, users.id))
        .where(eq(formInstances.id, id));

      if (!instance) {
        return null;
      }

      const flowConfig = JSON.parse(instance.flowConfig ?? '{ "nodes": [] }');
      const currentNode = flowConfig.nodes.find(
        (node: any) => node.id === instance.currentStatus
      );

      return {
        ...instance,
        formData: instance.formData ? JSON.parse(instance.formData) : {},
        currentNodeName: currentNode?.name || instance.currentStatus,
        handler: currentNode?.handler,
      };
    } catch (error) {
      console.error('Error getting form instance:', error);
      throw new Error('Failed to get form instance');
    }
  }
}

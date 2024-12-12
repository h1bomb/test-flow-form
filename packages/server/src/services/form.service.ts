import { eq, or } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { formSpecs, formInstances } from '../schema';

export class FormService {
  constructor(private db: MySql2Database) {}

  async saveFormSpec(data: {
    name: string;
    formConfig: string;
    flowConfig: string;
  }) {
    const result = await this.db.insert(formSpecs).values({
      name: data.name,
      formConfig: data.formConfig,
      flowConfig: data.flowConfig,
    });
    return result;
  }

  async saveFormInstance(data: {
    userId: number;
    formSpecId: number;
    currentStatus: string;
    formData: string;
    flowRemark?: string;
  }) {
    const result = await this.db.insert(formInstances).values({
      userId: data.userId,
      formSpecId: data.formSpecId,
      currentStatus: data.currentStatus,
      formData: data.formData,
      flowRemark: data.flowRemark || '',
    });
    return result;
  }

  async updateFormInstance(
    id: number,
    data: {
      currentStatus?: string;
      flowRemark?: string;
    }
  ) {
    const result = await this.db
      .update(formInstances)
      .set({
        currentStatus: data.currentStatus,
        flowRemark: data.flowRemark,
      })
      .where(eq(formInstances.id, id));
    return result;
  }

  async queryFormInstances(params: {
    creatorId?: number;
    handlerId?: number;
  }) {
    const query = this.db
      .select()
      .from(formInstances)
      .where(
        or(
          params.creatorId ? eq(formInstances.userId, params.creatorId) : undefined,
          params.handlerId ? eq(formInstances.userId, params.handlerId) : undefined
        )
      );
    
    return await query;
  }
}

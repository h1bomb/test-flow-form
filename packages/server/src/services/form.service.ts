import { eq, or } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { formSpecs, formInstances, users } from '../schema';

interface FormSpec {
  id: number;
  name: string;
  formConfig: string;
  flowConfig: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface FormInstance {
  id: number;
  userId: number;
  formSpecId: number;
  currentStatus: string;
  formData: string;
  flowRemark: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface FormSpecCreateBody {
  name: string;
  formConfig: string;
  flowConfig: string;
}

interface FormInstanceCreateBody {
  userId: number;
  formSpecId: number;
  currentStatus: string;
  formData: string;
  flowRemark?: string;
}

interface FormInstanceUpdateBody {
  currentStatus?: string;
  flowRemark?: string;
}

interface QueryFormInstancesParams {
  creatorId?: number;
  handlerId?: number;
}

export class FormService {
  constructor(private db: MySql2Database) {}

  async saveFormSpec(data: FormSpecCreateBody): Promise<FormSpec> {
    const [result] = await this.db.insert(formSpecs).values({
      name: data.name,
      formConfig: data.formConfig,
      flowConfig: data.flowConfig,
    });

    // Fetch and return the created record
    const [createdSpec] = await this.db
      .select()
      .from(formSpecs)
      .where(eq(formSpecs.id, result.insertId as number));

    return createdSpec;
  }

  async saveFormInstance(data: FormInstanceCreateBody): Promise<FormInstance> {
    try {
      // Verify that the form spec exists
      const [formSpec] = await this.db
        .select()
        .from(formSpecs)
        .where(eq(formSpecs.id, data.formSpecId));

      if (!formSpec) {
        throw new Error(`Form spec with id ${data.formSpecId} not found`);
      }

      // Verify that the user exists
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, data.userId));

      if (!user) {
        throw new Error(`User with id ${data.userId} not found`);
      }

      const [result] = await this.db.insert(formInstances).values({
        userId: data.userId,
        formSpecId: data.formSpecId,
        currentStatus: data.currentStatus,
        formData: JSON.stringify(data.formData),
        flowRemark: data.flowRemark || null,
      });

      // Fetch and return the created record
      const [createdInstance] = await this.db
        .select()
        .from(formInstances)
        .where(eq(formInstances.id, result.insertId as number));

      return createdInstance;
    } catch (error) {
      console.error('Error saving form instance:', error);
      throw error;
    }
  }

  async updateFormInstance(id: number, data: FormInstanceUpdateBody): Promise<FormInstance> {
    try {
      // Verify that the form instance exists
      const [existingInstance] = await this.db
        .select()
        .from(formInstances)
        .where(eq(formInstances.id, id));

      if (!existingInstance) {
        throw new Error(`Form instance with id ${id} not found`);
      }

      // Only update fields that are provided
      const updateData: { currentStatus?: string; flowRemark?: string } = {};
      if (data.currentStatus !== undefined) updateData.currentStatus = data.currentStatus;
      if (data.flowRemark !== undefined) updateData.flowRemark = data.flowRemark;

      await this.db
        .update(formInstances)
        .set(updateData)
        .where(eq(formInstances.id, id));

      const [updatedInstance] = await this.db
        .select()
        .from(formInstances)
        .where(eq(formInstances.id, id));

      if (!updatedInstance) {
        throw new Error('Failed to update form instance');
      }

      return updatedInstance;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to update form instance: ${error.message}`);
      }
      throw new Error('Failed to update form instance: Unknown error');
    }
  }

  async queryFormInstances(params: QueryFormInstancesParams) {
    try {
      const query = this.db.select().from(formInstances);
      
      if (params.creatorId !== undefined || params.handlerId !== undefined) {
        const conditions = [];
        if (params.creatorId !== undefined) {
          conditions.push(eq(formInstances.userId, params.creatorId));
        }
        if (params.handlerId !== undefined) {
          conditions.push(eq(formInstances.userId, params.handlerId));
        }
        query.where(conditions.length === 1 ? conditions[0] : or(...conditions));
      }
      
      const results = await query;
      return results;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to query form instances: ${error.message}`);
      }
      throw new Error('Failed to query form instances: Unknown error');
    }
  }
}

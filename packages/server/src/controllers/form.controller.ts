import Router from 'koa-router';
import { FormService } from '../services/form.service';
import { Context } from 'koa';

interface FormSpecBody {
  name: string;
  formConfig: Record<string, any>;
  flowConfig: Record<string, any>;
}

interface FormInstanceBody {
  userId: number;
  formSpecId: number;
  currentStatus: string;
  formData: Record<string, any>;
  flowRemark?: string;
}

interface FormInstanceUpdateBody {
  currentStatus?: string;
  flowRemark?: string;
}

export function createFormController(formService: FormService) {
  const router = new Router({ prefix: '/api/forms' });

  // Save form specification
  router.post('/specs', async (ctx: Context) => {
    const { name, formConfig, flowConfig } = ctx.request.body as FormSpecBody;
    try {
      const result = await formService.saveFormSpec({
        name,
        formConfig: JSON.stringify(formConfig),
        flowConfig: JSON.stringify(flowConfig),
      });
      ctx.body = { success: true, data: result };
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  // Save form instance
  router.post('/instances', async (ctx: Context) => {
    const { userId, formSpecId, currentStatus, formData, flowRemark } = 
      ctx.request.body as FormInstanceBody;
    try {
      const result = await formService.saveFormInstance({
        userId,
        formSpecId,
        currentStatus,
        formData: JSON.stringify(formData),
        flowRemark,
      });
      ctx.body = { success: true, data: result };
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  // Update form instance
  router.put('/instances/:id', async (ctx: Context) => {
    const id = parseInt(ctx.params.id);
    const { currentStatus, flowRemark } = ctx.request.body as FormInstanceUpdateBody;
    try {
      const result = await formService.updateFormInstance(id, {
        currentStatus,
        flowRemark,
      });
      ctx.body = { success: true, data: result };
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  // Query form instances
  router.get('/instances', async (ctx: Context) => {
    const { creatorId, handlerId } = ctx.query;
    try {
      const result = await formService.queryFormInstances({
        creatorId: creatorId ? parseInt(creatorId as string) : undefined,
        handlerId: handlerId ? parseInt(handlerId as string) : undefined,
      });
      ctx.body = { success: true, data: result };
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  return router;
}

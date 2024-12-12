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

interface ErrorResponse {
  success: boolean;
  error: string;
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
    
    // Validate required fields
    if (!userId || !formSpecId || !currentStatus || !formData) {
      ctx.status = 400;
      ctx.body = { 
        success: false, 
        error: 'Missing required fields: userId, formSpecId, currentStatus, and formData are required' 
      };
      return;
    }

    try {
      const result = await formService.saveFormInstance({
        userId,
        formSpecId,
        currentStatus,
        formData: typeof formData === 'string' ? formData : JSON.stringify(formData),
        flowRemark,
      });

      // Parse formData back to object for response
      const responseData = {
        ...result,
        formData: result.formData
      };

      ctx.status = 200;
      ctx.body = { success: true, data: responseData };
    } catch (error: any) {
      if (error.message.includes('not found')) {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
      ctx.body = { success: false, error: error.message };
    }
  });

  // Update form instance
  router.put('/instances/:id', async (ctx: Context) => {
    const id = parseInt(ctx.params.id);
    const { currentStatus, flowRemark } = ctx.request.body as FormInstanceUpdateBody;
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'Invalid instance ID' };
      return;
    }

    try {
      const result = await formService.updateFormInstance(id, {
        currentStatus,
        flowRemark,
      });

      ctx.status = 200;
      ctx.body = { success: true, data: result };
    } catch (error: any) {
      if (error.message.includes('not found')) {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
      ctx.body = { success: false, error: error.message };
    }
  });

  // Query form instances
  router.get('/instances', async (ctx: Context) => {
    const { creatorId, handlerId } = ctx.query;
    
    // Validate query parameters
    if (creatorId && isNaN(parseInt(creatorId as string))) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'Invalid creatorId' };
      return;
    }
    
    if (handlerId && isNaN(parseInt(handlerId as string))) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'Invalid handlerId' };
      return;
    }

    try {
      const result = await formService.queryFormInstances({
        creatorId: creatorId ? parseInt(creatorId as string) : undefined,
        handlerId: handlerId ? parseInt(handlerId as string) : undefined,
      });
      ctx.body = { success: true, data: result };
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: error.message,
      };

      if (error.message.includes('not found')) {
        ctx.status = 404;
      } else if (error.message.includes('database')) {
        ctx.status = 503;
      } else {
        ctx.status = 500;
      }

      ctx.body = errorResponse;
    }
  });

  return router;
}

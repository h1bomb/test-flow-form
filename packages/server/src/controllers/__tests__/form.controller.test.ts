import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createFormController } from '../form.controller';
import { FormService } from '../../services/form.service';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import request from 'supertest';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { formSpecs, formInstances, users } from '../../schema';
import { eq } from 'drizzle-orm';
import config from '../../../drizzle.config';
import { resetDatabase } from 'src/utils/test-db';
import crypto from 'crypto';

describe('Form Controller Tests', () => {
  let app: Koa;
  let connection: any;
  let db: any;

  beforeAll(async () => {
    // 设置数据库连接
    connection = await mysql.createConnection({
      host: config.dbCredentials.host,
      user: config.dbCredentials.user,
      password: config.dbCredentials.password,
      database: config.dbCredentials.database,
      multipleStatements: true
    });
    db = drizzle(connection);

    // 确保数据库是干净的状态
    await resetDatabase(connection);

    // 设置应用
    app = new Koa();
    app.use(bodyParser());
    const formService = new FormService(db);
    const formController = createFormController(formService);
    app.use(formController.routes());
  });

  afterAll(async () => {
    if (connection) {
      // 清理数据库
      await resetDatabase(connection);
      // 关闭连接
      await connection.end();
    }
  });

  beforeEach(async () => {
    // 每个测试前重置数据库
    await resetDatabase(connection);

    // 创建测试用户
    const hashedPassword = crypto
      .createHash('sha256')
      .update('testpass')
      .digest('hex');

    await db.insert(users).values({
      username: 'testuser',
      password: hashedPassword
    });
  });

  describe('POST /api/forms/specs', () => {
    it('should successfully create a form specification', async () => {
      // Given a valid form spec data
      const formSpecData = {
        name: 'Test Form',
        formConfig: { fields: [{ name: 'field1', type: 'text' }] },
        flowConfig: { states: ['draft', 'submitted'] }
      };

      // When creating a new form spec
      const response = await request(app.callback())
        .post('/api/forms/specs')
        .send(formSpecData);

      // Then the response should indicate success
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(formSpecData.name);
      
      // And the form spec should exist in the database
      const dbFormSpec = await db.select().from(formSpecs).where(eq(formSpecs.id, response.body.data.id));
      expect(dbFormSpec).toHaveLength(1);
      expect(JSON.parse(dbFormSpec[0].formConfig)).toEqual(formSpecData.formConfig);
    });

    it('should handle invalid form spec data', async () => {
      // Given invalid form spec data (missing required fields)
      const invalidData = {
        name: 'Test Form'
        // Missing formConfig and flowConfig
      };

      // When trying to create with invalid data
      const response = await request(app.callback())
        .post('/api/forms/specs')
        .send(invalidData);

      // Then the response should indicate failure
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/forms/instances', () => {
    it('should successfully create a form instance', async () => {
      // Given an existing form spec
      const formSpecResponse = await request(app.callback())
        .post('/api/forms/specs')
        .send({
          name: 'Test Form',
          formConfig: { fields: [] },
          flowConfig: { states: ['draft', 'submitted'] }
        });

      expect(formSpecResponse.status).toBe(200);
      
      // And form instance data
      const formData = { field1: 'value1', field2: 'value2' };
      const formInstanceData = {
        userId: 1,
        formSpecId: formSpecResponse.body.data.id,
        currentStatus: 'draft',
        formData,
        flowRemark: 'Initial draft'
      };

      // When creating a new form instance
      const response = await request(app.callback())
        .post('/api/forms/instances')
        .send(formInstanceData);

      // Then the response should indicate success
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.currentStatus).toBe(formInstanceData.currentStatus);
      expect(response.body.data.userId).toBe(formInstanceData.userId);
      expect(response.body.data.formData).toBe(JSON.stringify(formData));
      expect(response.body.data.formSpecId).toBe(formInstanceData.formSpecId);
      expect(response.body.data.flowRemark).toBe(formInstanceData.flowRemark);
      
      // And the form instance should exist in the database
      const [dbFormInstance] = await db
        .select()
        .from(formInstances)
        .where(eq(formInstances.id, response.body.data.id));
      
      expect(dbFormInstance).toBeDefined();
      expect(dbFormInstance.currentStatus).toBe(formInstanceData.currentStatus);
      expect(dbFormInstance.userId).toBe(formInstanceData.userId);
      expect(dbFormInstance.formData).toBe(JSON.stringify(JSON.stringify(formData)));
      expect(dbFormInstance.formSpecId).toBe(formInstanceData.formSpecId);
      expect(dbFormInstance.flowRemark).toBe(formInstanceData.flowRemark);
    });

    it('should handle invalid form instance data', async () => {
      // Given invalid form instance data (missing required fields)
      const invalidData = {
        userId: 1,
        // Missing required formSpecId
        currentStatus: 'draft',
        formData: {}
      };

      // When trying to create with invalid data
      const response = await request(app.callback())
        .post('/api/forms/instances')
        .send(invalidData);

      // Then the response should indicate a bad request
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should handle non-existent form spec', async () => {
      // Given form instance data with non-existent formSpecId
      const invalidData = {
        userId: 1,
        formSpecId: 99999, // Non-existent ID
        currentStatus: 'draft',
        formData: { test: 'data' }
      };

      // When trying to create with invalid foreign key
      const response = await request(app.callback())
        .post('/api/forms/instances')
        .send(invalidData);

      // Then the response should indicate not found error
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle database errors', async () => {
      // Given form instance data that will cause a database error
      const invalidData = {
        userId: 999999, // Non-existent user ID
        formSpecId: 1,
        currentStatus: 'draft',
        formData: { test: 'data' }
      };

      // When trying to create with invalid data
      const response = await request(app.callback())
        .post('/api/forms/instances')
        .send(invalidData);

      // Then the response should indicate not found error
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /api/forms/instances/:id', () => {
    it('should successfully update a form instance', async () => {
      // Given an existing form instance
      const formSpecResponse = await request(app.callback())
        .post('/api/forms/specs')
        .send({
          name: 'Test Form',
          formConfig: { fields: [] },
          flowConfig: { states: [] }
        });
      
      const createInstanceResponse = await request(app.callback())
        .post('/api/forms/instances')
        .send({
          userId: 1,
          formSpecId: formSpecResponse.body.data.id,
          currentStatus: 'draft',
          formData: JSON.stringify({}),
          flowRemark: 'Initial draft'
        });
      
      // When updating the form instance
      const updateData = {
        currentStatus: 'submitted',
        flowRemark: 'Submitted for review'
      };
      
      const response = await request(app.callback())
        .put(`/api/forms/instances/${createInstanceResponse.body.data.id}`)
        .send(updateData);

      // Then the response should indicate success
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.currentStatus).toBe(updateData.currentStatus);
      expect(response.body.data.flowRemark).toBe(updateData.flowRemark);
    });

    it('should handle non-existent form instance', async () => {
      // When trying to update a non-existent form instance
      const response = await request(app.callback())
        .put('/api/forms/instances/999999')
        .send({
          currentStatus: 'submitted'
        });

      // Then the response should indicate failure
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/forms/instances', () => {
    it('should successfully query form instances by creator', async () => {
      // Given existing form instances
      const formSpecResponse = await request(app.callback())
        .post('/api/forms/specs')
        .send({
          name: 'Test Form',
          formConfig: { fields: [] },
          flowConfig: { states: ['draft', 'submitted'] }
        });

      expect(formSpecResponse.status).toBe(200);
      
      const instanceResponse = await request(app.callback())
        .post('/api/forms/instances')
        .send({
          userId: 1,
          formSpecId: formSpecResponse.body.data.id,
          formData: JSON.stringify({}),
          currentStatus: 'draft',
          flowRemark: 'Initial draft'
        });

      expect(instanceResponse.status).toBe(200);

      // When querying form instances by creator
      const response = await request(app.callback())
        .get('/api/forms/instances')
        .query({ creatorId: '1' });

      // Then the response should indicate success
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].userId).toBe(1);
    });

    it('should handle invalid query parameters', async () => {
      // When querying with invalid parameters
      const response = await request(app.callback())
        .get('/api/forms/instances')
        .query({ creatorId: 'invalid' });

      // Then the response should indicate failure
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});

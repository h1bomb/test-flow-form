import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createUserController } from '../user.controller';
import { UserService } from '../../services/user.service';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import request from 'supertest';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { users } from '../../schema';
import config from '../../../drizzle.config';
import { resetDatabase } from 'src/utils/test-db';

describe('User Controller Tests', () => {
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
    const userService = new UserService(db);
    const userController = createUserController(userService);
    app.use(userController.routes());
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
  });

  describe('POST /api/users/register', () => {
    it('should successfully register a new user', async () => {
      // Given a new user registration request
      const newUser = {
        username: 'testuser',
        password: 'testpass'
      };

      // When registering the user
      const response = await request(app.callback())
        .post('/api/users/register')
        .send(newUser);

      // Then the response should indicate success
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username', newUser.username);

      // And the user should exist in the database
      const dbUser = await db.select().from(users);
      expect(dbUser).toHaveLength(1);
    });

    it('should not register a user with duplicate username', async () => {
      // Given an existing user
      const existingUser = {
        username: 'testuser',
        password: 'testpass'
      };
      await request(app.callback())
        .post('/api/users/register')
        .send(existingUser);

      // When trying to register with the same username
      const response = await request(app.callback())
        .post('/api/users/register')
        .send(existingUser);

      // Then the response should indicate failure
      expect(response.status).toBe(409); // Changed from 400 to 409 for conflict
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      // Given an invalid user registration request
      const invalidUser = {
        username: '',
        password: ''
      };

      // When registering the user
      const response = await request(app.callback())
        .post('/api/users/register')
        .send(invalidUser);

      // Then the response should indicate validation failure
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/login', () => {
    it('should successfully login with correct credentials', async () => {
      // Given a registered user
      const userData = {
        username: 'logintest',
        password: 'password123'
      };
      await request(app.callback())
        .post('/api/users/register')
        .send(userData);

      // When logging in with correct credentials
      const response = await request(app.callback())
        .post('/api/users/login')
        .send(userData);

      // Then the response should indicate success
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.username).toBe(userData.username);
    });

    it('should fail login with incorrect password', async () => {
      // Given a registered user
      const userData = {
        username: 'wrongpass',
        password: 'password123'
      };
      await request(app.callback())
        .post('/api/users/register')
        .send(userData);

      // When logging in with wrong password
      const response = await request(app.callback())
        .post('/api/users/login')
        .send({
          username: userData.username,
          password: 'wrongpassword'
        });

      // Then the response should indicate failure
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });
  });
});

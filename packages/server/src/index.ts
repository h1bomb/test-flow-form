import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { createFormController } from './controllers/form.controller';
import { createUserController } from './controllers/user.controller';
import { FormService } from './services/form.service';
import { UserService } from './services/user.service';

const app = new Koa();
const router = new Router();

// Middleware
app.use(bodyParser());

// Database connection
const setupDatabase = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'test_flow_form'
  });

  return drizzle(connection);
};

// Initialize services and controllers
const initializeApp = async () => {
  const db = await setupDatabase();
  
  // Initialize services
  const formService = new FormService(db);
  const userService = new UserService(db);

  // Initialize controllers
  const formController = createFormController(formService);
  const userController = createUserController(userService);

  // Use controllers
  app.use(formController.routes());
  app.use(formController.allowedMethods());
  app.use(userController.routes());
  app.use(userController.allowedMethods());

  // Base route
  router.get('/', (ctx) => {
    ctx.body = { message: 'Welcome to Test Flow Form API' };
  });

  // Use router
  app.use(router.routes()).use(router.allowedMethods());

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

// Start the application
initializeApp().catch(console.error);

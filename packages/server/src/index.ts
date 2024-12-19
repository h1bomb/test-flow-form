import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import session from 'koa-session';
import { createFormController } from './controllers/form.controller';
import { createUserController } from './controllers/user.controller';
import { FormService } from './services/form.service';
import { UserService } from './services/user.service';
import { db } from './db';

const app = new Koa();
const router = new Router();

// Session configuration
app.keys = ['your-session-secret']; // 请更换为安全的密钥
const SESSION_CONFIG = {
  key: 'flow.sess',
  maxAge: 86400000, // 一天
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
  secure: false, // 开发环境设置为 false
  sameSite: 'lax' as const, // 允许跨站点 cookie
};

// Middleware
app.use(bodyParser());
app.use(session(SESSION_CONFIG, app));
app.use(cors({
  origin: 'http://localhost:5173', // 允许的前端域名
  credentials: true, // 允许携带认证信息
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));


// Initialize services and controllers
const initializeApp = async () => {  
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

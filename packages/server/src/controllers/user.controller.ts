import Router from 'koa-router';
import { UserService } from '../services/user.service';
import { Context } from 'koa';

interface UserAuthBody {
  username: string;
  password: string;
}

interface UserResponse {
  id: number;
  username: string;
}

export function createUserController(userService: UserService) {
  const router = new Router({ prefix: '/api/users' });

  // Register new user
  router.post('/register', async (ctx: Context) => {
    const { username, password } = ctx.request.body as UserAuthBody;
    
    // Validate required fields
    if (!username || !password) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'Username and password are required' };
      return;
    }

    try {
      const user = await userService.createUser({ username, password });
      ctx.status = 200;
      ctx.body = { success: true, data: user };
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        ctx.status = 409;
      } else {
        ctx.status = 500;
      }
      ctx.body = { success: false, error: error.message };
    }
  });

  // Login
  router.post('/login', async (ctx: Context) => {
    const { username, password } = ctx.request.body as UserAuthBody;
    try {
      const user = await userService.validateUser(username, password);
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, error: 'Invalid username or password' };
        return;
      }

      const userResponse: UserResponse = {
        id: user.id,
        username: user.username
      };

      ctx.body = { 
        success: true, 
        data: userResponse
      };
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  return router;
}

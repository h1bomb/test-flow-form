import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { users } from '../schema';
import crypto from 'crypto';

interface User {
  id: number;
  username: string;
  password: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface UserCreateBody {
  username: string;
  password: string;
}

interface UserResponse {
  id: number;
  username: string;
}

export class UserService {
  constructor(private db: MySql2Database) {}

  private async hashPassword(password: string): Promise<string> {
    return crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
  }

  async createUser(user: UserCreateBody): Promise<UserResponse> {
    // Check if user already exists
    const existingUser = await this.findUserByUsername(user.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(user.password);

    // Create user
    const result = await this.db.insert(users).values({
      username: user.username,
      password: hashedPassword
    });

    // Return created user
    return {
      id: Number(result[0].insertId),
      username: user.username
    };
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findUserByUsername(username);
    if (!user) return null;

    const hashedPassword = await this.hashPassword(password);
    if (user.password === hashedPassword) {
      return user;
    }
    return null;
  }
}

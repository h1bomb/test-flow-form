import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { users } from '../schema';
import * as crypto from 'crypto';

interface User {
  id: number;
  username: string;
  password: string;
  updatedAt: Date;
  createdAt: Date;
}

export class UserService {
  constructor(private db: MySql2Database) {}

  private hashPassword(password: string): string {
    return crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
  }

  async createUser(data: {
    username: string;
    password: string;
  }) {
    const hashedPassword = this.hashPassword(data.password);
    const [result] = await this.db.insert(users).values({
      username: data.username,
      password: hashedPassword,
    });
    return { id: Number(result) };
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0] as User | undefined;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findUserByUsername(username);
    if (!user) return null;

    const hashedPassword = this.hashPassword(password);
    if (user.password === hashedPassword) {
      return user;
    }
    return null;
  }
}

import 'dotenv/config';

import mysql from 'mysql2/promise';
import { resetDatabase } from '../utils/test-db';

export async function setup() {
  // 创建数据库连接
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);


  try {
    // 在所有测试开始前重置数据库
    await resetDatabase(connection);
  } finally {
    // 关闭连接
    await connection.end();
  }
}

export async function teardown() {
  // 创建数据库连接
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    // 在所有测试结束后清理
    await resetDatabase(connection);
  } finally {
    // 关闭连接
    await connection.end();
  }
}

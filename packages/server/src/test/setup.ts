import mysql from 'mysql2/promise';
import { resetDatabase } from '../utils/test-db';
import config from '../../drizzle.config';

export async function setup() {
  // 创建数据库连接
  const connection = await mysql.createConnection({
    host: config.dbCredentials.host,
    user: config.dbCredentials.user,
    password: config.dbCredentials.password,
    database: config.dbCredentials.database,
    multipleStatements: true
  });

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
  const connection = await mysql.createConnection({
    host: config.dbCredentials.host,
    user: config.dbCredentials.user,
    password: config.dbCredentials.password,
    database: config.dbCredentials.database,
    multipleStatements: true
  });

  try {
    // 在所有测试结束后清理
    await resetDatabase(connection);
  } finally {
    // 关闭连接
    await connection.end();
  }
}

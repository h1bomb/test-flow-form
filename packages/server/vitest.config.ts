import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 禁用并行执行
    sequence: {
      concurrent: false
    },
    // 单线程执行
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    // 设置测试超时时间（毫秒）
    testTimeout: 10000,
    // 在所有测试开始前执行全局设置
    globalSetup: './src/test/setup.ts',
    // 环境变量
    env: {
      NODE_ENV: 'test'
    }
  }
});

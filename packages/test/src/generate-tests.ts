import fs from 'fs';
import path from 'path';
import { TestGenerator } from './generators/test-generator';
import type { FormSpecification } from '../../client/src/types/form';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

interface CommandOptions {
  specId?: number;
  all?: boolean;
  output?: string;
}

function parseArgs(): CommandOptions {
  const args = process.argv.slice(2);
  const options: CommandOptions = {
    all: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--spec-id':
        options.specId = parseInt(args[++i]);
        break;
      case '--all':
        options.all = true;
        break;
      case '--help':
        showHelp();
        process.exit(0);
    }
  }

  if (!options.all && !options.specId) {
    console.error('错误: 必须指定 --spec-id 或 --all');
    showHelp();
    process.exit(1);
  }

  return options;
}

function showHelp() {
  console.log(`
用法: pnpm test:generate [选项]

选项:
  --spec-id <id>    生成指定ID的表单规格测试用例
  --all             生成所有表单规格的测试用例
  --help            显示帮助信息
`);
}

async function getFormSpecs(): Promise<FormSpecification[]> {
  const response = await fetch(`${API_BASE_URL}/forms/specs`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const { data } = await response.json();
  return data;
}

async function generateTests() {
  try {
    const options = parseArgs();
    const generator = new TestGenerator();
    
    // 获取所有表单配置
    const formSpecs = await getFormSpecs();
    const specsToGenerate = options.all 
      ? formSpecs 
      : formSpecs.filter(spec => spec.id === options.specId);

    if (specsToGenerate.length === 0) {
      console.error('未找到匹配的表单规格');
      process.exit(1);
    }
    
    // 为每个表单配置生成测试用例
    for (const spec of specsToGenerate) {
      console.log(`正在生成表单 "${spec.name}" (ID: ${spec.id}) 的测试用例...`);
      const testCase = generator.generateTestCase(spec);
      generator.generateTestFile(testCase);
    }
    
    console.log('测试用例生成完成');
  } catch (error) {
    console.error('生成测试用例失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件则执行生成
if (require.main === module) {
  generateTests();
}

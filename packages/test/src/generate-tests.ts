import { TestGenerator } from './generators/test-generator';
import { formApi } from '../../client/src/services/api';

async function generateTests() {
  try {
    const generator = new TestGenerator();
    
    // 获取所有表单配置
    const formSpecs = await formApi.getFormSpecs();
    
    // 为每个表单配置生成测试用例
    for (const formSpec of formSpecs) {
      const testCase = generator.generateTestCase(formSpec);
      const testFilePath = generator.generateTestFile(testCase);
      console.log(`Generated test file: ${testFilePath}`);
    }

    console.log('\nTest generation completed successfully!');
  } catch (error) {
    console.error('Error generating tests:', error);
    process.exit(1);
  }
}

generateTests();

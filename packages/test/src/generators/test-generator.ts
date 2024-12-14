import * as fs from 'fs';
import * as path from 'path';
import { faker } from '@faker-js/faker';
import type { FormSpecification } from '../../../client/src/types/form';


interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
}

interface FlowNode {
  id: string;
  type: string;
  name: string;
  handler: string;
}

interface FormConfig {
  fields: FormField[];
}

interface FlowConfig {
  nodes: FlowNode[];
}

interface TestUser {
  username: string;
  password: string;
  role: string;
}

interface TestCase {
  name: string;
  formSpec: FormSpecification;
  submitter: TestUser;
  approvers: TestUser[];
  testData: Record<string, any>;
}

export class TestGenerator {
  private users: TestUser[];

  constructor() {
    const usersData = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../test-data/users.json'), 'utf-8')
    );
    this.users = usersData.users;
  }

  private generateFieldValue(field: FormField): any {
    switch (field.type) {
      case 'input':
        return faker.lorem.words(3);
      case 'textarea':
        return faker.lorem.paragraph();
      default:
        return '';
    }
  }

  private getSubmitter(): TestUser {
    return this.users.find(user => user.role === 'submitter')!;
  }

  private getApprovers(count: number): TestUser[] {
    return this.users
      .filter(user => user.role === 'approver')
      .slice(0, count);
  }

  generateTestCase(formSpec: FormSpecification): TestCase {
    const testData: Record<string, any> = {};
    
    // 生成表单数据
    formSpec.formConfig.fields.forEach(field => {
      testData[field.id] = this.generateFieldValue(field);
    });

    // 获取处理人
    const submitter = this.getSubmitter();
    const approvers = this.getApprovers(formSpec.flowConfig.nodes.length - 2); // 减去开始和结束节点

    return {
      name: `Test case for form: ${formSpec.name}`,
      formSpec,
      submitter,
      approvers,
      testData,
    };
  }

  generateTestFile(testCase: TestCase) {
    const testContent = `
import { test, expect } from '@playwright/test';

const testCase = ${JSON.stringify(testCase, null, 2)};

test('Form submission and approval flow', async ({ page }) => {
  // 1. 提交者登录
  await test.step('Submitter login', async () => {
    await page.goto('/login');
    await page.getByLabel('用户名').fill(testCase.submitter.username);
    await page.getByLabel('密码').fill(testCase.submitter.password);
    await page.getByRole('button', { name: '登 录' }).click();
    // 等待导航完成
    await expect(page).toHaveURL('/forms', {timeout: 10000});
  });

  // 2. 创建表单实例
  let formInstanceId: string;
  await test.step('Create form instance', async () => {
    await page.goto(\`/forms/create/\${testCase.formSpec.id}\`);
    
    // 填写表单
    for (const [fieldId, value] of Object.entries(testCase.testData)) {
      const field = testCase.formSpec.formConfig.fields.find(f => f.id === fieldId);
      if (field) {
        await page.getByLabel(field.label).fill(value.toString());
      }
    }

    await page.getByRole('button', { name: '提 交' }).click();
    // 等待导航完成
    await page.waitForURL(/\\\/forms\\\/\\d+/, { timeout: 10000 });
    // 获取表单实例ID
    const url = page.url();
    formInstanceId = url.split('/').pop()!;
    await expect(page).toHaveURL(\`/forms/\${formInstanceId}\`, {timeout: 10000});
  });

  // 3. 审批流程
  for (const [index, approver] of testCase.approvers.entries()) {
    await test.step(\`Approval step \${index + 1}\`, async () => {
      // 登出当前用户
      await page.goto('/logout');
      
      // 审批人登录
      await page.goto('/login');
      await page.getByLabel('用户名').fill(approver.username);
      await page.getByLabel('密码').fill(approver.password);
      await page.getByRole('button', { name: '登 录' }).click();
      // 等待导航完成
      await expect(page).toHaveURL('/forms', {timeout: 10000});
      
      // 打开表单详情
      await page.goto(\`/forms/\${formInstanceId}\`);
      
      // 提交审批
      await page.getByRole('textbox', { name: '处理意见' }).fill('Approved');
      await page.getByRole('button', { name: '提 交' }).click();
      
      await expect(page).toHaveURL('/forms', {timeout: 10000});
    });
  }
});
`;

    const outputDir = path.resolve(__dirname, '../../tests/generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const testFilePath = path.join(
      outputDir,
      `form-${testCase.formSpec.id}.spec.ts`
    );
    
    fs.writeFileSync(testFilePath, testContent, 'utf-8');
    return testFilePath;
  }
}

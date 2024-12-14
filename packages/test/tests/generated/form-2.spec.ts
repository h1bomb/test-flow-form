
import { test, expect } from '@playwright/test';

const testCase = {
  "name": "Test case for form: 测试表单",
  "formSpec": {
    "id": 2,
    "name": "测试表单",
    "formConfig": {
      "fields": [
        {
          "id": "4ae2cbf8-0ac5-474e-8593-f47e0ce8746c",
          "type": "input",
          "label": "测试1",
          "required": true
        },
        {
          "id": "bffad9fd-6e69-44a8-a0e4-dcb4a6904eec",
          "type": "textarea",
          "label": "测试2",
          "required": false
        }
      ]
    },
    "flowConfig": {
      "nodes": [
        {
          "id": "start",
          "name": "开始",
          "type": "start"
        },
        {
          "id": "process",
          "name": "处理",
          "type": "process",
          "handler": "test"
        },
        {
          "id": "end",
          "name": "结束",
          "type": "end"
        }
      ]
    },
    "updatedAt": "2024-12-14T15:59:34.000Z",
    "createdAt": "2024-12-14T15:48:04.000Z"
  },
  "submitter": {
    "username": "test2",
    "password": "123321",
    "role": "submitter"
  },
  "approvers": [
    {
      "username": "test",
      "password": "123321",
      "role": "approver"
    }
  ],
  "testData": {
    "4ae2cbf8-0ac5-474e-8593-f47e0ce8746c": "asper cur sollers",
    "bffad9fd-6e69-44a8-a0e4-dcb4a6904eec": "Somniculosus illum adflicto censura utpote. Arbitro crux cunae sonitus corroboro. Veritatis tabesco numquam."
  }
};

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
    await page.goto(`/forms/create/${testCase.formSpec.id}`);
    
    // 填写表单
    for (const [fieldId, value] of Object.entries(testCase.testData)) {
      const field = testCase.formSpec.formConfig.fields.find(f => f.id === fieldId);
      if (field) {
        await page.getByLabel(field.label).fill(value.toString());
      }
    }

    await page.getByRole('button', { name: '提 交' }).click();
    // 等待导航完成
    await page.waitForURL(/\/forms\/\d+/, { timeout: 10000 });
    // 获取表单实例ID
    const url = page.url();
    formInstanceId = url.split('/').pop()!;
    await expect(page).toHaveURL(`/forms/${formInstanceId}`, {timeout: 10000});
  });

  // 3. 审批流程
  for (const [index, approver] of testCase.approvers.entries()) {
    await test.step(`Approval step ${index + 1}`, async () => {
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
      await page.goto(`/forms/${formInstanceId}`);
      
      // 提交审批
      await page.getByRole('textbox', { name: '处理意见' }).fill('Approved');
      await page.getByRole('button', { name: '提 交' }).click();
      
      await expect(page).toHaveURL('/forms', {timeout: 10000});
    });
  }
});

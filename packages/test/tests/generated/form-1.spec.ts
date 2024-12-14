
import { test, expect } from '@playwright/test';

const testCase = {
  "name": "Test case for form: 报销申请",
  "formSpec": {
    "id": 1,
    "name": "报销申请",
    "formConfig": {
      "fields": [
        {
          "id": "ce759f35-e859-4ac5-aeae-a7a6945f74b4",
          "type": "input",
          "label": "费用名称",
          "required": true
        },
        {
          "id": "a772b9c0-42bd-494e-8721-298aca50896b",
          "type": "textarea",
          "label": "理由",
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
          "name": "同意完成",
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
    "updatedAt": "2024-12-13T12:11:45.000Z",
    "createdAt": "2024-12-13T12:11:45.000Z"
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
    "ce759f35-e859-4ac5-aeae-a7a6945f74b4": "via sapiente defessus",
    "a772b9c0-42bd-494e-8721-298aca50896b": "Tremo ullam asporto tubineus depopulo cado vulgivagus. Ultra aveho vinculum cum capto vito suus utrum. Chirographum sufficio turba verus copia ara averto stillicidium solium."
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
    await expect(page).toHaveURL('/', {timeout: 10000});
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
      await expect(page).toHaveURL('/', {timeout: 10000});
      
      // 打开表单详情
      await page.goto(`/forms/${formInstanceId}`);
      
      // 提交审批
      await page.getByRole('textbox', { name: '处理意见' }).fill('Approved');
      await page.getByRole('button', { name: '提 交' }).click();
      
      await expect(page).toHaveURL('/forms');
    });
  }
});

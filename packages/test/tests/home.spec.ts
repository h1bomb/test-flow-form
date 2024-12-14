import { test, expect } from '@playwright/test';

test('home page has title and welcome message', async ({ page }) => {
  await page.goto('/');
  
  // Check title
  await expect(page).toHaveTitle('Test Flow Form');

});

import { test, expect } from '@playwright/test';

test('home page has title and welcome message', async ({ page }) => {
  await page.goto('/');
  
  // Check title
  await expect(page).toHaveTitle('Test Flow Form');
  
  // Check welcome message
  const welcomeMessage = page.getByText('Welcome to Test Flow Form');
  await expect(welcomeMessage).toBeVisible();
});

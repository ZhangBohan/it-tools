import { test, expect } from '@playwright/test';

test.describe('Tool - Jwt expire later', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jwt-expire-later');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Jwt expire later - IT Tools');
  });

  test('', async ({ page }) => {

  });
});
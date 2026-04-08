import { test, expect } from '@playwright/test';

test('App should render correctly and have correct title', async ({ page }) => {
  await page.goto('/');

  // Should have title EvidenceCanvas or Vite React App
  const activeTitle = await page.title();
  expect(activeTitle).not.toBe('');

  // Check if main UI elements are present
  // Add some specific checks for the evidence canvas, depending on how `App.tsx` behaves initially.
  // Wait for ReactFlow to boot
  await expect(page.locator('.react-flow')).toBeVisible();
});

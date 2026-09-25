import { expect, test } from '@playwright/test';

test('CV preview renders when newer Map helpers are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    delete (Map.prototype as Map<unknown, unknown> & { getOrInsertComputed?: unknown }).getOrInsertComputed;
    delete (WeakMap.prototype as WeakMap<object, unknown> & { getOrInsertComputed?: unknown }).getOrInsertComputed;
  });

  await page.goto('/');
  expect(
    await page.evaluate(
      () =>
        typeof (Map.prototype as Map<unknown, unknown> & { getOrInsertComputed?: unknown })
          .getOrInsertComputed,
    ),
  ).toBe('undefined');

  await page.getByRole('button', { name: 'Enter ZARAK_OS' }).click();
  await page.getByRole('navigation', { name: 'Application dock' }).getByRole('button', { name: 'CV.app' }).click();

  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Preview unavailable in this browser')).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'GRC' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'FDE' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'GTM + CS' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Tech Ops' })).toBeVisible();
});

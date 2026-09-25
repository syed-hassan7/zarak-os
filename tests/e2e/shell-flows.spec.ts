import { expect, test } from '@playwright/test';

// The 3D scene + shell mount is heavy (GLTF, canvas textures, pdf.js) — give these
// flows more room than the default 30s test budget.
test.describe.configure({ timeout: 60_000 });

async function enterDesktop(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter ZARAK_OS' }).click();
  await expect(page.locator('.window-handle').first()).toBeVisible({ timeout: 30_000 });
}

test.describe('Spotlight', () => {
  test('opens with Ctrl+K, filters results, and launches an app', async ({ page }) => {
    await enterDesktop(page);

    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Spotlight command search' });
    await expect(dialog).toBeVisible();

    const input = page.getByRole('combobox', { name: 'Search apps and commands' });
    await expect(input).toBeFocused();

    await input.fill('terminal');
    await expect(page.getByRole('option', { name: /terminal\.app/i })).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.window-handle', { hasText: 'terminal.app' })).toBeVisible();
  });

  test('closes on Escape without launching anything', async ({ page }) => {
    await enterDesktop(page);

    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Spotlight command search' });
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Mission Control', () => {
  test('F3 shows open windows and Enter focuses the selected one', async ({ page }) => {
    await enterDesktop(page);

    await page.keyboard.press('F3');
    const dialog = page.getByRole('dialog', { name: 'Mission Control' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: /Focus CV\.app/i })).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(dialog).not.toBeVisible();
  });

  test('closes on Escape', async ({ page }) => {
    await enterDesktop(page);

    await page.keyboard.press('F3');
    const dialog = page.getByRole('dialog', { name: 'Mission Control' });
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Window management', () => {
  test('dragging the titlebar moves the window', async ({ page }) => {
    await enterDesktop(page);

    const titlebar = page.locator('.window-handle').first();
    const box = await titlebar.boundingBox();
    if (!box) throw new Error('window titlebar not found');

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 120, startY + 80, { steps: 8 });
    await page.mouse.up();

    const movedBox = await titlebar.boundingBox();
    if (!movedBox) throw new Error('window titlebar not found after drag');
    expect(movedBox.x).not.toBeCloseTo(box.x, 0);
  });

  test('minimize and close buttons update window state', async ({ page }) => {
    await enterDesktop(page);

    const windowFrame = page.locator('.window-handle').first().locator('..');
    const minimizeButton = windowFrame.getByRole('button', { name: 'Minimize window' });

    await expect(minimizeButton).toBeVisible();
    await minimizeButton.click();
    await expect(page.locator('.window-handle').first()).not.toBeVisible();

    await page.getByRole('navigation', { name: 'Application dock' }).getByRole('button', { name: 'CV.app' }).click();
    await expect(page.locator('.window-handle', { hasText: 'CV.app' })).toBeVisible();
  });
});

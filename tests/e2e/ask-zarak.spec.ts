import { expect, test, type Page } from '@playwright/test';

async function unlockWorkstation(page: Page) {
  await page.addInitScript((concurrency) => {
    Object.defineProperty(window.navigator, 'hardwareConcurrency', {
      configurable: true,
      get: () => concurrency,
    });
  }, 2);
  await page.goto('/');
  await page.getByRole('button', { name: 'Unlock Workstation' }).click();
  await expect(page.getByRole('navigation', { name: 'Application dock' })).toBeVisible();
}

async function openAskZarak(page: Page) {
  await page.getByRole('button', { name: 'Ask Zarak' }).click();
  await expect(page.getByText('ask-zarak.app').first()).toBeVisible();
}

test('floating Ask Zarak launcher is visible on desktop', async ({ page }) => {
  await unlockWorkstation(page);
  await expect(page.getByRole('button', { name: 'Ask Zarak' })).toBeVisible();
});

test('launcher opens ask-zarak.app window', async ({ page }) => {
  await unlockWorkstation(page);
  await openAskZarak(page);
  await expect(page.getByPlaceholder(/ask about zarak/i)).toBeVisible();
});

test('starter question returns verified answer', async ({ page }) => {
  await unlockWorkstation(page);
  await openAskZarak(page);

  await page.getByRole('button', { name: /Why should we hire Zarak/i }).click();

  await expect(page.getByText(/Why hire Zarak/i)).toBeVisible();
  await expect(page.getByText(/VenderScope/i).first()).toBeVisible();
});

test('unknown question refuses safely', async ({ page }) => {
  await unlockWorkstation(page);
  await openAskZarak(page);

  await page.getByPlaceholder(/ask about zarak/i).fill("What is Zarak's favourite restaurant?");
  await page.getByRole('button', { name: 'Ask' }).click();

  await expect(page.getByText(/I don't have verified data/i)).toBeVisible();
});

test('"where can I view his CV" returns CV answer', async ({ page }) => {
  await unlockWorkstation(page);
  await openAskZarak(page);

  await page.getByPlaceholder(/ask about zarak/i).fill('where can I view his CV');
  await page.getByRole('button', { name: 'Ask' }).click();

  await expect(page.getByText(/View Zarak.*CV/i).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Open CV\.app/i }).first()).toBeVisible();
});

test('"What has Zarak built?" returns projects answer', async ({ page }) => {
  await unlockWorkstation(page);
  await openAskZarak(page);

  await page.getByPlaceholder(/ask about zarak/i).fill('What has Zarak built?');
  await page.getByRole('button', { name: 'Ask' }).click();

  await expect(page.getByText(/Projects Zarak has built/i)).toBeVisible();
  await expect(page.getByText(/VenderScope/i).first()).toBeVisible();
});

test('"What customer-facing experience does Zarak have?" returns customer success answer', async ({
  page,
}) => {
  await unlockWorkstation(page);
  await openAskZarak(page);

  await page
    .getByPlaceholder(/ask about zarak/i)
    .fill('What customer-facing experience does Zarak have?');
  await page.getByRole('button', { name: 'Ask' }).click();

  await expect(page.getByText(/customer/i).first()).toBeVisible();
  await expect(page.getByText(/Thrive/i).first()).toBeVisible();
});

test('internal instruction text does not appear in answers', async ({ page }) => {
  await unlockWorkstation(page);
  await openAskZarak(page);

  await page.getByPlaceholder(/ask about zarak/i).fill('How can I contact him?');
  await page.getByRole('button', { name: 'Ask' }).click();

  await expect(page.getByText(/assistant should recommend/i)).not.toBeVisible();
  await expect(page.getByText(/For recruiters/i)).not.toBeVisible();
  await expect(page.getByText(/Note: The exact institution/i)).not.toBeVisible();
});

test('Spotlight can find ask-zarak.app', async ({ page }) => {
  await unlockWorkstation(page);

  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+K`);
  await page.getByRole('combobox', { name: 'Search apps and commands' }).fill('ask zarak');

  await expect(page.getByText('ask-zarak.app').first()).toBeVisible();
});

test('quick action buttons do not crash', async ({ page }) => {
  await unlockWorkstation(page);
  await openAskZarak(page);

  await page.getByRole('button', { name: /Where can I view his CV/i }).click();

  await expect(page.getByText(/CV/i).first()).toBeVisible();
  const actionButtons = page.getByRole('button', { name: /Open CV\.app/i });
  if ((await actionButtons.count()) > 0) {
    await actionButtons.first().click();
  }

  await expect(page.getByText('ask-zarak.app').first()).toBeVisible();
});

test('starter cards collapse to chips after first message', async ({ page }) => {
  await unlockWorkstation(page);
  await openAskZarak(page);

  await page.getByRole('button', { name: /Why should we hire Zarak/i }).click();
  await expect(page.getByText(/Why hire Zarak/i)).toBeVisible();

  const chips = page.locator('button').filter({ hasText: /Where can I view his CV/i });
  await expect(chips.first()).toBeVisible();
});

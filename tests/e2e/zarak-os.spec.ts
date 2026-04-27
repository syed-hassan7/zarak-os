import { expect, test, type Page } from '@playwright/test';

const DOCK_APPS = [
  'skills.app',
  'terminal.app',
  'venderscope.browser',
  'contact.ssh',
  'CV.app',
  'linkedin-experience.app',
  'about.txt',
];

const APP_SMOKE_CASES = [
  {
    appName: 'skills.app',
    assertions: ['Capability map', 'Verified credentials'],
  },
  {
    appName: 'venderscope.browser',
    assertions: ['venderscope - continuous vendor risk intelligence', 'Open live site'],
  },
  {
    appName: 'contact.ssh',
    assertions: ['Initiate Connection', 'syedzrk1000@gmail.com'],
  },
  {
    appName: 'CV.app',
    assertions: ['Syed_Zarak_Hassan_CV_2026.pdf', 'Open in new tab'],
  },
  {
    appName: 'linkedin-experience.app',
    assertions: ['Static profile snapshot', 'Connect on LinkedIn'],
  },
  {
    appName: 'about.txt',
    assertions: ['Operator profile', 'Syed Zarak Hassan'],
  },
];

async function openFlatApp(page: Page) {
  await openAppWithHardwareConcurrency(page, 2);
}

async function openAppWithHardwareConcurrency(page: Page, hardwareConcurrency: number) {
  await page.addInitScript((reportedHardwareConcurrency) => {
    Object.defineProperty(window.navigator, 'hardwareConcurrency', {
      configurable: true,
      get: () => reportedHardwareConcurrency,
    });
  }, hardwareConcurrency);
  await page.goto('/');
}

async function unlockWorkstation(page: Page) {
  await openFlatApp(page);
  await page.getByRole('button', { name: 'Unlock Workstation' }).click();
  await expect(page.getByRole('navigation', { name: 'Application dock' })).toBeVisible();
}

async function openDockApp(page: Page, appName: string) {
  const dock = page.getByRole('navigation', { name: 'Application dock' });
  await dock.getByRole('button', { name: appName }).click();
}

test('app loads', async ({ page }) => {
  await openFlatApp(page);

  await expect(page.getByRole('img', { name: 'ZARAK_OS Logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Unlock Workstation' })).toBeVisible();
});

test('login startup flow reaches the desktop', async ({ page }) => {
  await unlockWorkstation(page);

  await expect(page.getByRole('button', { name: 'ZARAK_OS' })).toBeVisible();
  await expect(page.getByText('terminal.app').first()).toBeVisible();
});

test('dock app icons are visible', async ({ page }) => {
  await unlockWorkstation(page);

  const dock = page.getByRole('navigation', { name: 'Application dock' });
  for (const appName of DOCK_APPS) {
    await expect(dock.getByRole('button', { name: appName })).toBeVisible();
  }
});

test('Spotlight opens with Cmd/Ctrl+K', async ({ page }) => {
  await unlockWorkstation(page);

  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+K`);

  const spotlight = page.getByRole('dialog', { name: 'Spotlight command search' });
  await expect(spotlight).toBeVisible();
  await expect(spotlight.getByRole('combobox', { name: 'Search apps and commands' })).toBeFocused();
});

test('Mission Control opens with Cmd/Ctrl+ArrowUp', async ({ page }) => {
  await unlockWorkstation(page);

  await page.getByRole('button', { name: /ZARAK_OS/ }).click();
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+ArrowUp`);

  const missionControl = page.getByRole('dialog', { name: 'Mission Control' });
  await expect(missionControl).toBeVisible();
  await expect(missionControl.getByRole('button', { name: 'Focus terminal.app' })).toBeVisible();
});

test('dock apps open and show their main content', async ({ page }) => {
  await unlockWorkstation(page);

  await expect(page.getByRole('textbox', { name: 'Terminal command input' })).toBeVisible();

  for (const { appName, assertions } of APP_SMOKE_CASES) {
    await openDockApp(page, appName);
    for (const text of assertions) {
      await expect(page.getByText(text).first()).toBeVisible();
    }
  }
});

test('Spotlight search can open an app command', async ({ page }) => {
  await unlockWorkstation(page);

  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+K`);
  await page.getByRole('combobox', { name: 'Search apps and commands' }).fill('about');
  await page.keyboard.press('Enter');

  await expect(page.getByText('Operator profile')).toBeVisible();
  await expect(page.getByText('Secure links')).toBeVisible();
});

test('window controls minimize, restore, and close an app', async ({ page }) => {
  await unlockWorkstation(page);

  const terminalInput = page.getByRole('textbox', { name: 'Terminal command input' });
  await expect(terminalInput).toBeVisible();

  await page.getByRole('button', { name: 'Minimize window' }).click();
  await expect(terminalInput).toBeHidden();

  await openDockApp(page, 'terminal.app');
  await expect(terminalInput).toBeVisible();

  await page.getByRole('button', { name: 'Close window' }).click();
  await expect(terminalInput).toBeHidden();
});

test('terminal commands render expected output and can launch apps', async ({ page }) => {
  await unlockWorkstation(page);

  const terminalInput = page.getByRole('textbox', { name: 'Terminal command input' });
  await terminalInput.fill('help');
  await terminalInput.press('Enter');
  await expect(page.getByText('available commands:')).toBeVisible();

  await terminalInput.fill('cat skills.txt');
  await terminalInput.press('Enter');
  await expect(page.getByText('FRAMEWORKS iso 27001')).toBeVisible();
  await expect(page.getByText('CERTIFICATIONS')).toBeVisible();

  await terminalInput.fill('open venderscope');
  await terminalInput.press('Enter');
  await expect(page.getByText('connection established.')).toBeVisible();
  await expect(page.getByText('venderscope - continuous vendor risk intelligence')).toBeVisible();
});

test('CV and LinkedIn apps expose the expected recruiter actions', async ({ page }) => {
  await unlockWorkstation(page);

  await openDockApp(page, 'CV.app');
  await expect(page.getByRole('button', { name: 'Download PDF' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open in new tab' }).first()).toHaveAttribute(
    'href',
    '/Syed_Zarak_Hassan_CV_2026.pdf',
  );

  await openDockApp(page, 'linkedin-experience.app');
  await expect(page.getByRole('link', { name: 'Connect on LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/zarak-hassan7/',
  );
});

test('mobile viewport uses terminal fallback mode', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAppWithHardwareConcurrency(page, 8);

  await page.getByRole('button', { name: 'Unlock Workstation' }).click();

  await expect(page.getByText(/best experienced on desktop/i)).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Terminal command input' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Application dock' })).toBeHidden();
});

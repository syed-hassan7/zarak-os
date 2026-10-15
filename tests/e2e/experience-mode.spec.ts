import { expect, test, devices, type Page } from '@playwright/test';

// Regression: touch-screen laptops (navigator.maxTouchPoints > 0 but with a
// trackpad/mouse present) used to be sent to the mobile shell. The experience
// mode must follow the *available inputs*, not the mere existence of a touchscreen.
test.describe.configure({ timeout: 60_000 });

type MediaOverrides = Record<string, boolean>;

/** Spoofs hardware signals before any app script runs. */
async function spoofInput(
  page: Page,
  opts: { maxTouchPoints: number; media?: MediaOverrides },
) {
  await page.addInitScript(
    ({ maxTouchPoints, media }) => {
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => maxTouchPoints });
      const realMatchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query: string) => {
        const key = query.replace(/\s+/g, '');
        if (key in media) {
          return {
            matches: media[key],
            media: query,
            onchange: null,
            addEventListener() {},
            removeEventListener() {},
            addListener() {},
            removeListener() {},
            dispatchEvent: () => false,
          } as unknown as MediaQueryList;
        }
        return realMatchMedia(query);
      };
    },
    { maxTouchPoints: opts.maxTouchPoints, media: opts.media ?? {} },
  );
}

async function login(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter ZARAK_OS' }).click();
}

test.describe('Experience mode detection', () => {
  test('touch-screen laptop (touch points + trackpad) gets the desktop shell', async ({ page }) => {
    await spoofInput(page, {
      maxTouchPoints: 10,
      media: {
        '(pointer:fine)': true,
        '(hover:hover)': true,
        '(any-pointer:fine)': true,
        '(any-pointer:coarse)': true,
        '(any-hover:hover)': true,
      },
    });
    await login(page);
    await expect(page.locator('.window-handle').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Recruiter touch shell')).toHaveCount(0);
  });

  test('2-in-1 in tablet posture (primary pointer coarse, trackpad attached) stays desktop', async ({
    page,
  }) => {
    await spoofInput(page, {
      maxTouchPoints: 10,
      media: {
        '(pointer:coarse)': true,
        '(pointer:fine)': false,
        '(hover:none)': true,
        '(hover:hover)': false,
        '(any-pointer:fine)': true,
        '(any-hover:hover)': true,
      },
    });
    await login(page);
    await expect(page.locator('.window-handle').first()).toBeVisible({ timeout: 30_000 });
  });

  test('touch-only tablet with a desktop user agent gets the mobile shell', async ({ page }) => {
    await spoofInput(page, {
      maxTouchPoints: 5,
      media: {
        '(pointer:coarse)': true,
        '(pointer:fine)': false,
        '(hover:none)': true,
        '(hover:hover)': false,
        '(any-pointer:fine)': false,
        '(any-hover:hover)': false,
      },
    });
    await login(page);
    await expect(page.getByText('Recruiter touch shell')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.window-handle')).toHaveCount(0);
  });
});

test.describe('Experience mode detection — phones', () => {
  // Strip defaultBrowserType (webkit) — it can't be changed inside a describe group.
  const { defaultBrowserType: _ignored, ...iPhone } = devices['iPhone 13'];
  test.use(iPhone);

  test('phone gets the mobile shell', async ({ page }) => {
    await login(page);
    await expect(page.getByText('Recruiter touch shell')).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('Experience mode detection — narrow desktop window', () => {
  test.use({ viewport: { width: 600, height: 900 } });

  test('narrow viewport still falls back to the mobile shell', async ({ page }) => {
    await login(page);
    await expect(page.getByText('Recruiter touch shell')).toBeVisible({ timeout: 30_000 });
  });
});

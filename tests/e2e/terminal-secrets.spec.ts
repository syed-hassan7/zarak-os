import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ timeout: 60_000 });

async function openTerminal(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter ZARAK_OS' }).click();
  await expect(page.locator('.window-handle').first()).toBeVisible({ timeout: 30_000 });
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox', { name: 'Search apps and commands' }).fill('terminal');
  await page.keyboard.press('Enter');
  const input = page.getByLabel('Terminal command input');
  await expect(input).toBeVisible();
  return input;
}

async function run(page: Page, cmd: string) {
  const input = page.getByLabel('Terminal command input');
  await input.fill(cmd);
  await input.press('Enter');
}

const output = (page: Page) => page.locator('[aria-live="polite"]').last();

test.describe('terminal hidden-command discovery', () => {
  test('help advertises `secrets`; `secrets` starts at 0/7 with hints that never name a command', async ({ page }) => {
    await openTerminal(page);
    await run(page, 'help');
    await expect(output(page)).toContainText('secrets — hidden-command log');

    await run(page, 'secrets');
    await expect(output(page)).toContainText('hidden commands: 0/7 found');
    const text = await output(page).innerText();
    for (const name of ['override', 'decrypt', '.bash_history']) {
      // hints may mention generic clue sources, but never the locked command itself
      const hintLines = text.split('\n').filter((l) => l.includes('hint:'));
      expect(hintLines.some((l) => l.includes(`${name} `) || l.endsWith(name))).toBe(false);
    }
  });

  test('running a hidden command unlocks it once, updates the counter, and persists across reload', async ({ page }) => {
    await openTerminal(page);

    await run(page, 'override');
    await expect(output(page)).toContainText("[secret unlocked 1/7] type 'secrets' to track them");

    // second run of the same secret does not double count
    await run(page, 'override');
    await expect(output(page).getByText(/\[secret unlocked/)).toHaveCount(1);

    await run(page, 'cat .bash_history');
    await expect(output(page)).toContainText('[secret unlocked 2/7]');

    await run(page, 'secrets');
    await expect(output(page)).toContainText('hidden commands: 2/7 found');
    await expect(output(page)).toContainText('[x] override');
    await expect(output(page)).toContainText('[x] cat .bash_history');

    await page.reload();
    const input = await openTerminal(page);
    await input.fill('secrets');
    await input.press('Enter');
    await expect(output(page)).toContainText('hidden commands: 2/7 found');
  });

  test('breadcrumb chain: ls -la -> .bash_history leads on to override/decrypt', async ({ page }) => {
    await openTerminal(page);
    await run(page, 'ls -la');
    await expect(output(page)).toContainText('.bash_history');
    await run(page, 'cat .bash_history');
    await expect(output(page)).toContainText('dec▓▓▓▓▓ classified.txt');
    await expect(output(page)).toContainText('ov▓▓▓▓▓▓▓');
  });

  test('Tab completes advertised commands but does not leak undiscovered secrets', async ({ page }) => {
    const input = await openTerminal(page);

    await input.fill('neo');
    await input.press('Tab');
    await expect(input).toHaveValue('neofetch');

    // `over` has exactly one possible match, but it's an undiscovered secret -> no completion
    await input.fill('over');
    await input.press('Tab');
    await expect(input).toHaveValue('over');
    // ...and Tab then falls through to normal focus movement (no keyboard trap)
    await expect(input).not.toBeFocused();

    // after finding it, it completes
    await page.getByLabel('Terminal command input').fill('override');
    await page.getByLabel('Terminal command input').press('Enter');
    const again = page.getByLabel('Terminal command input');
    await again.fill('over');
    await again.press('Tab');
    await expect(again).toHaveValue('override');
  });

  test('Tab with ambiguous prefix completes the common part, then lists candidates', async ({ page }) => {
    const input = await openTerminal(page);
    await input.fill('cat s');
    await input.press('Tab');
    await expect(input).toHaveValue('cat skills.txt');

    await input.fill('n');
    await input.press('Tab'); // neofetch / nmap szh_os -> no common prefix beyond 'n'
    await expect(output(page)).toContainText('neofetch');
    await expect(output(page)).toContainText('nmap szh_os');
    await expect(output(page)).not.toContainText('nmap localhost');
  });
});

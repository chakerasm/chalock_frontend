import { expect, test } from '@playwright/test'

test('switches language and color mode from the application header', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  await page.getByLabel('Language').selectOption('fr')
  await expect(
    page.getByRole('heading', {
      name: /^(Bonjour|Bon apres-midi|Bonsoir), Alex$/,
    }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Aujourd hui' })).toBeVisible()
})

test('opens the application version information dialog', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Application information' }).click()
  await page.getByRole('menuitem', { name: 'Version' }).click()

  const dialog = page.getByRole('dialog', { name: 'Application version' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('0.1.0')
})

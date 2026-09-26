import { expect, test } from '@playwright/test'

test('renders the application home page', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /focused starting point/i }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
})

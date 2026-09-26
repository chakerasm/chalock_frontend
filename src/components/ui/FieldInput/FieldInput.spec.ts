import { expect, test } from '@playwright/test'

test('FieldInput binds text and exposes its helper text', async ({ page }) => {
  await page.goto('/fields')
  await page.getByLabel('User name').fill('Ada Lovelace')
  await expect(page.getByText('Use a descriptive value.')).toBeVisible()
  await expect(page.getByTestId('form-values')).toContainText('Ada Lovelace')
})

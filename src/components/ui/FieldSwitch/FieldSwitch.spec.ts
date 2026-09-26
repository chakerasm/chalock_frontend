import { expect, test } from '@playwright/test'

test('FieldSwitch toggles a boolean value', async ({ page }) => {
  await page.goto('/fields')
  await page.getByText('Email notifications', { exact: true }).click()
  await expect(page.getByTestId('form-values')).toContainText(
    '"notifications":true',
  )
})

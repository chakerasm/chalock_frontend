import { expect, test } from '@playwright/test'

test('FieldCheckbox toggles a boolean value', async ({ page }) => {
  await page.goto('/fields')
  await page.getByText('Accept terms', { exact: true }).click()
  await expect(page.getByTestId('form-values')).toContainText(
    '"termsAccepted":true',
  )
})

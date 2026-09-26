import { expect, test } from '@playwright/test'

test('FieldRadioGroup changes the selected option', async ({ page }) => {
  await page.goto('/fields')
  await page.getByText('Professional', { exact: true }).click()
  await expect(page.getByTestId('form-values')).toContainText(
    '"plan":"professional"',
  )
})

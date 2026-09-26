import { expect, test } from '@playwright/test'

test('FieldInputNumber updates a numeric value with its increment control', async ({
  page,
}) => {
  await page.goto('/fields')
  await page.getByRole('button', { name: 'Increase Age' }).click()
  await expect(page.getByTestId('form-values')).toContainText('"age":19')
})

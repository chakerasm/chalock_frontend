import { expect, test } from '@playwright/test'

test('FieldSelect selects an option', async ({ page }) => {
  await page.goto('/fields')
  await page.getByLabel('Role').selectOption('editor')
  await expect(page.getByTestId('form-values')).toContainText('"role":"editor"')
})

import { expect, test } from '@playwright/test'

test('FieldTextarea binds multiline content', async ({ page }) => {
  await page.goto('/fields')
  await page.getByLabel('Biography').fill('A mathematician and programmer.')
  await expect(page.getByTestId('form-values')).toContainText(
    'A mathematician and programmer.',
  )
})

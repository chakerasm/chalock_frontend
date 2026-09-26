import { expect, test } from '@playwright/test'

test('FieldPassword changes visibility and preserves its value', async ({
  page,
}) => {
  await page.goto('/fields')
  const password = page.getByRole('textbox', { name: 'Password' })
  await password.fill('s3cret')
  await expect(password).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Show Password' }).click()
  await expect(password).toHaveAttribute('type', 'text')
  await expect(page.getByTestId('form-values')).toContainText(
    '"password":"s3cret"',
  )
})

import { expect, test } from '@playwright/test'

test('FieldDatePicker stores a calendar date and limits future selections', async ({
  page,
}) => {
  await page.goto('/fields')
  const dateOfBirth = page.getByLabel('Date of birth')

  await expect(dateOfBirth).toHaveAttribute('max', /^\d{4}-\d{2}-\d{2}$/)
  await dateOfBirth.fill('1990-12-10')

  await expect(page.getByTestId('form-values')).toContainText(
    '"dateOfBirth":"1990-12-10"',
  )
})

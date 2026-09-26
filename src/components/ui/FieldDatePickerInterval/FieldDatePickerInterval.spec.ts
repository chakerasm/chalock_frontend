import { expect, test } from '@playwright/test'

test('FieldDatePickerInterval stores dates and rejects an end date before its start', async ({
  page,
}) => {
  await page.goto('/fields')
  const startDate = page.getByLabel('Start date')
  const endDate = page.getByLabel('End date')

  await startDate.fill('2026-08-31')
  await endDate.fill('2026-08-01')
  await endDate.blur()

  await expect(
    page.getByText('End date must not be before start date.'),
  ).toBeVisible()
  await expect(endDate).toHaveAttribute('min', '2026-08-31')

  await endDate.fill('2026-08-31')
  await expect(page.getByTestId('form-values')).toContainText(
    '"availabilityStart":"2026-08-31"',
  )
  await expect(page.getByTestId('form-values')).toContainText(
    '"availabilityEnd":"2026-08-31"',
  )
})

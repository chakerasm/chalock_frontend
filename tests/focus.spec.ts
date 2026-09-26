import { expect, test } from '@playwright/test'

test('keeps an active stopwatch after a page refresh', async ({ page }) => {
  await page.goto('/focus')

  await expect(page.getByRole('heading', { name: 'Focus' })).toBeVisible()
  await page.getByRole('button', { name: 'Start stopwatch' }).click()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible()
  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(page.getByText('00:00')).toBeVisible()
})

test('starts and controls a preset countdown timer', async ({ page }) => {
  await page.goto('/focus')

  await page.getByRole('button', { name: 'Start timer' }).click()
  await expect(page.getByText('Original: 25:00')).toBeVisible()
  await expect(page.getByText('Remaining time')).toBeVisible()

  await page.getByRole('button', { name: 'Pause' }).click()
  await page.getByRole('button', { name: 'Restart' }).click()
  await expect(page.getByRole('button', { name: 'Cancel timer' })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel timer' }).click()
  await expect(
    page.getByRole('button', { name: 'Start stopwatch' }),
  ).toBeVisible()
})

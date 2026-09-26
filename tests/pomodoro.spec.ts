import { expect, test } from '@playwright/test'

test('keeps an active Pomodoro focus phase after a refresh', async ({
  page,
}) => {
  await page.goto('/focus/pomodoro')

  await expect(page.getByText('Ready when you are')).toBeVisible()
  await page
    .getByRole('textbox', { name: 'What do you want to focus on? (optional)' })
    .fill('Study chapter 4')
  await page.getByRole('button', { name: 'Start focus' }).click()

  await expect(page.getByText('25:00')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  await expect(page.getByText('Study chapter 4')).toBeVisible()
})

test('skips a focus phase without counting it and records cancellation clearly', async ({
  page,
}) => {
  await page.goto('/focus/pomodoro')
  await page.getByRole('button', { name: 'Start focus' }).click()

  await page.getByRole('button', { name: 'Skip phase' }).click()
  await expect(page.getByText('Short break')).toBeVisible()
  await expect(page.getByText('Skipped')).toBeVisible()

  await page.getByRole('button', { name: 'Stop & cancel' }).click()
  await expect(page.getByText('Pomodoro session cancelled')).toBeVisible()
})

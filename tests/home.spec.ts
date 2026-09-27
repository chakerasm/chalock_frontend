import { expect, test } from '@playwright/test'
import { APP_ROUTES } from '../src/lib/routes'

test('renders the Today dashboard and completes a task', async ({ page }) => {
  await page.goto(APP_ROUTES.home)

  await expect(page.getByRole('heading', { name: /good/i })).toBeVisible()
  await expect(page.getByText('Today’s tasks')).toBeVisible()
  await expect(page.getByText('Focus in progress')).toBeVisible()

  const taskCheckbox = page.getByRole('checkbox', {
    name: 'Review project brief',
  })
  await page.getByText('Review project brief', { exact: true }).click()
  await expect(taskCheckbox).toBeChecked()
})

import { expect, test } from '@playwright/test'

test('renders the Today dashboard and completes a task', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /good/i })).toBeVisible()
  await expect(page.getByText('Today’s tasks')).toBeVisible()
  await expect(page.getByText('Focus in progress')).toBeVisible()

  const taskCheckbox = page.getByRole('checkbox', {
    name: 'Review project brief',
  })
  await taskCheckbox.click()
  await expect(taskCheckbox).toBeChecked()
})

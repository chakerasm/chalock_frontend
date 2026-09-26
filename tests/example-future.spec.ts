import { expect, test } from '@playwright/test'

test('loads the Example future feature through MSW and TanStack Query', async ({
  page,
}) => {
  await page.goto('/example-future')

  await expect(
    page.getByRole('heading', { name: 'Example future' }),
  ).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Northstar' })).toBeVisible()
  await expect(page.getByRole('cell', { name: '32' })).toBeVisible()
})

test('opens global search with Ctrl+K, focuses it, and navigates', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('button', { name: 'Open global search' }),
  ).toBeVisible()
  await page.keyboard.press('ControlOrMeta+k')

  const searchDialog = page.getByRole('dialog', { name: 'Search' })
  const searchInput = searchDialog.getByRole('textbox', { name: 'Search' })

  await expect(searchDialog).toBeVisible()
  await expect(searchInput).toBeFocused()
  await searchInput.fill('example')
  await searchDialog.getByRole('button', { name: 'Example future' }).click()

  await expect(
    page.getByRole('heading', { name: 'Example future' }),
  ).toBeVisible()
})

test('exposes profile logout through the responsive navbar dropdown', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Profile menu' }).click()

  await expect(page.getByRole('menuitem', { name: 'Log out' })).toBeVisible()
})

test('opens the sidebar from the compact mobile navbar', async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation' }).click()

  const navigationDrawer = page.getByRole('dialog', {
    name: 'Primary navigation',
  })

  await expect(navigationDrawer).toBeVisible()
  await expect(
    navigationDrawer.getByRole('link', { name: 'Example future' }),
  ).toBeVisible()
})

test('opens an item detail page through its dedicated service', async ({
  page,
}) => {
  await page.goto('/example-future')
  await page.getByRole('link', { name: 'Northstar' }).click()

  await expect(page).toHaveURL(/\/example-future\/example-1$/)
  await expect(page.getByRole('heading', { name: 'Northstar' })).toBeVisible()
  await expect(page.getByRole('main').getByText('Alex Morgan')).toBeVisible()
  await expect(
    page.getByText('This page uses a dedicated detail endpoint'),
  ).toBeVisible()
})

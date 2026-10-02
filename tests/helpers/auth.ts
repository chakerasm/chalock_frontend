import { expect, type Page } from '@playwright/test'

export async function signIn(page: Page) {
  await page.goto('/login')
  await page.evaluate(() => {
    window.localStorage.setItem(
      'chalock.auth-session.v1',
      JSON.stringify({
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        user: {
          displayName: 'Focus Test',
          email: 'focus@example.com',
          id: 'focus-test-user',
        },
      }),
    )
  })
  await page.reload()
  await expect(page.getByRole('button', { name: 'Profile menu' })).toBeVisible()
}

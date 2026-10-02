import { expect, type Page } from '@playwright/test'

export async function signIn(page: Page) {
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      body: JSON.stringify({
        createdAt: '2026-01-01T00:00:00.000Z',
        email: 'focus@example.com',
        id: 'focus-test-user',
      }),
      contentType: 'application/json',
      status: 200,
    }),
  )
  await page.goto('/login')
  await page.evaluate(() => {
    window.localStorage.setItem(
      'chalock.auth-session.v1',
      JSON.stringify({
        accessToken: 'test-access-token',
        expiresIn: '1h',
        tokenType: 'Bearer',
        user: {
          createdAt: '2026-01-01T00:00:00.000Z',
          email: 'focus@example.com',
          id: 'focus-test-user',
        },
      }),
    )
  })
  await page.reload()
  await expect(page.getByRole('button', { name: 'Profile menu' })).toBeVisible()
}

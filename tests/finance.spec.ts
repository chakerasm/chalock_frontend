import { expect, test } from '@playwright/test'
import { APP_ROUTES } from '../src/lib/routes'
import { signIn } from './helpers/auth'

test('creates an account and records an income transaction', async ({
  page,
}) => {
  await page.addInitScript(() =>
    window.localStorage.removeItem('chalock.finance.v1'),
  )
  await signIn(page)
  await page.goto(APP_ROUTES.finance)

  await expect(page.getByRole('heading', { name: 'Finances' })).toBeVisible()
  await page.getByRole('button', { name: 'Accounts' }).click()
  await page.getByRole('button', { name: 'Add account' }).click()

  const accountDialog = page.getByRole('dialog')
  await accountDialog.getByLabel('Account name').fill('CIH Checking')
  await accountDialog
    .getByRole('spinbutton', { name: 'Opening balance' })
    .fill('1000')
  await accountDialog.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('CIH Checking')).toBeVisible()

  await page.getByRole('button', { name: 'Overview' }).click()
  await page.getByRole('button', { name: 'Add transaction' }).click()
  const transactionDialog = page.getByRole('dialog')
  await transactionDialog.getByLabel('Transaction type').selectOption('income')
  await transactionDialog
    .getByRole('spinbutton', { name: 'Amount' })
    .fill('8500')
  await transactionDialog.getByLabel('Title').fill('Salary')
  await transactionDialog.getByRole('button', { name: 'Save' }).click()

  await page.getByRole('button', { name: 'Overview' }).click()
  await expect(page.getByText(/^\+MAD\s*8,500\.00$/)).toBeVisible()
  await page.getByRole('button', { name: 'Transactions', exact: true }).click()
  await expect(page.locator('p').filter({ hasText: /^Salary$/ })).toBeVisible()
})

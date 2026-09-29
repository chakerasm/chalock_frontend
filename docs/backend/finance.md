# Finance API contract

## Scope and ownership

Finance is a personal planning feature, not an accounting system. It records
manual accounts, transactions, reusable categories, recurring commitments, and
savings goals. It does not connect to banks, process payments, reconcile
statements, calculate taxes, import transactions, convert currencies, or offer
financial advice.

The initial frontend keeps its data in a feature-owned local adapter. This
document is the authenticated backend contract that will replace that adapter.
Responses and errors use the common envelope conventions: errors are
`{ "code": "...", "message": "..." }`; successful resource responses are JSON
objects, and list endpoints return `{ "data": [...], "nextCursor": null }`
unless noted otherwise.

Calendar-only fields use `YYYY-MM-DD`. `createdAt` and `updatedAt` are UTC ISO
8601 timestamps. Monetary values are JSON numbers in the resource's ISO 4217
currency; do not round or convert values silently.

## Accounts

```json
{
  "id": "account-1",
  "name": "CIH Checking",
  "type": "checking",
  "currency": "MAD",
  "openingBalance": 12450,
  "isArchived": false,
  "createdAt": "2026-09-29T09:00:00.000Z",
  "updatedAt": "2026-09-29T09:00:00.000Z"
}
```

`type` is one of `checking`, `savings`, `cash`, `credit_card`, `wallet`, or
`other`. Accounts store no credentials, card numbers, or bank metadata.
`currentBalance` is a server-derived optional read field, never a manual write:

```text
openingBalance
+ income into the account
- expenses from the account
+ incoming transfers
- outgoing transfers
```

`GET /api/accounts` lists accounts; accept optional `archived=true|false`.
`GET /api/accounts/:accountId` reads one account. `POST /api/accounts` creates
an account from `name`, `type`, `currency`, and `openingBalance`. `PATCH
/api/accounts/:accountId` updates those fields or archives it with
`isArchived: true`. Prefer archival to hard delete so transaction history keeps
its account reference. Archived accounts cannot receive new transactions.

## Categories

```json
{
  "id": "expense-groceries",
  "name": "Groceries",
  "type": "expense",
  "icon": "shopping-basket",
  "isSystem": true
}
```

`type` is `expense` or `income`. System categories are read-only defaults;
custom categories can be created and edited. The initial defaults include
Housing, Groceries, Restaurants, Transport, Utilities, Subscriptions,
Shopping, Health, Fitness, Education, Entertainment, Travel, Personal, Other,
Salary, Freelance, Bonus, Refund, and Gift.

- `GET /api/finance/categories?type=expense|income`
- `POST /api/finance/categories`
- `PATCH /api/finance/categories/:categoryId`

## Transactions

```json
{
  "id": "transaction-1",
  "type": "expense",
  "amount": 120,
  "currency": "MAD",
  "accountId": "account-1",
  "categoryId": "expense-groceries",
  "title": "Weekly groceries",
  "description": "Market run",
  "transactionDate": "2026-09-29",
  "createdAt": "2026-09-29T09:00:00.000Z",
  "updatedAt": "2026-09-29T09:00:00.000Z"
}
```

`type` is `expense`, `income`, or `transfer`. Every transaction needs a
positive `amount`, a three-letter currency, a title (1-160 characters), source
account, and valid local transaction date. Description is optional and limited
to 2,000 characters.

An expense or income category must have the matching type. Transfers need a
`destinationAccountId`; its ID must differ from `accountId`, both accounts must
be accessible, and both must use the transaction currency. Transfers do not
count toward income, expense, net cash flow, spending-by-category, or total net
worth. The API does not perform foreign-exchange conversion.

- `GET /api/transactions`
- `GET /api/transactions/:transactionId`
- `POST /api/transactions`
- `PATCH /api/transactions/:transactionId`
- `DELETE /api/transactions/:transactionId` returns `204`

List filtering supports `accountId`, `categoryId`, `type`, `from`, `to`,
`search`, `cursor`, and `limit` (1-100). `from`/`to` are inclusive date-only
bounds. Search is a literal, case-insensitive title/description match. Sort
newest transaction date first, then newest update, then stable ID.

## Recurring transactions and subscriptions

```json
{
  "id": "recurring-1",
  "type": "expense",
  "title": "Rent",
  "amount": 3500,
  "currency": "MAD",
  "accountId": "account-1",
  "categoryId": "expense-housing",
  "frequency": "monthly",
  "nextOccurrenceDate": "2026-10-02",
  "isActive": true,
  "createdAt": "2026-09-29T09:00:00.000Z",
  "updatedAt": "2026-09-29T09:00:00.000Z"
}
```

Frequency is `weekly`, `monthly`, `quarterly`, `semiannual`, `annual`, or
`custom`. A custom schedule requires `customInterval: { value, unit }`, where
unit is `day`, `week`, `month`, or `year`. `endDate` is optional. Recurring
definitions do not create actual transactions automatically.

- `GET /api/recurring-transactions?active=true|false&type=income|expense`
- `POST /api/recurring-transactions`
- `PATCH /api/recurring-transactions/:recurringTransactionId`

Subscriptions remain owned by `/api/subscriptions`. Finance reads active
subscriptions into recurring monthly expense and upcoming-payment projections;
it must not duplicate them as recurring transaction rows automatically.

## Savings goals

```json
{
  "id": "savings-goal-1",
  "name": "Emergency fund",
  "targetAmount": 30000,
  "currentAmount": 18000,
  "currency": "MAD",
  "targetDate": "2027-06-01",
  "status": "active",
  "createdAt": "2026-09-29T09:00:00.000Z",
  "updatedAt": "2026-09-29T09:00:00.000Z"
}
```

`targetAmount` must be positive, and `currentAmount` must be zero or greater.
`status` is `active`, `completed`, `paused`, or `archived`. Return a completed
read model when current amount meets or exceeds target, but do not infer an
investment return or completion forecast.

- `GET /api/savings-goals?status=active|completed|paused|archived`
- `POST /api/savings-goals`
- `PATCH /api/savings-goals/:savingsGoalId`
- `DELETE /api/savings-goals/:savingsGoalId` archives where history is needed

## Summary and aggregation

The frontend may calculate compact current-month totals while its local data is
small. A server-side aggregate should become authoritative once transaction
history grows or users use several devices:

`GET /api/finance/summary?from=2026-09-01&to=2026-09-30`

The response must preserve currency boundaries instead of adding MAD, USD, or
other currencies together:

```json
{
  "from": "2026-09-01",
  "to": "2026-09-30",
  "byCurrency": [
    {
      "currency": "MAD",
      "income": 8500,
      "expenses": 5420,
      "net": 3080,
      "recurringExpenses": 1270,
      "topExpenseCategories": [
        { "categoryId": "expense-housing", "name": "Housing", "amount": 2500 }
      ]
    }
  ],
  "upcomingPayments": []
}
```

Only same-currency amounts may be aggregated. FX conversion needs an explicit
base currency, quoted rate source, rate date, and user-visible disclosure; it
is out of scope.

## Validation and errors

Return `401 UNAUTHENTICATED` for unauthenticated calls and hide inaccessible
resources behind the applicable `404`. Use these domain errors as applicable:

| Code | Condition |
| --- | --- |
| `ACCOUNT_NOT_FOUND` | Source or destination account is missing or inaccessible. |
| `TRANSACTION_NOT_FOUND` | Transaction is missing or inaccessible. |
| `CATEGORY_NOT_FOUND` | Category is missing or inaccessible. |
| `SAVINGS_GOAL_NOT_FOUND` | Savings goal is missing or inaccessible. |
| `INVALID_AMOUNT` | Amount is non-finite, zero, or negative where a positive amount is required. |
| `INVALID_CURRENCY` | Currency is not a supported ISO 4217 code. |
| `INVALID_TRANSFER` | Transfer shape or account currency is invalid. |
| `SAME_TRANSFER_ACCOUNT` | Transfer source and destination match. |
| `INVALID_DATE_RANGE` | Dates are malformed, inverted, or exceed supported range. |
| `INVALID_CATEGORY_TYPE` | A category does not match income/expense transaction type. |
| `ACCOUNT_ARCHIVED` | A write targets an archived account. |

## Future considerations

Bank synchronization, statement reconciliation, scheduled recurring
transaction creation, exchange rates, budgeting, reminders, monthly snapshots,
receipt/OCR ingestion, tax calculation, and transaction import are all out of
scope. Introduce each behind a separate contract rather than changing the
manual-transaction semantics above.

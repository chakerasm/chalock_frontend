# Subscriptions backend contract

The frontend stores subscriptions locally for the MVP, but this contract is the
replacement boundary for a future API. Calendar fields are date-only values
(`YYYY-MM-DD`); `createdAt` and `updatedAt` are ISO 8601 timestamps.

## Entity

`Subscription` contains `id`, `name`, optional `description`, non-negative
`amount`, ISO `currency`, `billingCycle`
(`weekly|monthly|quarterly|semiannual|annual|custom`), optional
`customBillingInterval` (`value` plus `day|week|month|year`), optional
`startDate`, required `nextBillingDate`, `status`
(`active|trial|paused|cancelled|expired`), optional category
(`software|entertainment|productivity|fitness|education|cloud|finance|utilities|membership|other`),
optional `paymentMethodId`, optional `trialEndDate`, `cancellationDate`,
boolean `autoRenew`, optional `websiteUrl`, `notes`, `createdAt`, and
`updatedAt`.

Names are required (1–120 characters), currency is a three-letter ISO code,
and a custom interval is required when `billingCycle=custom`. Trial records
must include `trialEndDate`. A referenced payment method must exist. Payment
methods are display metadata only; never store full card numbers.

## Endpoints

- `GET /api/subscriptions`
- `GET /api/subscriptions/:subscriptionId`
- `POST /api/subscriptions`
- `PATCH /api/subscriptions/:subscriptionId`
- `DELETE /api/subscriptions/:subscriptionId` (archive only if supported)

Normal cancellation should be a `PATCH` setting `status=cancelled` and
`cancellationDate`, preserving history. Optional filters are `status`,
`category`, `billingCycle`, `renewsBefore`, `renewsAfter`, and `search`.

```json
{
  "name": "ChatGPT Plus",
  "amount": 20,
  "currency": "USD",
  "billingCycle": "monthly",
  "nextBillingDate": "2026-10-12",
  "category": "software",
  "autoRenew": true,
  "paymentMethodId": "pm_123"
}
```

Response records include request fields plus `id`, `status`, `createdAt`, and
`updatedAt`.

## Errors and future work

Use the common API error envelope with codes:
`SUBSCRIPTION_NOT_FOUND`, `INVALID_BILLING_CYCLE`, `INVALID_BILLING_DATE`,
`INVALID_AMOUNT`, `INVALID_CURRENCY`, `PAYMENT_METHOD_NOT_FOUND`, and
`INVALID_STATUS_TRANSITION`.

Automatic renewal calculation, reminders, notifications, price history,
currency conversion, bank reconciliation, and receipt detection are out of
scope. Trial subscriptions are excluded from current recurring totals until
they become active. Normalized costs use 52 weeks/year and 365 days/year.
Monthly and annual totals must be grouped by currency; amounts with different
currency codes must never be added together because conversion is out of scope.
Calendar renewal mutation is intentionally not automatic. Historical spending
charts require a separate transaction or price-history source and cannot be
derived from the current subscription records alone.

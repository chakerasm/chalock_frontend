# Quick Add

Quick Add is a frontend orchestration surface. It deliberately reuses the owning resource endpoints rather than introducing a generic write model.

| Quick Add item | Endpoint |
| --- | --- |
| Task | `POST /api/tasks` |
| Note | `POST /api/notes` |
| Reminder | `POST /api/reminders` |
| Expense | `POST /api/transactions` |
| Subscription | `POST /api/subscriptions` |
| Time block | `POST /api/time-blocks` |

The frontend submits only the smallest useful payload for each resource. Default values, such as the user's default currency and planner duration, are supplied from `GET /api/me/settings`; full feature forms remain the place for advanced fields.

## Error handling

Each endpoint uses its resource's normal validation and authorization errors. A failed request leaves the Quick Add form open and preserves the entered values so users can correct or retry it.

## Why there is no `POST /api/quick-add`

Creation semantics, permissions, validation, and side effects belong to their respective domains. A unified endpoint should only be considered later if the product needs a genuinely cross-domain operation, such as natural-language capture that must be classified atomically by the backend.

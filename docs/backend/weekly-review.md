# Weekly Review API contract

The Weekly Review is an aggregate read model. It combines the user's permitted Tasks, Focus Sessions, Habits, Goals, Planner blocks, Finance transactions, and Subscriptions; it does not own copies of those resources.

## Aggregates

`GET /api/reviews/weekly?from=2026-09-28&to=2026-10-04` may return a server-calculated response:

```json
{
  "range": { "from": "2026-09-28", "to": "2026-10-04" },
  "tasks": {},
  "focus": {},
  "habits": {},
  "goals": {},
  "planner": {},
  "finance": {}
}
```

For the frontend-first implementation, the client assembles the review from existing domain endpoints and treats Finance as optional. A future backend aggregate should apply resource permissions before calculating results, use the user's configured timezone for week boundaries, and avoid inventing historical goal progress when no progress history exists.

## Reflections

Reflections are optional, per week, and may be persisted independently:

- `GET /api/weekly-reviews/:week`
- `PUT /api/weekly-reviews/:week`

```ts
type WeeklyReflection = {
  weekStart: string // Monday, YYYY-MM-DD
  wentWell?: string
  difficult?: string
  focusNextWeek?: string
  updatedAt: string
}
```

Validate a Monday `weekStart`, optional text fields of at most 2,000 characters, and user ownership. Suggested errors are `INVALID_REVIEW_WEEK`, `INVALID_WEEKLY_REFLECTION`, and `WEEKLY_REVIEW_NOT_FOUND`.

## Boundaries

Weekly ranges are Monday through Sunday in the user's IANA timezone. A task is carried forward by the normal task update endpoint; planning, goal, habit, and time-block actions likewise continue through their owning resource endpoints. No dedicated mutation endpoint is needed for these transitions.

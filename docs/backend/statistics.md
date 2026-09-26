# Statistics API contract

## Scope and rollout

Statistics helps a person understand recent activity without assigning a productivity score or predicting outcomes. The current frontend derives a small, date-bounded view from Task completion timestamps, completed Focus history, active Habit definitions and logs, and current Goals. This is appropriate while the browser holds a modest amount of history.

No Statistics backend is implemented yet. The endpoints below describe the authenticated, server-side aggregation contract to introduce as history becomes larger, cross-device, or expensive to retrieve.

## Shared query parameters

Every Statistics endpoint accepts these required parameters:

| Parameter | Format | Rules |
| --- | --- | --- |
| `from` | `YYYY-MM-DD` | Inclusive local calendar start date. |
| `to` | `YYYY-MM-DD` | Inclusive local calendar end date; must be on or after `from`. |
| `timezone` | IANA timezone | The effective timezone for bucketing instants into calendar days, for example `Africa/Casablanca`. |

Use date-bounded requests. The service must reject invalid dates, invalid timezones, and ranges wider than the product's supported maximum. Completed task and focus instants are grouped by `timezone`; Habit log dates remain their stored local calendar dates and are never shifted by timezone conversion.

Responses must describe activity only. Do not return inferred productivity scores, comparative labels, or predicted Goal completion dates.

## Endpoints

### `GET /api/statistics/summary`

Returns the compact metrics shown at the top of the Statistics page.

```json
{
  "range": { "from": "2026-09-20", "to": "2026-09-26", "timezone": "Africa/Casablanca" },
  "tasksCompleted": 6,
  "focus": { "totalSeconds": 8100, "sessionCount": 5 },
  "habits": {
    "completedOpportunities": 14,
    "scheduledOpportunities": 18,
    "completionRate": 0.7778
  }
}
```

`completionRate` is `null` when there were no eligible opportunities. The server must never divide by zero or substitute a misleading zero.

### `GET /api/statistics/focus`

Returns completed focus time only. Exclude active and paused timers and skipped or cancelled Pomodoro focus phases.

```json
{
  "totalSeconds": 8100,
  "sessionCount": 5,
  "averageSessionSeconds": 1620,
  "daily": [
    { "date": "2026-09-23", "totalSeconds": 1800, "sessionCount": 1 },
    { "date": "2026-09-24", "totalSeconds": 3600, "sessionCount": 2 }
  ],
  "mostProductiveDay": { "date": "2026-09-24", "totalSeconds": 3600 }
}
```

Return `mostProductiveDay: null` until activity exists on at least three distinct days in the requested range. Ties use the earliest local date. `averageSessionSeconds` is `null` when no qualifying session exists.

### `GET /api/statistics/tasks`

Returns task completion events, grouped by the local date of `completedAt`.

```json
{
  "completedCount": 6,
  "daily": [
    { "date": "2026-09-23", "completedCount": 2 },
    { "date": "2026-09-24", "completedCount": 1 }
  ],
  "priorityCounts": { "high": 2, "medium": 3, "low": 1 }
}
```

Count only Tasks with `status: "completed"` and a `completedAt` instant inside the requested local date range. Do not infer completion from `updatedAt` or due dates.

### `GET /api/statistics/habits`

Returns scheduled Habit completion and consistency data. Daily and weekday Habits contribute one opportunity per scheduled local day after creation. Weekly-target Habits contribute one opportunity only for a fully elapsed Monday-to-Sunday week wholly inside the requested range; partial weeks should not be shown as misses.

```json
{
  "completionRate": 0.7778,
  "completedOpportunities": 14,
  "scheduledOpportunities": 18,
  "consistency": [
    { "date": "2026-09-23", "completed": 2, "scheduled": 3, "completionRate": 0.6667 }
  ],
  "currentStreaks": [
    { "habitId": "habit-reading", "name": "Reading", "count": 4, "unit": "days" }
  ]
}
```

For daily and weekday Habits, streaks count consecutive scheduled dates with completed logs while skipping unscheduled dates. For weekly targets, streaks count completed weeks. An unfinished current day or week must not break an existing streak. Return no score or qualitative label for incomplete activity.

## Goals

Statistics uses the existing `GET /api/goals?status=active` read model for the current Goal overview. It displays the stored or task-derived progress percentage only. It must not forecast a completion date, pace, or likelihood.

## Client aggregation now vs. backend aggregation later

Initially, the client can safely calculate the page when it has a bounded local snapshot:

- filter Task completion timestamps and completed Focus session history by the selected range;
- group those records into local dates using the device's effective IANA timezone;
- calculate small-range daily/weekday Habit opportunities from the known schedule and logs;
- reuse the existing Goal progress read model.

Move aggregation to the backend when Focus history is no longer locally capped, users access data on multiple devices, date ranges grow, or the client would otherwise need to download all historic Tasks and Habit logs. The backend then becomes authoritative for timezone bucketing, Habit streaks, weekly-target completion, and query performance. Cache keys should include `from`, `to`, and `timezone`; invalidate affected summaries after Task, Focus, or Habit writes.

## Errors

Errors use `{ "code": "...", "message": "..." }`.

| Status | Code | Condition |
| --- | --- | --- |
| `400` | `INVALID_STATISTICS_RANGE` | Invalid dates, `from` after `to`, or an unsupported range size. |
| `400` | `INVALID_TIMEZONE` | `timezone` is not a valid IANA identifier. |
| `401` | `UNAUTHENTICATED` | No valid session. |
| `422` | `STATISTICS_UNAVAILABLE` | A required aggregate cannot be calculated consistently. |
